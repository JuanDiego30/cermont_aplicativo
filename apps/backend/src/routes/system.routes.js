import express from 'express';
import { authenticate as auth } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import cacheService from '../services/cache.service.js';
import Order from '../models/Order.js';

const router = express.Router();

/**
 * Obtener estadísticas de cache (solo admins)
 * GET /api/system/cache/stats
 */
router.get('/cache/stats',
  auth,
  requireMinRole('admin'),
  (req, res) => {
    const stats = cacheService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  }
);

/**
 * Limpiar cache manualmente (solo admins)
 * POST /api/system/cache/flush
 */
router.post('/cache/flush',
  auth,
  requireMinRole('admin'),
  (req, res) => {
    cacheService.flush();
    
    res.json({
      success: true,
      message: 'Cache limpiado exitosamente'
    });
  }
);

/**
 * Obtener keys del cache (solo admins)
 * GET /api/system/cache/keys
 */
router.get('/cache/keys',
  auth,
  requireMinRole('admin'),
  (req, res) => {
    const keys = cacheService.keys();
    
    res.json({
      success: true,
      data: {
        keys,
        count: keys.length
      }
    });
  }
);

/**
 * Obtener métricas del sistema (solo admins)
 * GET /api/system/metrics
 */
router.get('/metrics',
  auth,
  requireMinRole('admin'),
  async (req, res) => {
    try {
      // Contar órdenes por estado
      const open = await Order.countDocuments({ status: 'open' });
      const inProgress = await Order.countDocuments({ status: 'in_progress' });
      const closed = await Order.countDocuments({ status: 'closed' });

      // Contar órdenes de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7 = await Order.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      const metrics = {
        orders: {
          open,
          inProgress,
          closed,
          last7
        },
        cache: cacheService.getStats()
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;