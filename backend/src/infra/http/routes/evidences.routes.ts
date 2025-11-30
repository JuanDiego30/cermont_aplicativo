/**
 * Rutas de Evidencias
 *
 * @file backend/src/infra/http/routes/evidences.routes.ts
 */

import { Router } from 'express';
import { EvidencesController } from '../controllers/EvidencesController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/evidences:
 *   post:
 *     summary: Subir evidencia fotográfica
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - file
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [before, during, after]
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Evidencia subida exitosamente
 *       400:
 *         description: Archivo inválido o datos faltantes
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authorize([PERMISSIONS.ORDERS_UPDATE]),
  EvidencesController.upload
);

/**
 * @swagger
 * /api/evidences/{id}/approve:
 *   post:
 *     summary: Aprobar evidencia
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evidencia aprobada
 *       404:
 *         description: Evidencia no encontrada
 */
router.post(
  '/:id/approve',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.approve
);

/**
 * @swagger
 * /api/evidences/{id}/reject:
 *   post:
 *     summary: Rechazar evidencia
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evidencia rechazada
 *       404:
 *         description: Evidencia no encontrada
 */
router.post(
  '/:id/reject',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.reject
);

/**
 * @swagger
 * /api/evidences/order/{orderId}:
 *   get:
 *     summary: Obtener evidencias de una orden
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [before, during, after]
 *     responses:
 *       200:
 *         description: Lista de evidencias
 *       404:
 *         description: Orden no encontrada
 */
router.get(
  '/order/:orderId',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  EvidencesController.getByOrder
);

/**
 * @swagger
 * /api/evidences/{id}:
 *   delete:
 *     summary: Eliminar evidencia
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evidencia eliminada
 *       404:
 *         description: Evidencia no encontrada
 */
router.delete(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  EvidencesController.remove
);

/**
 * @swagger
 * /api/evidences/sync:
 *   post:
 *     summary: Sincronizar evidencias offline
 *     tags: [Evidences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evidences
 *             properties:
 *               evidences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     base64:
 *                       type: string
 *                     type:
 *                       type: string
 *                     capturedAt:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Evidencias sincronizadas
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/sync',
  authorize([PERMISSIONS.ORDERS_UPDATE]),
  EvidencesController.syncOffline
);

export default router;
