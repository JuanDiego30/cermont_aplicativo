import { Router } from 'express';
import { costBreakdownController } from '../controllers/CostBreakdownController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

// WorkPlan cost breakdown routes
router.get('/work-plans/:id/cost-breakdown', authenticate, costBreakdownController.list);
router.get('/work-plans/:id/cost-summary', authenticate, costBreakdownController.summary);
router.post('/work-plans/:id/cost-breakdown', authenticate, costBreakdownController.create);

// Cost breakdown item routes
router.patch('/cost-breakdown/:id', authenticate, costBreakdownController.update);
router.delete('/cost-breakdown/:id', authenticate, costBreakdownController.delete);

export default router; // Exportar default para consistencia
