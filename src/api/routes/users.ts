import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';
import { can } from '../middleware/can';
import { HttpError } from '../middleware/errorHandler';
import { getUserById, listUsers } from '../services/userService';

const router = Router();

router.get('/me', authRequired, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Autenticación requerida');
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado');
    }

    return res.json({
      id: user.id,
      correo: user.correo,
      rol: user.rol,
    });
  } catch (error) {
    return next(error);
  }
});

router.use(authRequired);
router.use(can('usuarios', 'read'));

router.get('/', async (req, res, next) => {
  try {
    const page = Number.parseInt((req.query.page as string) ?? '1', 10);
    const limit = Number.parseInt((req.query.limit as string) ?? '10', 10);
    const search = (req.query.search as string) ?? '';
    const rol = (req.query.rol as string) ?? '';
    const activoParam = (req.query.activo as string) ?? '';

    const safePage = Number.isNaN(page) || page <= 0 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit <= 0 ? 10 : Math.min(limit, 100);

    const { data, count } = await listUsers({
      page: safePage,
      limit: safeLimit,
      search,
      rol: rol || undefined,
      activo: activoParam === '' ? undefined : activoParam === 'true',
    });

    return res.json({
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / safeLimit) : 0,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getUserById(id);
    if (!data) {
      throw new HttpError(404, 'Usuario no encontrado');
    }

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

export default router;
