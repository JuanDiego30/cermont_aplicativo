import { Router } from 'express';
import { ArchivesController } from '../controllers/ArchivesController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

router.use(authenticate);

// Only admins can access archives
router.get(
    '/',
    authorize([PERMISSIONS.USERS_MANAGE]), // Ajustar permiso si existe uno específico para ARCHIVES_READ
    ArchivesController.list
);

router.get(
    '/export',
    authorize([PERMISSIONS.USERS_MANAGE]),
    ArchivesController.export
);

router.post(
    '/trigger',
    authorize([PERMISSIONS.USERS_MANAGE]),
    ArchivesController.triggerArchive
);

export default router;
