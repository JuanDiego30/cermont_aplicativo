/**
 * Rutas de Usuarios
 *
 * @file backend/src/infra/http/routes/users.routes.ts
 */

import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { usersController } from '../controllers/UsersController.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware.js';
import { 
  createUserSchema, 
  updateUserSchema, 
  changePasswordSchema, 
  userFiltersSchema 
} from '../schemas/validation.schemas.js';

const router = Router();

// Middleware global
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios con filtros y paginación
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get(
  '/',
  authorize([PERMISSIONS.USERS_VIEW_ALL]),
  validateMiddleware(userFiltersSchema),
  usersController.list
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
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
 *         description: Detalle del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.USERS_VIEW]),
  usersController.getById
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, coordinator, technician, client]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya existe
 */
router.post(
  '/',
  authorize([PERMISSIONS.USERS_CREATE]),
  validateMiddleware(createUserSchema),
  usersController.create
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
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
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/:id',
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateMiddleware(updateUserSchema),
  usersController.update
);

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Cambiar contraseña de usuario
 *     tags: [Users]
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
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Contraseña actual incorrecta
 */
router.post(
  '/:id/change-password',
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateMiddleware(changePasswordSchema),
  usersController.changePassword
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   post:
 *     summary: Activar usuario
 *     tags: [Users]
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
 *         description: Usuario activado
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/:id/activate',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.activate
);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   post:
 *     summary: Desactivar usuario
 *     tags: [Users]
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
 *         description: Usuario desactivado
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/:id/deactivate',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.deactivate
);

/**
 * @swagger
 * /api/users/{id}/lock:
 *   post:
 *     summary: Bloquear cuenta de usuario
 *     tags: [Users]
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
 *         description: Cuenta bloqueada
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/:id/lock',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.lock
);

/**
 * @swagger
 * /api/users/{id}/unlock:
 *   post:
 *     summary: Desbloquear cuenta de usuario
 *     tags: [Users]
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
 *         description: Cuenta desbloqueada
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/:id/unlock',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.unlock
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
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
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No se puede eliminar este usuario
 */
router.delete(
  '/:id',
  authorize([PERMISSIONS.USERS_DELETE]),
  usersController.remove
);

export default router;