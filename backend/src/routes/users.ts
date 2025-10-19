import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

// Listar usuarios (admin, coordinador)
router.get('/', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const search = (req.query.search as string) || '';
    const rol = (req.query.rol as string) || '';
    const activo = req.query.activo as string | undefined;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('usuarios').select('*', { count: 'exact' });
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (rol) query = query.eq('rol', rol);
    if (activo !== undefined && activo !== '') query = query.eq('activo', activo === 'true');

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: 'Error al listar usuarios' });

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
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario (admin)
router.post('/', requireAuth, requireRoles(['admin']), async (req, res) => {
  try {
    const { email, password, nombre, rol, telefono, empresa, activo = true } = req.body || {};
    const rolesValidos = ['admin', 'coordinador', 'tecnico', 'gerente', 'cliente'];
    if (!email || !password || !nombre || !rol) return res.status(400).json({ error: 'Faltan campos requeridos' });
    if (!rolesValidos.includes(rol)) return res.status(400).json({ error: 'Rol inválido' });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol },
    });
    if (authError || !authData?.user) return res.status(400).json({ error: `Error al crear usuario: ${authError?.message}` });

    const { data: usuario, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .insert({ id: authData.user.id, email, nombre, rol, telefono, empresa, activo })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Error al crear perfil de usuario' });
    }

    return res.status(201).json({ data: usuario, message: 'Usuario creado exitosamente' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario por id
router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const requester = req.authUser!;
  try {
    const canRead = requester.id === id || ['admin', 'coordinador', 'gerente'].includes(req.userRole!);
    if (!canRead) return res.status(403).json({ error: 'Permisos insuficientes' });

    const { data, error } = await supabaseAdmin.from('usuarios').select('*').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar usuario por id
router.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const requester = req.authUser!;
  const updates = req.body || {};
  try {
    const isSelf = requester.id === id;
    const isAdmin = req.userRole === 'admin';
    if (!isSelf && !['admin', 'coordinador'].includes(req.userRole!)) return res.status(403).json({ error: 'Permisos insuficientes' });
    if (!isAdmin) {
      delete updates.rol; // solo admin cambia rol/activo
      delete updates.activo;
    }

    const { data, error } = await supabaseAdmin.from('usuarios').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: 'Error al actualizar usuario' });
    return res.json({ data, message: 'Usuario actualizado' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar (soft) usuario
router.delete('/:id', requireAuth, requireRoles(['admin']), async (req, res) => {
  const id = req.params.id;
  try {
    const { data, error } = await supabaseAdmin.from('usuarios').update({ activo: false }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: 'Error al eliminar usuario' });
    return res.json({ data, message: 'Usuario desactivado' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
