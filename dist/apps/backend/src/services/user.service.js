import User from '';
import { autoPaginate } from '';
import { AppError } from '';
import { logger } from '';
import cacheService from '';
import { auditService } from '';
import { USER_ROLES } from '';
class UserService {
    async list(filters = {}, options = {}) {
        try {
            const cacheKey = `users:list:${JSON.stringify({ ...filters, page: options.page, limit: options.limit, sort: options.sort })}`;
            return await cacheService.wrap(cacheKey, async () => {
                const searchFilter = filters.search ? {
                    $or: [
                        { nombre: { $regex: filters.search, $options: 'i' } },
                        { email: { $regex: filters.search, $options: 'i' } },
                        { cedula: { $regex: filters.search, $options: 'i' } },
                    ],
                } : {};
                const fullFilters = { ...filters, ...searchFilter, isActive: { $ne: false } };
                const result = await autoPaginate(User, fullFilters, {
                    ...options,
                    select: '-password -__v',
                    sort: options.sort || { createdAt: -1 },
                });
                return result;
            }, 120);
        }
        catch (error) {
            logger.error('[UserService] Error listando usuarios:', error);
            throw error;
        }
    }
    async getById(userId) {
        try {
            const cacheKey = `user:${userId}`;
            return await cacheService.wrap(cacheKey, async () => {
                const user = await User.findById(userId)
                    .select('-password -__v')
                    .lean();
                if (!user) {
                    throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
                }
                return user;
            }, 300);
        }
        catch (error) {
            logger.error(`[UserService] Error obteniendo usuario ${userId}:`, error);
            throw error;
        }
    }
    async getByEmail(email) {
        try {
            const user = await User.findOne({ email })
                .select('+password');
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }
            return user;
        }
        catch (error) {
            logger.error(`[UserService] Error obteniendo usuario por email ${email}:`, error);
            throw error;
        }
    }
    async create(userData, creatorId) {
        try {
            if (!Object.values(USER_ROLES).includes(userData.rol)) {
                throw new AppError('Rol inv�lido', 400, 'INVALID_ROLE');
            }
            const existingEmail = await User.findOne({ email: userData.email });
            if (existingEmail) {
                throw new AppError('El email ya est� registrado', 409, 'EMAIL_ALREADY_EXISTS');
            }
            if (userData.cedula) {
                const existingCedula = await User.findOne({ cedula: userData.cedula });
                if (existingCedula) {
                    throw new AppError('La c�dula ya est� registrada', 409, 'CEDULA_ALREADY_EXISTS');
                }
            }
            const user = await User.create(userData);
            await cacheService.delPattern('users:list:*');
            await cacheService.del('users:stats');
            logger.info(`[UserService] Usuario creado: ${user.email}`);
            if (creatorId) {
                await auditService.createAuditLog({
                    action: 'user_create',
                    userId: creatorId,
                    targetId: user._id.toString(),
                    changes: { ...userData, password: '[HASHED]' },
                    metadata: { rol: user.rol },
                });
            }
            return user;
        }
        catch (error) {
            logger.error('[UserService] Error creando usuario:', error);
            throw error;
        }
    }
    async update(userId, updateData, updaterId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }
            if (updaterId && updaterId === userId && ['admin', 'root'].includes(user.rol) && updateData.rol && !['admin', 'root'].includes(updateData.rol)) {
                throw new AppError('No se puede degradar rol cr�tico', 403, 'FORBIDDEN_ROLE_CHANGE');
            }
            if (updateData.rol && !Object.values(USER_ROLES).includes(updateData.rol)) {
                throw new AppError('Rol inv�lido', 400, 'INVALID_ROLE');
            }
            if (updateData.email && updateData.email !== user.email) {
                const existingEmail = await User.findOne({ email: updateData.email });
                if (existingEmail) {
                    throw new AppError('El email ya est� registrado', 409, 'EMAIL_ALREADY_EXISTS');
                }
            }
            if (updateData.cedula && updateData.cedula !== user.cedula) {
                const existingCedula = await User.findOne({ cedula: updateData.cedula });
                if (existingCedula) {
                    throw new AppError('La c�dula ya est� registrada', 409, 'CEDULA_ALREADY_EXISTS');
                }
            }
            delete updateData.password;
            const prevData = { ...user.toObject() };
            Object.assign(user, updateData);
            await user.save();
            await cacheService.del(`user:${userId}`);
            await cacheService.delPattern('users:list:*');
            await cacheService.del('users:stats');
            logger.info(`[UserService] Usuario actualizado: ${userId}`);
            if (updaterId) {
                await auditService.createAuditLog({
                    action: 'user_update',
                    userId: updaterId,
                    targetId: userId,
                    changes: { ...updateData, prev: { email: prevData.email, rol: prevData.rol } },
                    metadata: { updatedBySelf: updaterId === userId },
                });
            }
            return user;
        }
        catch (error) {
            logger.error(`[UserService] Error actualizando usuario ${userId}:`, error);
            throw error;
        }
    }
    async delete(userId, deleterId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }
            if (user.rol === USER_ROLES.ADMIN) {
                const adminCount = await User.countDocuments({ rol: USER_ROLES.ADMIN, activo: true });
                if (adminCount <= 1) {
                    throw new AppError('No se puede eliminar el �ltimo administrador', 400, 'CANNOT_DELETE_LAST_ADMIN');
                }
            }
            if (deleterId && deleterId === userId && ['admin', 'root'].includes(user.rol)) {
                throw new AppError('No se puede eliminar usuario cr�tico', 403, 'FORBIDDEN_SELF_DELETE');
            }
            user.activo = false;
            await user.save();
            await cacheService.del(`user:${userId}`);
            await cacheService.delPattern('users:list:*');
            await cacheService.del('users:stats');
            logger.info(`[UserService] Usuario desactivado: ${userId}`);
            if (deleterId) {
                await auditService.createAuditLog({
                    action: 'user_delete',
                    userId: deleterId,
                    targetId: userId,
                    changes: { activo: false },
                    metadata: { softDelete: true, rol: user.rol },
                });
            }
            return user;
        }
        catch (error) {
            logger.error(`[UserService] Error eliminando usuario ${userId}:`, error);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword, changerId) {
        try {
            const user = await User.findById(userId).select('+password');
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new AppError('Contrase�a actual incorrecta', 401, 'INVALID_CURRENT_PASSWORD');
            }
            if (newPassword.length < 8) {
                throw new AppError('Contrase�a debe tener al menos 8 caracteres', 400, 'WEAK_PASSWORD');
            }
            user.password = newPassword;
            await user.save();
            await cacheService.del(`user:${userId}`);
            logger.info(`[UserService] Contrase�a cambiada para usuario: ${userId}`);
            if (changerId) {
                await auditService.createAuditLog({
                    action: 'user_password_change',
                    userId: changerId,
                    targetId: userId,
                    changes: { password: '[CHANGED]' },
                    metadata: { changedBySelf: changerId === userId },
                });
            }
            return true;
        }
        catch (error) {
            logger.error(`[UserService] Error cambiando contrase�a para ${userId}:`, error);
            throw error;
        }
    }
    async getStats(filters = {}) {
        try {
            const cacheKey = `users:stats:${JSON.stringify(filters)}`;
            return await cacheService.wrap(cacheKey, async () => {
                const baseMatch = { activo: { $ne: false }, ...filters };
                const [porRol, total, activos] = await Promise.all([
                    User.aggregate([
                        { $match: baseMatch },
                        {
                            $group: {
                                _id: '$rol',
                                count: { $sum: 1 },
                                activos: {
                                    $sum: { $cond: [{ $eq: ['$activo', true] }, 1, 0] },
                                },
                            },
                        },
                        { $sort: { count: -1 } },
                    ]),
                    User.countDocuments(baseMatch),
                    User.countDocuments({ ...baseMatch, activo: true }),
                ]);
                const newThisMonth = await User.countDocuments({
                    ...baseMatch,
                    createdAt: { $gte: this.getMonthStart() },
                });
                return {
                    total,
                    activos,
                    inactivos: total - activos,
                    porRol,
                    newThisMonth,
                };
            }, 600);
        }
        catch (error) {
            logger.error('[UserService] Error obteniendo estad�sticas:', error);
            throw error;
        }
    }
    getMonthStart() {
        const date = new Date();
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
    }
}
export default new UserService();
//# sourceMappingURL=user.service.js.map