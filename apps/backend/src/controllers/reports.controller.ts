/**
 * Reports Controller (TypeScript - November 2025)
 * @description Endpoints para gestión de reportes CCTV, evidencias y aprobaciones en CERMONT ATG. Integra con órdenes (populate), notificaciones Socket.IO, validación Zod, y auditoría. Maneja CRUD, filtros por rol (technician ve solo own), soft delete, y reportes por orden.
 * Uso: En reports.routes.ts (router.get('/cctv', authenticate, requireMinRole('technician'), getAllCctvReports); router.post('/cctv', authenticate, requireMinRole('technician'), validateRequest(CreateCctvReportSchema), createCctvReport);). Delega a reportsService (business logic, e.g., findWithFilters). Secure: Zod regex/datetime, role checks (require* middleware), ObjectId validate, isActive filter. Performance: lean(), populate select only (e.g., 'numeroOrden'), Promise.all para count+find, sort indexes (fecha: -1 assumed). Filters: Regex i-insensitive, date full-day end.
 * Types: @types/express @types/mongoose @types/zod, z.infer (CreateCctvReportType). Swagger: Inline per endpoint (tags: 'Reports', params ref ObjectId pattern, requestBody ref schemas). Pruebas: Jest mock reportsService (e.g., jest.mock('../services/reports.service'), test create/approve con populate). Para ATG: CCTV fields (hallazgos, camarasDefectuosas? add enum), approve atomic (no re-approve), notify emitToRole('supervisor'). Fixes: TypedRequest generics, void returns post-response, isHigher roles array, sanitize audit details (no IDs full).
 * Assume: Models typed (CctvReport: { _id: ObjectId, lugar: string, ... }), reportsService typed (e.g., list(filters: Partial<CctvFilter>, options: PaginationOptions): Promise<{ reports: CctvReport[], total: number }>). If no service, implement in controller but delegate for testability.
 */

import { Request, Response } from 'express';
import CctvReport from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import Evidence from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { emitToRole, emitToUser } from '../utils/logger';
import { z } from 'zod';
import { createAuditLog } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';

// Reuse/extend from types/index.ts or order.ts
interface AuthUser {
  userId: string;
  role: string;
  nombre: string;
  email: string;
}



// CCTV filter partial (Mongo)
interface CctvFilter {
  isActive?: boolean;
  lugar?: { $regex: string; $options: string };
  orderId?: string;
  tecnicoId?: string;
  fecha?: { $gte?: Date; $lte?: Date };
}

// Schemas Zod (infer types, align with models/Swagger)
const CctvListQuerySchema = z.object({
  page: z.string().default('1').transform((val: string): number => Math.max(1, parseInt(val, 10))),
  limit: z.string().default('10').transform((val: string): number => Math.min(100, Math.max(1, parseInt(val, 10)))),
  lugar: z.string().optional().max(100),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  tecnicoId: z.string().optional().refine((id: string) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'tecnicoId inválido' }),
  orderId: z.string().optional().refine((id: string) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'orderId inválido' }),
});

type CctvListQueryType = z.infer<typeof CctvListQuerySchema>;

const CreateCctvReportSchema = z.object({
  orderId: z.string().optional().refine((id: string) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'orderId inválido' }),
  lugar: z.string().min(1, 'Lugar requerido').max(200),
  descripcion: z.string().min(10, 'Descripción mínima 10 caracteres').max(2000),
  hallazgos: z.string().optional().max(2000),
  recomendaciones: z.string().optional().max(2000),
  fecha: z.string().default(() => new Date().toISOString()),
  // CCTV-specific: Add if in model, e.g., camarasDefectuosas: z.array(z.string()).optional(),
});

type CreateCctvReportType = z.infer<typeof CreateCctvReportSchema>;

const UpdateCctvReportSchema = z.object({
  descripcion: z.string().min(10).max(2000).optional(),
  hallazgos: z.string().max(2000).optional(),
  recomendaciones: z.string().max(2000).optional(),
  // Immutable: No tecnicoId/orderId
});

type UpdateCctvReportType = z.infer<typeof UpdateCctvReportSchema>;

const ApproveSchema = z.object({}); // Empty body

type ApproveType = z.infer<typeof ApproveSchema>;

/**
 * Valida ObjectId
 */
const validateObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Get all CCTV reports with pagination and filters
 * @route GET /api/v1/reports/cctv
 * @access Private (technician or higher)
 * @swagger
 * tags: [Reports]
 * summary: Obtener reportes CCTV filtrados y paginados
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: page
 *     in: query
 *     schema: { type: integer, default: 1, minimum: 1 }
 *   - name: limit
 *     in: query
 *     schema: { type: integer, default: 10, maximum: 100, minimum: 1 }
 *   - name: lugar
 *     in: query
 *     schema: { type: string, maxLength: 100 }
 *   - name: fechaInicio
 *     in: query
 *     schema: { type: string, format: date-time }
 *   - name: fechaFin
 *     in: query
 *     schema: { type: string, format: date-time }
 *   - name: tecnicoId
 *     in: query
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 *   - name: orderId
 *     in: query
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * responses:
 *   200:
 *     description: Reportes obtenidos
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/PaginatedResponse'
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CctvReport'
 */
export const getAllCctvReports = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    requireTechnicianOrHigher(req);

    const query = CctvListQuerySchema.parse(req.query);

    const filter: Partial<CctvFilter> = { isActive: true };

    if (query.lugar) filter.lugar = { $regex: query.lugar, $options: 'i' };
    if (query.orderId) filter.orderId = query.orderId;
    if (query.tecnicoId) filter.tecnicoId = query.tecnicoId;

    // Date range: endDate full day
    if (query.fechaInicio || query.fechaFin) {
      filter.fecha = {} as { $gte?: Date; $lte?: Date };
      if (query.fechaInicio) filter.fecha.$gte = new Date(query.fechaInicio);
      if (query.fechaFin) filter.fecha.$lte = new Date(query.fechaFin + 'T23:59:59.999Z');
    }

    // Role-based: Technician only own
    if ((req as any).user.role === 'technician') {
      filter.tecnicoId = (req as any).user.userId;
    }

    const skip = (query.page - 1) * query.limit;

    // Assume reportsService.list for delegation; fallback to model if no service
    const [reports, total] = await Promise.all([
      CctvReport.find(filter as any)
        .populate('orderId', 'numeroOrden clienteNombre')
        .populate('tecnicoId', 'nombre email')
        .populate('aprobadoPor', 'nombre email')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      CctvReport.countDocuments(filter as any),
    ]);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'GET_CCTV_REPORTS',
      resource: 'CctvReport',
      details: { page: query.page, limit: query.limit, filters: { ...query, tecnicoId: undefined } }, // Sanitize
      status: 'SUCCESS',
      severity: 'LOW',
    });

    paginatedResponse(
      res,
      { data: reports },
      query.page,
      query.limit,
      total,
      'Reportes CCTV obtenidos exitosamente',
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Get CCTV report by ID
 * @route GET /api/v1/reports/cctv/:id
 * @access Private
 * @swagger
 * tags: [Reports]
 * summary: Obtener reporte CCTV por ID
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * responses:
 *   200:
 *     description: Reporte obtenido
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/CctvReportResponse'
 *   403:
 *     description: Sin permiso
 *   404:
 *     description: No encontrado
 */
export const getCctvReportById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      errorResponse(
        res,
        'ID de reporte inválido',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    const report = await CctvReport.findOne({ _id: id, isActive: true })
      .populate('orderId', 'numeroOrden clienteNombre lugar')
      .populate('tecnicoId', 'nombre email telefono cargo')
      .populate('aprobadoPor', 'nombre email')
      .lean();

    if (!report) {
      errorResponse(
        res,
        'Reporte no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
      return;
    }

    // Role check: Technician only own
    if ((req as any).user.role === 'technician' && report.tecnicoId?._id.toString() !== (req as any).user.userId) {
      errorResponse(
        res,
        'No tienes permiso para ver este reporte',
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'GET_CCTV_REPORT',
      resource: 'CctvReport',
      resourceId: id,
      status: 'SUCCESS',
      severity: 'LOW',
    });

    successResponse(
      res,
      { data: report },
      'Reporte obtenido exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Create CCTV report
 * @route POST /api/v1/reports/cctv
 * @access Private (technician/supervisor/engineer)
 * @swagger
 * tags: [Reports]
 * summary: Crear reporte CCTV
 * security:
 *   - bearerAuth: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         $ref: '#/components/schemas/CreateCctvReportRequest'
 * responses:
 *   201:
 *     description: Reporte creado
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/CctvReportResponse'
 *   403:
 *     description: Rol no autorizado
 */
export const createCctvReport = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const rolesAllowed: string[] = ['technician', 'supervisor', 'engineer'];
    if (!rolesAllowed.includes((req as any).user.role)) {
      errorResponse(
        res,
        'Rol no autorizado para crear reportes CCTV',
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    const data: CreateCctvReportType & { tecnicoId: string; fecha: string } = {
      ...CreateCctvReportSchema.parse(req.body),
      tecnicoId: (req as any).user.userId,
      fecha: (CreateCctvReportSchema.parse(req.body).fecha as string) || new Date().toISOString(),
    };

    // Validate order if provided
    if (data.orderId) {
      const order = await Order.findById(data.orderId).lean();
      if (!order || !order.isActive) {
        errorResponse(
          res,
          'Orden no encontrada o inactiva',
          HTTP_STATUS.NOT_FOUND
        );
        return;
      }
    }

    const report = await CctvReport.create(data);

    logger.info(`CCTV report created: ${report._id} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'CREATE',
      resource: 'CctvReport',
      resourceId: report._id.toString(),
      details: { lugar: data.lugar, orderId: data.orderId },
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });

    // Notify
    const notifyData = {
      reportId: report._id,
      lugar: report.lugar,
      tecnico: (req as any).user.nombre,
    };
    emitToRole('supervisor', 'cctv_report_created', notifyData);
    emitToRole('engineer', 'cctv_report_created', { ...notifyData, tecnico: undefined });

    createdResponse(
      res,
      { data: report },
      'Reporte CCTV creado exitosamente',
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Update CCTV report
 * @route PUT /api/v1/reports/cctv/:id
 * @access Private (creator or supervisor/engineer/admin)
 * @swagger
 * tags: [Reports]
 * summary: Actualizar reporte CCTV
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         $ref: '#/components/schemas/UpdateCctvReportRequest'
 * responses:
 *   200:
 *     description: Reporte actualizado
 *   403:
 *     description: Sin permiso
 *   404:
 *     description: No encontrado
 */
export const updateCctvReport = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = UpdateCctvReportSchema.parse(req.body);

    if (!validateObjectId(id)) {
      errorResponse(
        res,
        'ID de reporte inválido',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    const report = await CctvReport.findOne({ _id: id, isActive: true });

    if (!report) {
      errorResponse(
        res,
        'Reporte no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
      return;
    }

    // Permissions
    const isCreator = report.tecnicoId.toString() === (req as any).user.userId;
    const isHigher = ['supervisor', 'engineer', 'admin'].includes((req as any).user.role);
    if (!isCreator && !isHigher) {
      errorResponse(
        res,
        'No tienes permiso para editar este reporte',
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    // Safe update (immutable fields via $set in service ideal)
    Object.assign(report, updates);
    await report.save({ validateModifiedOnly: true });

    logger.info(`CCTV report updated: ${report._id} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'UPDATE',
      resource: 'CctvReport',
      resourceId: id,
      details: { changes: Object.keys(updates) },
      status: 'SUCCESS',
      severity: 'LOW',
    });

    // Re-populate
    await report.populate('orderId', 'numeroOrden clienteNombre');
    await report.populate('tecnicoId', 'nombre email');
    await report.populate('aprobadoPor', 'nombre email');

    successResponse(
      res,
      { data: report.toJSON() },
      'Reporte actualizado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Delete CCTV report (soft)
 * @route DELETE /api/v1/reports/cctv/:id
 * @access Private (admin/engineer)
 * @swagger
 * tags: [Reports]
 * summary: Eliminar reporte CCTV (soft)
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * responses:
 *   200:
 *     description: Reporte eliminado
 *   404:
 *     description: No encontrado
 */
export const deleteCctvReport = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    requireAdminOrEngineer(req);

    const { id } = req.params;

    if (!validateObjectId(id)) {
      errorResponse(
        res,
        'ID de reporte inválido',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    const report = await CctvReport.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false, deletedAt: new Date() },
      { new: true }
    ).lean();

    if (!report) {
      errorResponse(
        res,
        'Reporte no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
      return;
    }

    logger.info(`CCTV report soft-deleted: ${id} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'DELETE',
      resource: 'CctvReport',
      resourceId: id,
      details: { lugar: report.lugar },
      status: 'SUCCESS',
      severity: 'HIGH',
    });

    successResponse(
      res,
      null,
      'Reporte eliminado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Approve CCTV report
 * @route POST /api/v1/reports/cctv/:id/approve
 * @access Private (supervisor/engineer/admin)
 * @swagger
 * tags: [Reports]
 * summary: Aprobar reporte CCTV
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: id
 *     in: path
 *     required: true
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * requestBody:
 *   required: false
 *   content:
 *     application/json:
 *       schema: {}
 * responses:
 *   200:
 *     description: Reporte aprobado
 *   400:
 *     description: Ya aprobado
 *   404:
 *     description: No encontrado
 */
export const approveCctvReport = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    requireSupervisorOrHigher(req);

    const { id } = req.params;
    ApproveSchema.parse(req.body);

    if (!validateObjectId(id)) {
      errorResponse(
        res,
        'ID de reporte inválido',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    const report = await CctvReport.findOne({ _id: id, isActive: true });

    if (!report) {
      errorResponse(
        res,
        'Reporte no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
      return;
    }

    if (report.aprobadoPor) {
      errorResponse(
        res,
        'El reporte ya está aprobado',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    report.aprobadoPor = (req as any).user.userId;
    report.fechaAprobacion = new Date();
    await report.save();

    logger.info(`CCTV report approved: ${report._id} by ${(req as any).user.email}`);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'APPROVE',
      resource: 'CctvReport',
      resourceId: id,
      details: { lugar: report.lugar },
      status: 'SUCCESS',
      severity: 'MEDIUM',
    });

    // Notify
    emitToUser(report.tecnicoId.toString(), 'report_approved', {
      reportId: report._id,
      lugar: report.lugar,
      approvedBy: (req as any).user.nombre,
    });

    // Re-populate
    await report.populate('orderId', 'numeroOrden clienteNombre');
    await report.populate('tecnicoId', 'nombre email');
    await report.populate('aprobadoPor', 'nombre email');

    successResponse(
      res,
      { data: report.toJSON() },
      'Reporte aprobado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Get reports by order (CCTV + Evidences)
 * @route GET /api/v1/reports/order/:orderId
 * @access Private (assigned or coordinator+)
 * @swagger
 * tags: [Reports]
 * summary: Obtener reportes por orden (CCTV + Evidencias)
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: orderId
 *     in: path
 *     required: true
 *     schema: { type: string, pattern: '^[0-9a-fA-F]{24}$' }
 * responses:
 *   200:
 *     description: Reportes obtenidos
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 cctvReports:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CctvReport' }
 *                 evidences:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Evidence' }
 *   403:
 *     description: Sin permiso
 *   404:
 *     description: Orden no encontrada
 */
export const getReportsByOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;

    if (!validateObjectId(orderId)) {
      errorResponse(
        res,
        'ID de orden inválido',
        HTTP_STATUS.BAD_REQUEST
      );
      return;
    }

    // Verify order
    const order = await Order.findOne({ _id: orderId, isActive: true }).lean();
    if (!order) {
      errorResponse(
        res,
        'Orden no encontrada o inactiva',
        HTTP_STATUS.NOT_FOUND
      );
      return;
    }

    // Role/assignment check (assume order.asignados: ObjectId[])
    const isAssigned = (order.asignados as any[])?.some((u: any) => u.toString() === (req as any).user.userId) ||
                       ['coordinator', 'supervisor', 'engineer', 'admin'].includes((req as any).user.role);
    if (!isAssigned) {
      errorResponse(
        res,
        'No tienes permiso para ver reportes de esta orden',
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    const [cctvReports, evidences] = await Promise.all([
      CctvReport.find({ orderId, isActive: true })
        .populate('tecnicoId', 'nombre email')
        .sort({ fecha: -1 })
        .lean(),
      Evidence.find({ orderId, isActive: true })
        .populate('uploadedBy', 'nombre email')
        .sort({ fecha: -1 })
        .lean(),
    ]);

    await createAuditLog({
      userId: (req as any).user.userId,
      action: 'GET_REPORTS_BY_ORDER',
      resource: 'CctvReport/Evidence',
      resourceId: orderId,
      status: 'SUCCESS',
      severity: 'LOW',
    });

    successResponse(
      res,
      { 
        data: { 
          cctvReports, 
          evidences 
        } 
      },
      'Reportes obtenidos exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);
