import { Router } from 'express';
import { usuariosController } from './usuarios.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', usuariosController.list);
router.get('/:id', usuariosController.getById);
router.post('/', usuariosController.create);
router.patch('/:id', usuariosController.update);
router.delete('/:id', usuariosController.delete);
router.post('/:id/password', usuariosController.changePassword);

export default router;
