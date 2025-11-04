import User from '../models/User';
import { successResponse, errorResponse, createdResponse, paginatedResponse, HTTP_STATUS } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { ROLES } from '../utils/constants';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger';
import { requireAdmin, requireSupervisorOrHigher, requireAuthenticated } from '../middleware/auth';
const UserListQuerySchema = z.object({
    cursor: z.string().optional(),
    page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z.string().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10)))),
    rol: z.enum(ROLES).optional(),
    activo: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional().max(100).min(2, 'Búsqueda mínima 2 caracteres'),
});
const CreateUserSchema = z.object({
    nombre: z.string().min(3, 'Nombre mínimo 3 caracteres').max(100),
    email: z.string().email('Email inválido').max(100),
    password: z.string().min(8, 'Contraseña mínima 8 caracteres'),
    rol: z.enum(ROLES),
    cedula: z.string().optional().max(20).regex(/^\d{7,10}$/, 'Cédula inválida'),
    telefono: z.string().optional().max(20).regex(/^\+?[\d\s-()]{10,15}$/, 'Teléfono inválido'),
    cargo: z.string().optional().max(100),
});
const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true, rol: true });
UpdateUserSchema.refine((data) => Object.keys(data).length > 0, { message: 'Al menos un campo para actualizar' });
const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(8).optional(),
    newPassword: z.string().min(8, 'Nueva contraseña mínima 8 caracteres'),
});
const SearchUsersSchema = z.object({
    q: z.string().min(2, 'Término mínimo 2 caracteres').max(100),
    limit: z.string().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
});
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const getAllUsers = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const query = UserListQuerySchema.parse(req.query);
    const filters = { activo: true };
    if (query.rol)
        filters.rol = query.rol;
    if (query.activo !== undefined)
        filters.activo = query.activo;
    if (query.search) {
        const searchRegex = { $regex: query.search, $options: 'i' };
        filters.$or = [
            { nombre: searchRegex },
            { email: searchRegex },
            { cedula: searchRegex },
        ];
    }
    const skip = (query.page - 1) * query.limit;
    const [users, total] = await Promise.all([
        User.find(filters)
            .select('-password')
            .populate('creadoPor', 'nombre email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean(),
        User.countDocuments(filters),
    ]);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_USERS',
        resource: 'User',
        details: { page: query.page, limit: query.limit, rol: query.rol, search: query.search },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    paginatedResponse(res, users, { page: query.page, limit: query.limit, total }, 'Usuarios obtenidos exitosamente');
});
export const getUserById = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de usuario inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const user = await User.findOne({ _id: id, activo: true })
        .select('-password')
        .populate('creadoPor', 'nombre email')
        .lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_USER',
        resource: 'User',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: user }, 'Usuario obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const createUser = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const data = {
        ...CreateUserSchema.parse(req.body),
        creadoPor: req.user.userId,
    };
    const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${data.email}$`, 'i') } });
    if (existingUser) {
        errorResponse(res, 'Email ya existe', HTTP_STATUS.CONFLICT);
        return;
    }
    const user = await User.create(data);
    logger.info(`Usuario creado: ${user.email} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CREATE_USER',
        resource: 'User',
        resourceId: user._id.toString(),
        details: { email: data.email, rol: data.rol },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    createdResponse(res, { data: { ...user.toObject(), password: undefined } }, 'Usuario creado exitosamente');
});
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = UpdateUserSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de usuario inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (req.user.rol !== ROLES.ADMIN && req.user._id?.toString() !== id) {
        errorResponse(res, 'No tienes permisos para actualizar este usuario', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const user = await User.findOne({ _id: id, activo: true });
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${updates.email}$`, 'i') } });
        if (existingUser) {
            errorResponse(res, 'Email ya existe', HTTP_STATUS.CONFLICT);
            return;
        }
    }
    Object.assign(user, updates);
    await user.save({ validateModifiedOnly: true });
    logger.info(`Usuario actualizado: ${user.email} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE_USER',
        resource: 'User',
        resourceId: id,
        details: { changes: Object.keys(updates), email: user.email },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    await user.populate('creadoPor', 'nombre email');
    successResponse(res, { data: user.toObject() }, 'Usuario actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const deleteUser = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de usuario inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const user = await User.findOneAndUpdate({ _id: id, activo: true }, { activo: false, deletedAt: new Date() }, { new: true }).lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`Usuario eliminado: ${user.email} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'DELETE_USER',
        resource: 'User',
        resourceId: id,
        details: { email: user.email },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Usuario eliminado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const toggleUserActive = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de usuario inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const user = await User.findOneAndUpdate({ _id: id }, [
        { $set: { activo: { $not: '$activo' } } },
        { $set: { updatedAt: new Date() } },
    ], { new: true, lean: true });
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const action = user.activo ? 'activado' : 'desactivado';
    logger.info(`Usuario ${action}: ${user.email} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: `TOGGLE_USER_${user.activo ? 'ACTIVE' : 'INACTIVE'}`,
        resource: 'User',
        resourceId: id,
        details: { email: user.email, newState: user.activo },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: user }, `Usuario ${action} exitosamente`, HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const changeUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de usuario inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (req.user.rol !== ROLES.ADMIN && req.user._id?.toString() !== id) {
        errorResponse(res, 'No tienes permisos para cambiar esta contraseña', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const user = await User.findById(id);
    if (!user || !user.activo) {
        errorResponse(res, 'Usuario no encontrado o inactivo', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const requireCurrent = req.user.rol !== ROLES.ADMIN;
    if (requireCurrent && !currentPassword) {
        errorResponse(res, 'Contraseña actual requerida', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (requireCurrent) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            errorResponse(res, 'Contraseña actual incorrecta', HTTP_STATUS.BAD_REQUEST);
            return;
        }
    }
    user.password = newPassword;
    await user.save();
    logger.info(`Contraseña cambiada para: ${user.email} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CHANGE_PASSWORD',
        resource: 'User',
        resourceId: id,
        details: { email: user.email },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    successResponse(res, null, 'Contraseña cambiada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getUsersByRole = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const { role } = req.params;
    const activo = (req.query.activo === 'true');
    if (!ROLES.includes(role)) {
        errorResponse(res, `Rol inválido: ${role}. Válidos: ${ROLES.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const filters = { rol: role, activo };
    const users = await User.find(filters)
        .select('-password')
        .sort({ nombre: 1 })
        .limit(1000)
        .lean();
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_USERS_BY_ROLE',
        resource: 'User',
        details: { role, activo },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: { users, count: users.length } }, `Usuarios con rol ${role} obtenidos exitosamente`, HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getUserStats = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const stats = await User.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                activos: { $sum: { $cond: [{ $eq: ['$activo', true] }, 1, 0] } },
                inactivos: { $sum: { $cond: [{ $eq: ['$activo', false] }, 1, 0] } },
            },
        },
        { $project: { total: 1, activos: 1, inactivos: 1 } },
    ]);
    const porRol = await User.aggregate([
        { $match: { activo: true, deletedAt: { $exists: false } } },
        {
            $group: {
                _id: '$rol',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);
    const result = {
        total: stats[0]?.total || 0,
        activos: stats[0]?.activos || 0,
        inactivos: stats[0]?.inactivos || 0,
        porRol: Object.fromEntries(porRol.map((item) => [item._id, item.count])),
    };
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_USER_STATS',
        resource: 'User',
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: result }, 'Estadísticas de usuarios obtenidas exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const searchUsers = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { q, limit } = SearchUsersSchema.parse(req.query);
    const filters = {
        $or: [
            { nombre: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { cedula: { $regex: q, $options: 'i' } },
        ],
        activo: true,
    };
    const users = await User.find(filters)
        .select('-password')
        .limit(limit)
        .sort({ nombre: 1 })
        .lean();
    await createAuditLog({
        userId: req.user.userId,
        action: 'SEARCH_USERS',
        resource: 'User',
        details: { q, limit },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: users }, 'Búsqueda de usuarios completada', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=users.controller.js.map