/**
 * Rutas de Kits
 *
 * @file backend/src/infra/http/routes/kits.routes.ts
 */

import { Router } from 'express';
import { KitsController } from '../controllers/KitsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/kits:
 *   get:
 *     summary: Listar kits con filtros y paginación
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de kits
 *       401:
 *         description: No autenticado
 */
router.get('/', authorize([PERMISSIONS.KITS_VIEW]), KitsController.list);

/**
 * @swagger
 * /api/kits/stats:
 *   get:
 *     summary: Obtener estadísticas de kits
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de kits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 byCategory:
 *                   type: object
 *                 averagePrice:
 *                   type: number
 *       401:
 *         description: No autenticado
 */
router.get('/stats', authorize([PERMISSIONS.KITS_VIEW]), KitsController.getStats);

/**
 * @swagger
 * /api/kits/category/{category}:
 *   get:
 *     summary: Obtener kits por categoría
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de kits de la categoría
 *       401:
 *         description: No autenticado
 */
router.get(
  '/category/:category',
  authorize([PERMISSIONS.KITS_VIEW]),
  KitsController.getByCategory
);

/**
 * @swagger
 * /api/kits/{id}:
 *   get:
 *     summary: Obtener kit por ID
 *     tags: [Kits]
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
 *         description: Detalle del kit
 *       404:
 *         description: Kit no encontrado
 */
router.get('/:id', authorize([PERMISSIONS.KITS_VIEW]), KitsController.getById);

/**
 * @swagger
 * /api/kits:
 *   post:
 *     summary: Crear nuevo kit
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - items
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Kit creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.create);

/**
 * @swagger
 * /api/kits/{id}:
 *   put:
 *     summary: Actualizar kit
 *     tags: [Kits]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Kit actualizado
 *       404:
 *         description: Kit no encontrado
 */
router.put('/:id', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.update);

/**
 * @swagger
 * /api/kits/{id}:
 *   delete:
 *     summary: Eliminar kit (soft delete)
 *     tags: [Kits]
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
 *         description: Kit eliminado
 *       404:
 *         description: Kit no encontrado
 */
router.delete('/:id', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.delete);

/**
 * @swagger
 * /api/kits/{id}/duplicate:
 *   post:
 *     summary: Duplicar kit existente
 *     tags: [Kits]
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
 *       201:
 *         description: Kit duplicado
 *       404:
 *         description: Kit no encontrado
 */
router.post('/:id/duplicate', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.duplicate);

/**
 * @swagger
 * /api/kits/suggest:
 *   post:
 *     summary: Sugerir kit basado en descripción
 *     tags: [Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Descripción del trabajo para sugerir kit
 *     responses:
 *       200:
 *         description: Kit sugerido
 *       400:
 *         description: Descripción requerida
 */
router.post('/suggest', authorize([PERMISSIONS.KITS_VIEW]), KitsController.suggest);

export default router;
