import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { JobScheduler } from '../../../jobs/JobScheduler';

const router = Router();

/**
 * @route   GET /api/jobs/status
 * @desc    Obtener estado de todos los jobs
 * @access  Private (Admin only)
 */
router.get('/status', authenticate, authorize([PERMISSIONS.ADMIN_FULL_ACCESS]), (req, res) => {
  try {
    const status = JobScheduler.getStatus();
    res.json({
      status: 'ok',
      jobs: status,
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message,
    });
  }
});

/**
 * @route   POST /api/jobs/:jobName/run
 * @desc    Ejecutar un job manualmente
 * @access  Private (Admin only)
 */
router.post('/:jobName/run', authenticate, authorize([PERMISSIONS.ADMIN_FULL_ACCESS]), async (req, res) => {
  try {
    const { jobName } = req.params;
    const result = await JobScheduler.runJob(jobName);

    res.json({
      status: 'ok',
      job: jobName,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message,
    });
  }
});

export default router;