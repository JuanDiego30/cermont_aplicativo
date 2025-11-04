import { Router } from 'express';
import { getAllWorkPlans, getWorkPlanById, getWorkPlanByOrderId, createWorkPlan, updateWorkPlan, deleteWorkPlan, approveWorkPlan, completeActivity, getWorkPlanStats, } from '';
import { authenticate } from '';
import { requireMinRole, requireAdmin } from '';
import { validateObjectId, validateRequest } from '';
import { createRateLimiter } from '';
import { auditLogger } from '';
import { cacheMiddleware, invalidateCache, invalidateCacheById } from '';
import { sanitizeQuery } from '';
import { createWorkPlanValidator, updateWorkPlanValidator, completeActivityValidator } from '';
import { WORKPLAN_STATUS, ORDER_STATUS } from '';
import { asyncHandler } from '';
import { HTTP_STATUS, errorResponse } from '';
const validateStatus = (statusField, enumValues) => {
    return (req, res, next) => {
        const status = req.query[statusField] || req.body.status;
        if (status && !enumValues.includes(status)) {
            return errorResponse(res, `Invalid ${statusField}`, HTTP_STATUS.BAD_REQUEST);
        }
        next();
    };
};
const router = Router();
router.use(authenticate);
router.get('/stats/summary', sanitizeQuery, validateStatus('orderStatus', Object.keys(ORDER_STATUS)), requireMinRole('engineer'), cacheMiddleware(600), asyncHandler(getWorkPlanStats));
router.get('/', sanitizeQuery, validateStatus('status', WORKPLAN_STATUS), validateStatus('orderStatus', Object.keys(ORDER_STATUS)), requireMinRole('supervisor'), cacheMiddleware(120), asyncHandler(getAllWorkPlans));
router.get('/order/:orderId', validateObjectId('orderId'), requireMinRole('supervisor'), cacheMiddleware(300), asyncHandler(getWorkPlanByOrderId));
router.get('/:id', validateObjectId('id'), cacheMiddleware(300), asyncHandler(getWorkPlanById));
router.post('/', requireMinRole('engineer'), validateRequest(createWorkPlanValidator), createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), invalidateCache('workplans'), invalidateCache('workplans:stats'), auditLogger('CREATE', 'WorkPlan'), asyncHandler(createWorkPlan));
router.put('/:id', validateObjectId('id'), requireMinRole('supervisor'), validateRequest(updateWorkPlanValidator), invalidateCacheById('workplans'), invalidateCache('workplans:stats'), auditLogger('UPDATE', 'WorkPlan'), asyncHandler(updateWorkPlan));
router.delete('/:id', validateObjectId('id'), requireAdmin, invalidateCacheById('workplans'), invalidateCache('workplans:stats'), auditLogger('DELETE', 'WorkPlan'), asyncHandler(deleteWorkPlan));
router.post('/:id/approve', validateObjectId('id'), requireMinRole('engineer'), validateRequest, invalidateCacheById('workplans'), invalidateCache('workplans:stats'), auditLogger('UPDATE', 'WorkPlanApprove'), asyncHandler(approveWorkPlan));
router.patch('/:id/cronograma/:actividadId/complete', validateObjectId('id'), validateObjectId('actividadId'), validateRequest(completeActivityValidator), invalidateCacheById('workplans'), invalidateCache('workplans:stats'), auditLogger('UPDATE', 'WorkPlanActivityComplete'), asyncHandler(completeActivity));
export default router;
//# sourceMappingURL=workplans.routes.js.map