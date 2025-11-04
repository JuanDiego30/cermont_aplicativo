import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserActive, getUsersByRole, getUserStats, } from '';
import { authenticate } from '';
import { requireAdmin, requireMinRole, canModifyRole } from '';
import { validateObjectId } from '';
import { createRateLimiter } from '';
import { auditLogger } from '';
import { cacheMiddleware, invalidateCache, invalidateCacheById } from '';
import { sanitizeQuery } from '';
import { validateRequest } from '';
import { ROLES } from '';
import { asyncHandler } from '';
import { HTTP_STATUS, errorResponse } from '';
const validateRole = (param) => {
    return (req, res, next) => {
        if (!ROLES.includes(req.params[param])) {
            return errorResponse(res, 'Invalid role', HTTP_STATUS.BAD_REQUEST);
        }
        next();
    };
};
const router = Router();
router.use(authenticate);
router.get('/stats/summary', sanitizeQuery, requireAdmin, cacheMiddleware(600), asyncHandler(getUserStats));
router.get('/role/:rol', validateRole('rol'), sanitizeQuery, requireMinRole('engineer'), cacheMiddleware(180), asyncHandler(getUsersByRole));
router.get('/', sanitizeQuery, requireMinRole('engineer'), cacheMiddleware(120), asyncHandler(getAllUsers));
router.get('/:id', validateObjectId('id'), cacheMiddleware(300), asyncHandler(getUserById));
router.post('/', requireAdmin, createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), validateRequest, canModifyRole('rol'), invalidateCache('users'), invalidateCache('users:stats'), auditLogger('CREATE', 'User'), asyncHandler(createUser));
router.put('/:id', validateObjectId('id'), validateRequest, canModifyRole('rol'), invalidateCacheById('users'), invalidateCache('users:stats'), auditLogger('UPDATE', 'User'), asyncHandler(updateUser));
router.delete('/:id', validateObjectId('id'), requireAdmin, invalidateCacheById('users'), invalidateCache('users:stats'), auditLogger('DELETE', 'User'), asyncHandler(deleteUser));
router.patch('/:id/toggle-active', validateObjectId('id'), requireAdmin, invalidateCacheById('users'), invalidateCache('users:stats'), auditLogger('UPDATE', 'UserActive'), asyncHandler(toggleUserActive));
export default router;
//# sourceMappingURL=users.routes.js.map