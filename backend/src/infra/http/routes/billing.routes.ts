import { Router } from 'express';
import { BillingController } from '../controllers/BillingController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

router.use(authenticate);

// Stats
router.get(
    '/stats',
    authorize([PERMISSIONS.ORDERS_VIEW]),
    BillingController.getStats
);

// List by state
router.get(
    '/state/:state',
    authorize([PERMISSIONS.ORDERS_VIEW]),
    BillingController.listByState
);

// Update state
router.patch(
    '/:id/state',
    authorize([PERMISSIONS.ORDERS_MANAGE]),
    BillingController.updateState
);

export default router;
