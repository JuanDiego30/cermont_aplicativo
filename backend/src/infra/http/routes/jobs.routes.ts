import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { JobScheduler } from '../../scheduler/JobScheduler.js';
import { getErrorMessage } from '../../../shared/utils/index.js';

const router = Router();

// Middleware global para jobs
router.use(authenticate);

/**
 * @route   GET /api/jobs/status
 * @desc    Obtener estado de todos los jobs
 * @access  Private (Admin only)
 */
router.get('/status', authorize([PERMISSIONS.ADMIN_FULL_ACCESS]), (req, res) => {
  try {
    const status = JobScheduler.getStatus();
    res.json({
      status: 'ok',
      jobs: status,
    });
  } catch (error: unknown) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: getErrorMessage(error),
    });
  }
});

/**
 * @route   POST /api/jobs/:jobName/run
 * @desc    Ejecutar un job manualmente
 * @access  Private (Admin only)
 */
router.post('/:jobName/run', authorize([PERMISSIONS.ADMIN_FULL_ACCESS]), async (req, res) => {
  try {
    const { jobName } = req.params;
    
    // Validar jobName si es necesario para evitar ejecución arbitraria
    
    const result = await JobScheduler.runJob(jobName);

    res.json({
      status: 'ok',
      job: jobName,
      result,
    });
  } catch (error: unknown) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: getErrorMessage(error),
    });
  }
});

export default router;
