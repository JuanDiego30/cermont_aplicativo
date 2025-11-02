import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Obtener logs de auditoría con filtros y paginación
 * GET /api/audit-logs?page=1&limit=50&action=LOGIN&severity=HIGH
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    resource,
    userId,
    severity,
    status,
    startDate,
    endDate
  } = req.query;

  // Construir filtros
  const filters = {};

  if (action) filters.action = action;
  if (resource) filters.resource = resource;
  if (userId) filters.userId = userId;
  if (severity) filters.severity = severity;
  if (status) filters.status = status;

  // Filtros de fecha
  if (startDate || endDate) {
    filters.timestamp = {};
    if (startDate) filters.timestamp.$gte = new Date(startDate);
    if (endDate) filters.timestamp.$lte = new Date(endDate);
  }

  // Paginación
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Query
  const logs = await AuditLog.find(filters)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'nombre email rol')
    .select('-__v');

  const total = await AuditLog.countDocuments(filters);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Obtener actividad reciente de un usuario específico
 * GET /api/audit-logs/user/:userId
 */
const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const logs = await AuditLog.getUserActivity(userId, parseInt(limit));

  res.json({
    success: true,
    data: logs
  });
});

/**
 * Obtener alertas de seguridad (accesos denegados, fallos críticos)
 * GET /api/audit-logs/security-alerts?days=7
 */
const getSecurityAlerts = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const alerts = await AuditLog.getSecurityAlerts(parseInt(days));

  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  });
});

/**
 * Obtener estadísticas de auditoría
 * GET /api/audit-logs/stats
 */
const getAuditStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

  const stats = await AuditLog.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        failures: {
          $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] }
        },
        denials: {
          $sum: { $cond: [{ $eq: ['$status', 'DENIED'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: stats,
    period: `${days} días`
  });
});

export {
  getAuditLogs,
  getUserActivity,
  getSecurityAlerts,
  getAuditStats
};