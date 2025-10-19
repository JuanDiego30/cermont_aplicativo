import { supabasePublic, supabaseAdmin } from '../config/supabase';
export async function requireAuth(req, res, next) {
    try {
        const auth = req.headers['authorization'];
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        const token = auth.substring('Bearer '.length);
        const { data: userData, error } = await supabasePublic.auth.getUser(token);
        if (error || !userData?.user) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        const userId = userData.user.id;
        const { data: perfil, error: perfilErr } = await supabaseAdmin
            .from('usuarios')
            .select('id, email, rol')
            .eq('id', userId)
            .single();
        if (perfilErr || !perfil) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        req.authUser = { id: userId, email: perfil.email, role: perfil.rol };
        req.userRole = perfil.rol;
        return next();
    }
    catch (e) {
        console.error('Auth middleware error', e);
        return res.status(500).json({ error: 'Error de autenticación' });
    }
}
export function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Permisos insuficientes' });
        }
        next();
    };
}
