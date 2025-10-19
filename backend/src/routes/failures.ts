import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

// Listar fallas con filtros (tipo_equipo, severidad, search, activo)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const tipo_equipo = (req.query.tipo_equipo as string) || '';
    const severidad = (req.query.severidad as string) || '';
    const activo = req.query.activo as string | undefined;
    const search = (req.query.search as string) || '';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from('fallas').select('*', { count: 'exact' });
    if (tipo_equipo) query = query.eq('tipo_equipo', tipo_equipo);
    if (severidad) query = query.eq('severidad', severidad);
    if (activo !== undefined && activo !== '') query = query.eq('activo', activo === 'true');
    if (search) query = query.or(`codigo.ilike.%${search}%,nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);

    const { data, error, count } = await query.order('updated_at', { ascending: false }).range(from, to);
    if (error) return res.status(500).json({ error: 'Error al listar fallas' });

    return res.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (e) {
    console.error('GET /failures error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear falla (admin/coordinador/gerente)
router.post('/', requireAuth, requireRoles(['admin', 'coordinador', 'gerente']), async (req, res) => {
  try {
    const falla = req.body || {};
    if (!falla.codigo || !falla.nombre || !falla.tipo_equipo) {
      return res.status(400).json({ error: 'codigo, nombre y tipo_equipo son requeridos' });
    }
    const { data: exist } = await supabaseAdmin.from('fallas').select('id').eq('codigo', falla.codigo).maybeSingle();
    if (exist) return res.status(400).json({ error: 'Código de falla ya existe' });

    const { data, error } = await supabaseAdmin.from('fallas').insert(falla).select().single();
    if (error) return res.status(400).json({ error: 'Error al crear falla' });
    return res.status(201).json({ data });
  } catch (e) {
    console.error('POST /failures error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una falla
router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('fallas').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: 'Falla no encontrada' });
  return res.json({ data });
});

// Actualizar falla
router.patch('/:id', requireAuth, requireRoles(['admin', 'coordinador', 'gerente']), async (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};
  if (updates.codigo) {
    const { data: exist } = await supabaseAdmin.from('fallas').select('id').eq('codigo', updates.codigo).neq('id', id).maybeSingle();
    if (exist) return res.status(400).json({ error: 'Código de falla ya existe' });
  }
  const { data, error } = await supabaseAdmin.from('fallas').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: 'Error al actualizar falla' });
  return res.json({ data });
});

// Desactivar/Eliminar falla (soft delete)
router.delete('/:id', requireAuth, requireRoles(['admin', 'coordinador', 'gerente']), async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin.from('fallas').update({ activo: false }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: 'Error al eliminar falla' });
  return res.json({ data });
});

// Asociar fallas a una orden
router.post('/assign', requireAuth, async (req, res) => {
  try {
    const { orden_id, falla_ids } = req.body || {} as { orden_id: string; falla_ids: string[] };
    if (!orden_id || !Array.isArray(falla_ids) || falla_ids.length === 0) {
      return res.status(400).json({ error: 'orden_id y falla_ids son requeridos' });
    }

    // Validar que las fallas existan
    const { data: existentes } = await supabaseAdmin.from('fallas').select('id').in('id', falla_ids);
    const existentesSet = new Set((existentes || []).map((f) => f.id));
    const validas = falla_ids.filter((id) => existentesSet.has(id));
    if (validas.length === 0) return res.status(400).json({ error: 'No hay fallas válidas para asociar' });

    // Inserción ignorando duplicados (on conflict PK compuesta)
    const payload = validas.map((falla_id) => ({ orden_id, falla_id }));
    const { error } = await supabaseAdmin.from('orden_fallas').upsert(payload, { onConflict: 'orden_id,falla_id' });
    if (error) return res.status(400).json({ error: 'Error al asociar fallas' });

    return res.json({ message: 'Fallas asociadas correctamente' });
  } catch (e) {
    console.error('POST /failures/assign error', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Listar fallas de una orden
router.get('/by-order/:ordenId', requireAuth, async (req, res) => {
  const ordenId = req.params.ordenId;
  const { data, error } = await supabaseAdmin
    .from('orden_fallas')
    .select('falla:fallas(*)')
    .eq('orden_id', ordenId);
  if (error) return res.status(500).json({ error: 'Error al obtener fallas de la orden' });
  return res.json({ data: (data || []).map((r: any) => r.falla) });
});

export default router;
