import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const BUCKET = process.env.EVIDENCE_BUCKET || 'evidencias';
// Listar evidencias por orden
router.get('/', requireAuth, async (req, res) => {
    const ordenId = req.query.orden_id;
    if (!ordenId)
        return res.status(400).json({ error: 'orden_id requerido' });
    const { data, error } = await supabaseAdmin.from('evidencias').select('*').eq('orden_id', ordenId).order('created_at', { ascending: false });
    if (error)
        return res.status(500).json({ error: 'Error al listar evidencias' });
    return res.json({ data });
});
// Subir evidencia (multipart/form-data) => Storage + fila en DB
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { orden_id, descripcion } = req.body;
        if (!file || !orden_id)
            return res.status(400).json({ error: 'file y orden_id son requeridos' });
        const filename = `${orden_id}/${Date.now()}-${file.originalname}`;
        const { data: upRes, error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(filename, file.buffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.mimetype,
        });
        if (upErr)
            return res.status(500).json({ error: 'Error subiendo archivo' });
        const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename);
        const url_publica = pub.publicUrl;
        const { data, error } = await supabaseAdmin
            .from('evidencias')
            .insert({ orden_id, url: url_publica, nombre_archivo: file.originalname, descripcion })
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: 'Error guardando evidencia' });
        return res.status(201).json({ data });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Eliminar evidencia (borra archivo en storage si es posible y el registro)
router.delete('/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    try {
        const { data: ev, error: evErr } = await supabaseAdmin.from('evidencias').select('*').eq('id', id).single();
        if (evErr || !ev)
            return res.status(404).json({ error: 'Evidencia no encontrada' });
        // Intentar derivar path en bucket a partir de URL pública
        const url = ev.url;
        const idx = url.indexOf(`/${BUCKET}/`);
        if (idx !== -1) {
            const path = url.substring(idx + BUCKET.length + 2); // salta '/{bucket}/'
            await supabaseAdmin.storage.from(BUCKET).remove([path]);
        }
        const { data, error } = await supabaseAdmin.from('evidencias').delete().eq('id', id).select().single();
        if (error)
            return res.status(400).json({ error: 'Error al eliminar evidencia' });
        return res.json({ data });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
export default router;
