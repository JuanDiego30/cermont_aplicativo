import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';
import { usersController } from '../controllers/UsersController';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { validateRequest, createUserSchema, updateUserSchema, changePasswordSchema, userFiltersSchema } from '../schemas/validation.schemas';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Listar usuarios
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  authorize([PERMISSIONS.USERS_VIEW_ALL]),
  validateRequest(userFiltersSchema),
  (req, res) => usersController.list(req, res)
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_VIEW]),
  (req, res) => usersController.getById(req, res)
);

/**
 * @route   POST /api/users
 * @desc    Crear usuario
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  authorize([PERMISSIONS.USERS_CREATE]),
  validateRequest(createUserSchema),
  (req, res) => usersController.create(req, res)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateRequest(updateUserSchema),
  (req, res) => usersController.update(req, res)
);

/**
 * @route   POST /api/users/:id/change-password
 * @desc    Cambiar contraseña
 * @access  Private (Admin)
 */
router.post(
  '/:id/change-password',
  authenticate,
  authorize([PERMISSIONS.USERS_CHANGE_PASSWORD]),
  validateRequest(changePasswordSchema),
  (req, res) => usersController.changePassword(req, res)
);

/**
 * @route   POST /api/users/:id/activate
 * @desc    Activar usuario
 * @access  Private (Admin)
 */
router.post(
  '/:id/activate',
  authenticate,
  authorize([PERMISSIONS.USERS_ACTIVATE]),
  (req, res) => usersController.activate(req, res)
);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Desactivar usuario
 * @access  Private (Admin)
 */
router.post(
  '/:id/deactivate',
  authenticate,
  authorize([PERMISSIONS.USERS_DEACTIVATE]),
  (req, res) => usersController.deactivate(req, res)
);

/**
 * @route   POST /api/users/:id/lock
 * @desc    Bloquear cuenta
 * @access  Private (Admin)
 */
router.post(
  '/:id/lock',
  authenticate,
  authorize([PERMISSIONS.USERS_LOCK]),
  (req, res) => usersController.lock(req, res)
);

/**
 * @route   POST /api/users/:id/unlock
 * @desc    Desbloquear cuenta
 * @access  Private (Admin)
 */
router.post(
  '/:id/unlock',
  authenticate,
  authorize([PERMISSIONS.USERS_UNLOCK]),
  (req, res) => usersController.unlock(req, res)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario
 * @access  Private (Solo Root)
 */
router.delete(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_DELETE]),
  (req, res) => usersController.delete(req, res)
);

export default router;
