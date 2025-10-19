import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
    const ordenId = req.query.orden_id;
    if (!ordenId)
        return res.status(400).json({ error: 'orden_id requerido' });
    const { data, error } = await supabaseAdmin
        .from('historial_ordenes')
        .select('*, usuario:usuarios(id, email, nombre, rol)')
        .eq('orden_id', ordenId)
        .order('timestamp', { ascending: false });
    if (error)
        return res.status(500).json({ error: 'Error al obtener historial' });
    return res.json({ data });
});
export default router;
