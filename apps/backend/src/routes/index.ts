/**
 * API v1 Routes Index (TypeScript - November 2025 - FIXED)
 * @description Punto de entrada centralizado para todas las rutas de la API v1 CERMONT ATG
 */

import express, { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

// Core route modules
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import ordersRoutes from './orders.routes';
import workplansRoutes from './workplans.routes';
import uploadRoutes from './upload.routes';
import auditLogRoutes from './auditLog.routes';
import adminRoutes from './admin.routes';
import systemRoutes from './system.routes';

// ATG-specific modules
import evidencesRoutes from './evidences.routes';
import toolkitsRoutes from './toolkits.routes';
import healthRoutes from './health.routes';

const router: Router = express.Router();

// Constants
const API_VERSION = 'v1';
const ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   POST/GET /api/v1/auth/*
 * @desc    Public authentication flows
 * @access  Public
 */
router.use('/auth', authRoutes);

/**
 * @route   GET /api/v1/system/*
 * @desc    Public system endpoints
 * @access  Public
 */
router.use('/system', systemRoutes);

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

/**
 * @route   GET/POST/PUT/DELETE /api/v1/users/*
 * @desc    CRUD users, profiles
 * @access  Private
 */
router.use('/users', usersRoutes);

/**
 * @route   GET/POST/PUT/DELETE /api/v1/orders/*
 * @desc    Work orders CRUD
 * @access  Private
 */
router.use('/orders', ordersRoutes);

/**
 * @route   GET/POST/PUT/DELETE /api/v1/workplans/*
 * @desc    Planning and resource allocation
 * @access  Private
 */
router.use('/workplans', workplansRoutes);

/**
 * @route   POST/DELETE /api/v1/upload/*
 * @desc    File uploads/deletions
 * @access  Private
 */
router.use('/upload', uploadRoutes);

/**
 * @route   GET /api/v1/audit-logs/*
 * @desc    Audit logs query
 * @access  Private (Admin+)
 */
router.use('/audit-logs', auditLogRoutes);

/**
 * @route   GET/POST /api/v1/admin/*
 * @desc    System admin tools
 * @access  Private (Admin+)
 */
router.use('/admin', adminRoutes);

/**
 * @route   GET/POST/PUT/DELETE /api/v1/cctv/*
 * @desc    CCTV reports
 * @access  Private
 */
// router.use('/cctv', cctvRoutes); // TODO: Implement CCTV routes

/**
 * @route   POST/GET/DELETE /api/v1/evidence/*
 * @desc    Evidence handling
 * @access  Private
 */
router.use('/evidences', evidencesRoutes);

/**
 * @route   GET/POST/PUT/DELETE /api/v1/toolkits/*
 * @desc    Tool kits management
 * @access  Private
 */
router.use('/toolkits', toolkitsRoutes);

// ============================================================================
// HEALTH & MONITORING
// ============================================================================

interface HealthResponse {
  success: boolean;
  message: string;
  version: string;
  timestamp: string;
  uptime: number;
  env: string;
  dbConnected?: boolean;
}

/**
 * @route   GET /api/v1/health
 * @desc    API health check
 * @access  Public
 */
router.get('/health', async (req: Request, res: Response) => {
  let dbConnected = false;
  
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbConnected = true;
    }
  } catch (error) {
    logger.warn('DB ping failed in health check', { error: (error as Error).message });
  }

  const health: HealthResponse = {
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

/**
 * @route   GET /api/v1/healthz, /api/v1/readyz, /api/v1/metrics
 * @desc    Kubernetes-style health checks
 * @access  Public
 */
router.use('/', healthRoutes);

// Global 404 fallback
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: `Ruta ${req.originalUrl} no encontrada en API ${API_VERSION}` 
  });
});

// Log mounted routes (dev only)
if (ENV === 'development') {
  logger.info('API v1 routes mounted:', {
    public: ['/auth', '/system', '/health'],
    protected: [
      '/users', 
      '/orders', 
      '/workplans', 
      '/upload', 
      '/audit-logs', 
      '/admin', 
      '/cctv', 
      '/evidence', 
      '/toolkits'
    ],
  });
}

export default router;
