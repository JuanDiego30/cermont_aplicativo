import express from 'express';
import { logger } from '';
import { ENV } from '';
import authRoutes from '';
import usersRoutes from '';
import ordersRoutes from '';
import workplansRoutes from '';
import uploadRoutes from '';
import auditLogRoutes from '';
import adminRoutes from '';
import systemRoutes from '';
import cctvRoutes from '';
import evidenceRoutes from '';
import toolkitsRoutes from '';
import mongoose from 'mongoose';
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/system', systemRoutes);
router.use('/users', usersRoutes);
router.use('/orders', ordersRoutes);
router.use('/workplans', workplansRoutes);
router.use('/upload', uploadRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/admin', adminRoutes);
router.use('/cctv', cctvRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/toolkits', toolkitsRoutes);
router.get('/health', async (req, res) => {
    let dbConnected = false;
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            dbConnected = true;
        }
    }
    catch (error) {
        logger.warn('DB ping failed in health check', { error: error.message });
    }
    const health = {
        success: true,
        message: 'API v1 is operational',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() * 1000,
        env: ENV,
        dbConnected,
    };
    res.status(200).json(health);
    logger.info('Health check requested', { ip: req.ip });
});
router.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Ruta ${req.originalUrl} no encontrada en API v1` });
});
if (ENV === 'development') {
    logger.info('API v1 routes mounted:', {
        public: ['/auth', '/system', '/health'],
        protected: ['/users', '/orders', '/workplans', '/upload', '/audit-logs', '/admin', '/cctv', '/evidence', '/toolkits'],
    });
}
export default router;
//# sourceMappingURL=index.js.map