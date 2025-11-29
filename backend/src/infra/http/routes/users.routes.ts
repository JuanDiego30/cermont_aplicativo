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
 * @route   GET /api/users
 * @desc    Listar usuarios
 * @access  Private (Admin)
 */
router.get(
  '/',
  authorize([PERMISSIONS.USERS_VIEW_ALL]),
  validateMiddleware(userFiltersSchema),
  usersController.list
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.USERS_VIEW]),
  usersController.getById
);

/**
 * @route   POST /api/users
 * @desc    Crear usuario
 * @access  Private (Admin)
 */
router.post(
  '/',
  authorize([PERMISSIONS.USERS_CREATE]),
  validateMiddleware(createUserSchema),
  usersController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateMiddleware(updateUserSchema),
  usersController.update
);

/**
 * @route   POST /api/users/:id/change-password
 * @desc    Cambiar contraseña
 * @access  Private (Admin)
 */
router.post(
  '/:id/change-password',
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateMiddleware(changePasswordSchema),
  usersController.changePassword
);

/**
 * @route   POST /api/users/:id/activate
 * @desc    Activar usuario
 * @access  Private (Admin)
 */
router.post(
  '/:id/activate',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.activate
);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Desactivar usuario
 * @access  Private (Admin)
 */
router.post(
  '/:id/deactivate',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.deactivate
);

/**
 * @route   POST /api/users/:id/lock
 * @desc    Bloquear cuenta
 * @access  Private (Admin)
 */
router.post(
  '/:id/lock',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.lock
);

/**
 * @route   POST /api/users/:id/unlock
 * @desc    Desbloquear cuenta
 * @access  Private (Admin)
 */
router.post(
  '/:id/unlock',
  authorize([PERMISSIONS.USERS_MANAGE]),
  usersController.unlock
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Solo Root/Admin)
 */
router.delete(
  '/:id',
  authorize([PERMISSIONS.USERS_DELETE]),
  usersController.remove
);

export default router;