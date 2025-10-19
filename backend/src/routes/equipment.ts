import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const clienteId = (req.query.cliente_id as string) || '';
  const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('equipos').select('*', { count: 'exact' });
    if (clienteId) query = query.eq('cliente_id', clienteId);
  if (search) query = query.or(`modelo.ilike.%${search}%,serial.ilike.%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: 'Error al listar equipos' });
    return res.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
  try {
    const equipo = req.body || {};
    if (!equipo.cliente_id || !equipo.numero_serie) return res.status(400).json({ error: 'cliente_id y numero_serie requeridos' });
    const { data: exist } = await supabaseAdmin.from('equipos').select('id').eq('numero_serie', equipo.numero_serie).maybeSingle();
    if (exist) return res.status(400).json({ error: 'Número de serie ya existe' });
    const { data, error } = await supabaseAdmin.from('equipos').insert(equipo).select().single();
    if (error) return res.status(400).json({ error: 'Error al crear equipo' });
    return res.status(201).json({ data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabaseAdmin
    .from('equipos')
    .select('*, cliente:clientes(id, nombre, nit, email), ordenes:ordenes_trabajo(*)')
    .eq('id', id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Equipo no encontrado' });
  return res.json({ data });
});

router.patch('/:id', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};
  const { data, error } = await supabaseAdmin.from('equipos').update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: 'Error al actualizar equipo' });
  return res.json({ data });
});

router.delete('/:id', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
  const id = req.params.id;
  const { data: ord } = await supabaseAdmin.from('ordenes_trabajo').select('id').eq('equipo_id', id).limit(1);
  if (ord && ord.length > 0) return res.status(400).json({ error: 'No se puede eliminar: equipo con órdenes asociadas' });
  const { data, error } = await supabaseAdmin.from('equipos').delete().eq('id', id).select().single();
  if (error) return res.status(400).json({ error: 'Error al eliminar equipo' });
  return res.json({ data });
});

export default router;
