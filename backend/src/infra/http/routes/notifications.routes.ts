import { Router } from 'express';
// Asegúrate de que NotificationsController exporte una instancia o métodos estáticos correctamente
import { NotificationsController } from '../controllers/NotificationsController.js'; 
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

// Middleware global de autenticación para notificaciones
router.use(authenticate);

// Rutas
router.get('/', NotificationsController.list);
router.patch('/:id/read', NotificationsController.markAsRead);
router.patch('/read-all', NotificationsController.markAllAsRead);

export default router;
