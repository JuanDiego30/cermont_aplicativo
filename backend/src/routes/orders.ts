import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Helpers
function canViewAll(role: string) {
  return ['admin', 'coordinador', 'gerente'].includes(role);
}

function canCreate(role: string) {
  return ['admin', 'coordinador', 'gerente', 'tecnico', 'cliente'].includes(role);
}

function canUpdateAll(role: string) {
  return ['admin', 'coordinador', 'gerente'].includes(role);
}

function canDelete(role: string) {
  return ['admin', 'gerente'].includes(role);
}

function canAssign(role: string) {
  return ['admin', 'coordinador', 'gerente'].includes(role);
}

function canApprove(role: string) {
  return ['admin', 'coordinador', 'gerente'].includes(role);
}

// GET /orders - lista con filtros y paginación
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const estado = (req.query.estado as string) || '';
    const prioridad = (req.query.prioridad as string) || '';
    const clienteId = (req.query.cliente_id as string) || '';
    const tecnicoId = (req.query.tecnico_id as string) || '';
    const search = (req.query.search as string) || '';

    let query = supabaseAdmin
      .from('ordenes_trabajo')
      .select(
        `*,
        cliente:clientes(id, nombre, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, modelo, serial)
      `,
        { count: 'exact' }
      );

    // Filtros según rol
    const role = req.userRole!;
    const userId = req.authUser!.id;
    if (!canViewAll(role)) {
      if (role === 'cliente') {
        query = query.eq('cliente_id', userId);
      } else if (role === 'tecnico') {
        query = query.eq('tecnico_asignado_id', userId);
      }
    }

    // Filtros opcionales
    if (estado) query = query.eq('estado', estado);
    if (prioridad) query = query.eq('prioridad', prioridad);
    if (clienteId) query = query.eq('cliente_id', clienteId);
    if (tecnicoId) query = query.eq('tecnico_asignado_id', tecnicoId);
    if (search) query = query.or(`numero_orden.ilike.%${search}%,descripcion.ilike.%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) return res.status(500).json({ error: 'Error al obtener órdenes' });

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (e) {
    console.error('GET /orders error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /orders - crear orden
router.post('/', requireAuth, async (req, res) => {
  try {
    const role = req.userRole!;
    if (!canCreate(role)) return res.status(403).json({ error: 'Sin permisos para crear órdenes' });

  const { cliente_id, equipo_id, tipo_orden, descripcion, prioridad = 'normal', fecha_programada, titulo, tipo_equipo, ubicacion } = req.body || {};
    if (!cliente_id || !tipo_orden || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos requeridos: cliente_id, tipo_orden, descripcion' });
    }

    const { data, error } = await supabaseAdmin
      .from('ordenes_trabajo')
      .insert({
        cliente_id,
        equipo_id,
        tipo_orden,
        titulo,
        tipo_equipo,
        descripcion,
        ubicacion,
        prioridad,
        estado: 'pendiente',
        fecha_programada,
        creado_por: req.authUser!.id,
      })
      .select(
        `*,
        cliente:clientes(id, nombre, nit),
        equipo:equipos(id, tipo, modelo, serial)
      `
      )
      .single();

    if (error) return res.status(500).json({ error: 'Error al crear orden' });
    return res.status(201).json({ data });
  } catch (e) {
    console.error('POST /orders error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /orders/:id - detalle orden
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.userRole!;
    const userId = req.authUser!.id;

    const { data: orden, error } = await supabaseAdmin
      .from('ordenes_trabajo')
      .select(`
        *,
        cliente:clientes(*),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(*),
        evidencias(*),
        historial:historial_ordenes(*, usuario:usuarios(id, nombre, email))
      `)
      .eq('id', id)
      .single();

    if (error || !orden) return res.status(404).json({ error: 'Orden no encontrada' });

    if (!canViewAll(role)) {
      if (role === 'cliente' && orden.cliente_id !== userId) {
        return res.status(403).json({ error: 'Sin acceso a esta orden' });
      }
      if (role === 'tecnico' && orden.tecnico_asignado_id !== userId) {
        return res.status(403).json({ error: 'Sin acceso a esta orden' });
      }
    }

    return res.json({ data: orden });
  } catch (e) {
    console.error('GET /orders/:id error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /orders/:id - actualizar orden
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.userRole!;
    const userId = req.authUser!.id;

    const { data: ordenActual, error: errOrden } = await supabaseAdmin
      .from('ordenes_trabajo')
      .select('*')
      .eq('id', id)
      .single();
    if (errOrden || !ordenActual) return res.status(404).json({ error: 'Orden no encontrada' });

    if (!canUpdateAll(role)) {
      // Técnico solo puede actualizar órdenes asignadas a él
      if (role === 'tecnico' && ordenActual.tecnico_asignado_id !== userId) {
        return res.status(403).json({ error: 'Solo puedes actualizar órdenes asignadas a ti' });
      }
      // Otros roles sin permiso global no pueden
      if (role !== 'tecnico') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
      }
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from('ordenes_trabajo')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, modelo, serial)
      `)
      .single();

    if (error) return res.status(500).json({ error: 'Error al actualizar orden' });
    return res.json({ data });
  } catch (e) {
    console.error('PATCH /orders/:id error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /orders/:id - eliminar orden
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const role = req.userRole!;
    if (!canDelete(role)) return res.status(403).json({ error: 'Sin permisos para eliminar órdenes' });

    const id = req.params.id;
    const { data: orden, error: ordErr } = await supabaseAdmin
      .from('ordenes_trabajo')
      .select('id, numero_orden')
      .eq('id', id)
      .single();
    if (ordErr || !orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const { error } = await supabaseAdmin.from('ordenes_trabajo').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Error al eliminar orden' });

    return res.json({ message: `Orden ${orden.numero_orden} eliminada exitosamente` });
  } catch (e) {
    console.error('DELETE /orders/:id error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /orders/:id/assign - asignar técnico
router.post('/:id/assign', requireAuth, async (req, res) => {
  try {
    const role = req.userRole!;
    if (!canAssign(role)) return res.status(403).json({ error: 'Sin permisos para asignar órdenes' });

    const id = req.params.id;
    const { tecnico_id, fecha_programada } = req.body || {};
    if (!tecnico_id) return res.status(400).json({ error: 'El campo tecnico_id es requerido' });

    const { data: tecnico, error: errTec } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, rol')
      .eq('id', tecnico_id)
      .single();
    if (errTec || !tecnico) return res.status(404).json({ error: 'Técnico no encontrado' });
    if (tecnico.rol !== 'tecnico') return res.status(400).json({ error: 'El usuario seleccionado no es un técnico' });

    const updateData: any = { tecnico_asignado_id: tecnico_id, estado: 'asignada', updated_at: new Date().toISOString() };
    if (fecha_programada) updateData.fecha_programada = fecha_programada;

    const { data, error } = await supabaseAdmin
      .from('ordenes_trabajo')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, modelo, serial)
      `)
      .single();
    if (error) return res.status(500).json({ error: 'Error al asignar técnico' });

    return res.json({ data, message: `Orden asignada a ${tecnico.nombre}` });
  } catch (e) {
    console.error('POST /orders/:id/assign error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /orders/:id/status - cambiar estado
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.userRole!;
    const userId = req.authUser!.id;
    const { estado } = req.body || {};
    if (!estado) return res.status(400).json({ error: 'El campo estado es requerido' });

    const estadosValidos = ['pendiente', 'asignada', 'en_progreso', 'completada', 'cancelada', 'aprobada'];
    if (!estadosValidos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

    const { data: ordenActual, error: errOrden } = await supabaseAdmin
      .from('ordenes_trabajo')
      .select('*')
      .eq('id', id)
      .single();
    if (errOrden || !ordenActual) return res.status(404).json({ error: 'Orden no encontrada' });

    let allowed = false;
    if (role === 'tecnico' && ordenActual.tecnico_asignado_id === userId) {
      allowed = true; // técnico en su orden
    }
    if (canUpdateAll(role)) {
      allowed = true;
    }
    if (estado === 'completada' && !canApprove(role)) {
      allowed = false;
    }
    if (!allowed) return res.status(403).json({ error: 'Sin permisos para cambiar el estado de esta orden' });

    const updateData: any = { estado, updated_at: new Date().toISOString() };
    if (estado === 'completada') updateData.fecha_finalizacion = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('ordenes_trabajo')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        cliente:clientes(id, nombre_empresa, nit),
        tecnico_asignado:usuarios!ordenes_trabajo_tecnico_asignado_id_fkey(id, nombre, email),
        equipo:equipos(id, tipo, marca, modelo)
      `)
      .single();
    if (error) return res.status(500).json({ error: 'Error al actualizar estado' });

    return res.json({ data, message: `Estado cambiado a: ${estado}` });
  } catch (e) {
    console.error('PATCH /orders/:id/status error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
