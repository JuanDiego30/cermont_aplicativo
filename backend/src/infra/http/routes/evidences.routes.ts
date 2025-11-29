import { Router } from 'express';
import { EvidencesController } from '../controllers/EvidencesController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/evidences
 * @desc    Subir evidencia
 * @access  Private
 */
router.post(
  '/',
  authorize([PERMISSIONS.ORDERS_UPDATE]), // Usar permiso de orders ya que las evidencias están relacionadas
  EvidencesController.upload
);

/**
 * @route   POST /api/evidences/:id/approve
 * @desc    Aprobar evidencia
 * @access  Private
 */
router.post(
  '/:id/approve',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.approve
);

/**
 * @route   POST /api/evidences/:id/reject
 * @desc    Rechazar evidencia
 * @access  Private
 */
router.post(
  '/:id/reject',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.reject
);

/**
 * @route   GET /api/evidences/order/:orderId
 * @desc    Obtener evidencias de una orden
 * @access  Private
 */
router.get(
  '/order/:orderId',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  EvidencesController.getByOrder
);

/**
 * @route   DELETE /api/evidences/:id
 * @desc    Eliminar evidencia
 * @access  Private
 */
router.delete(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.remove
);

/**
 * @route   POST /api/evidences/sync
 * @desc    Sincronizar evidencias offline
 * @access  Private
 */
router.post(
  '/sync',
  authorize([PERMISSIONS.ORDERS_UPDATE]),
  EvidencesController.syncOffline
);

export default router;
