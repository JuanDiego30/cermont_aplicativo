/**
 * Reports Controller
 * @description CCTV and general reports management
 */

import CctvReport from '../models/CctvReport.js';
import Order from '../models/Order.js';
import Evidence from '../models/Evidence.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { emitToRole } from '../config/socket.js';

/**
 * Get all CCTV reports
 * @route GET /api/v1/reports/cctv
 * @access Private
 */
export const getAllCctvReports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    lugar,
    fechaInicio,
    fechaFin,
    tecnicoId,
    orderId,
  } = req.query;

  const filter = {};

  if (lugar) filter.lugar = new RegExp(lugar, 'i');
  if (orderId) filter.orderId = orderId;
  if (tecnicoId) filter.tecnicoId = tecnicoId;

  // Date range filter
  if (fechaInicio || fechaFin) {
    filter.fecha = {};
    if (fechaInicio) filter.fecha.$gte = new Date(fechaInicio);
    if (fechaFin) filter.fecha.$lte = new Date(fechaFin);
  }

  // Role-based filtering
  if (req.userRole === 'technician') {
    filter.tecnicoId = req.userId;
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    CctvReport.find(filter)
      .populate('orderId', 'numeroOrden clienteNombre')
      .populate('tecnicoId', 'nombre email')
      .populate('aprobadoPor', 'nombre email')
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    CctvReport.countDocuments(filter),
  ]);

  return paginatedResponse(res, reports, parseInt(page), parseInt(limit), total);
});

/**
 * Get CCTV report by ID
 * @route GET /api/v1/reports/cctv/:id
 * @access Private
 */
export const getCctvReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await CctvReport.findById(id)
    .populate('orderId', 'numeroOrden clienteNombre lugar')
    .populate('tecnicoId', 'nombre email telefono cargo')
    .populate('aprobadoPor', 'nombre email');

  if (!report) {
    return errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, { report }, 'Reporte obtenido exitosamente');
});

/**
 * Create CCTV report
 * @route POST /api/v1/reports/cctv
 * @access Private (Technician, Supervisor, Engineer)
 */
export const createCctvReport = asyncHandler(async (req, res) => {
  const reportData = {
    ...req.body,
    tecnicoId: req.userId,
  };

  // Validate order exists if provided
  if (reportData.orderId) {
    const order = await Order.findById(reportData.orderId);
    if (!order) {
      return errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
    }
  }

  const report = await CctvReport.create(reportData);

  logger.info(`CCTV report created: ${report._id} by ${req.user.email}`);

  // Notify supervisors
  emitToRole('supervisor', 'cctv_report_created', {
    reportId: report._id,
    lugar: report.lugar,
    tecnico: req.user.nombre,
  });

  emitToRole('engineer', 'cctv_report_created', {
    reportId: report._id,
    lugar: report.lugar,
  });

  return createdResponse(res, { report }, 'Reporte CCTV creado exitosamente');
});

/**
 * Update CCTV report
 * @route PUT /api/v1/reports/cctv/:id
 * @access Private
 */
export const updateCctvReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const report = await CctvReport.findById(id);

  if (!report) {
    return errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // Check permissions - only creator or admin can update
  const isCreator = report.tecnicoId.toString() === req.userId.toString();
  const isAdmin = ['root', 'admin', 'engineer', 'supervisor'].includes(req.userRole);

  if (!isCreator && !isAdmin) {
    return errorResponse(res, 'No tienes permiso para editar este reporte', HTTP_STATUS.FORBIDDEN);
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (key !== '_id' && key !== 'tecnicoId') {
      report[key] = updates[key];
    }
  });

  await report.save();

  logger.info(`CCTV report updated: ${report._id} by ${req.user.email}`);

  return successResponse(res, { report }, 'Reporte actualizado exitosamente');
});

/**
 * Delete CCTV report
 * @route DELETE /api/v1/reports/cctv/:id
 * @access Private (Admin, Engineer)
 */
export const deleteCctvReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await CctvReport.findByIdAndDelete(id);

  if (!report) {
    return errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  logger.info(`CCTV report deleted: ${id} by ${req.user.email}`);

  return successResponse(res, null, 'Reporte eliminado exitosamente');
});

/**
 * Approve CCTV report
 * @route POST /api/v1/reports/cctv/:id/approve
 * @access Private (Supervisor, Engineer, Admin)
 */
export const approveCctvReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await CctvReport.findById(id);

  if (!report) {
    return errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  if (report.aprobadoPor) {
    return errorResponse(res, 'El reporte ya está aprobado', HTTP_STATUS.BAD_REQUEST);
  }

  report.aprobadoPor = req.userId;
  report.fechaAprobacion = new Date();

  await report.save();

  logger.info(`CCTV report approved: ${report._id} by ${req.user.email}`);

  // Notify technician
  emitToUser(report.tecnicoId.toString(), 'report_approved', {
    reportId: report._id,
    lugar: report.lugar,
    approvedBy: req.user.nombre,
  });

  return successResponse(res, { report }, 'Reporte aprobado exitosamente');
});

/**
 * Get reports by order
 * @route GET /api/v1/reports/order/:orderId
 * @access Private
 */
export const getReportsByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const cctvReports = await CctvReport.find({ orderId })
    .populate('tecnicoId', 'nombre email')
    .sort({ fecha: -1 });

  const evidences = await Evidence.find({ orderId })
    .populate('uploadedBy', 'nombre email')
    .sort({ fecha: -1 });

  return successResponse(
    res,
    {
      cctvReports,
      evidences,
    },
    'Reportes obtenidos exitosamente'
  );
});
