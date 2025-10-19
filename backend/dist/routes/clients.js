import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRoles } from '../middleware/auth';
const router = Router();
// Listar clientes
router.get('/', requireAuth, requireRoles(['admin', 'coordinador', 'gerente']), async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        let query = supabaseAdmin.from('clientes').select('*', { count: 'exact' });
        if (search) {
            query = query.or(`nombre_empresa.ilike.%${search}%,nit.ilike.%${search}%,contacto.ilike.%${search}%`);
        }
        const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
        if (error)
            return res.status(500).json({ error: 'Error al listar clientes' });
        return res.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Crear cliente
router.post('/', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
    try {
        const cliente = req.body || {};
        if (!cliente.nombre_empresa || !cliente.nit)
            return res.status(400).json({ error: 'nombre_empresa y nit son requeridos' });
        const { data: exist, error: existErr } = await supabaseAdmin.from('clientes').select('id').eq('nit', cliente.nit).maybeSingle();
        if (existErr)
            return res.status(500).json({ error: 'Error al validar nit' });
        if (exist)
            return res.status(400).json({ error: 'NIT ya registrado' });
        const { data, error } = await supabaseAdmin.from('clientes').insert(cliente).select().single();
        if (error)
            return res.status(400).json({ error: 'Error al crear cliente' });
        return res.status(201).json({ data });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Obtener/Actualizar/Eliminar cliente por id
router.get('/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    const { data, error } = await supabaseAdmin.from('clientes').select('*, equipos(*)').eq('id', id).single();
    if (error || !data)
        return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json({ data });
});
router.patch('/:id', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
    const id = req.params.id;
    const updates = req.body || {};
    if (updates.nit) {
        const { data: exist } = await supabaseAdmin.from('clientes').select('id').eq('nit', updates.nit).neq('id', id).maybeSingle();
        if (exist)
            return res.status(400).json({ error: 'NIT ya registrado' });
    }
    const { data, error } = await supabaseAdmin.from('clientes').update(updates).eq('id', id).select().single();
    if (error)
        return res.status(400).json({ error: 'Error al actualizar cliente' });
    return res.json({ data });
});
router.delete('/:id', requireAuth, requireRoles(['admin', 'coordinador']), async (req, res) => {
    const id = req.params.id;
    const { data: eq } = await supabaseAdmin.from('equipos').select('id').eq('cliente_id', id).limit(1);
    if (eq && eq.length > 0)
        return res.status(400).json({ error: 'No se puede eliminar: cliente con equipos asociados' });
    const { data, error } = await supabaseAdmin.from('clientes').update({ activo: false }).eq('id', id).select().single();
    if (error)
        return res.status(400).json({ error: 'Error al eliminar cliente' });
    return res.json({ data });
});
export default router;
