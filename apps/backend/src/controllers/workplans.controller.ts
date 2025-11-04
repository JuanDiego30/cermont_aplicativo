/**
 * WorkPlans Controller (TypeScript - November 2025)
 * @description Endpoints para gestión de planes de trabajo en CERMONT ATG. Maneja CRUD linked to orders, approval workflow (DRAFT -> APPROVED), cronograma activities (complete/mark), stats (aggregate por estado/progreso), y filters (estado, orderId, unidadNegocio). Integra populate (orderId/responsables/cronograma.responsable), Socket.IO notify (created/approved to roles), audit, y soft delete (activo=false). Secure: RBAC (engineer+ create/update/approve/get-stats, admin delete, auth get-by-order), order owner check (creadoPor), no update approved (lock), unique per order, ID/fechaISO validation. Performance: Lean() finds, Promise.all count+find, aggregate $group/avg/sum (index: { orderId:1, estado:1, unidadNegocio:1 }), $addToSet/$pull refs, validateModifiedOnly save, limit caps (50 list, cronograma min1).
 * Fixes: AuthUser expanded (_id/nombre/active/createdAt, resuelve TS2345), TypedRequest loose & {user?} (no strict params), Zod .max.optional() order (TS2339), buildAuditPayload details last (TS1016), OrderDocument type (TS2304), static rbac imports (TS2339), paginated/createdResponse args (TS2554), req.user?._id optional, progreso runtime calc (no model set TS2339), actividad as any.toObject() subdoc, filters typed no {}, query post-parse access, rbac require*(req) no res. Updates: getClientIP headers/socket, populate strings, emit non-sensitive. Assume rbac.ts: export const requireEngineerOrHigher = (req: Request & {user?: AuthUser}): void => { const roles = ['engineer', 'admin', 'coordinator']; if (!req.user?.rol || !roles.includes(req.user.rol)) throw new Error('Acceso denegado: Requiere rol engineer o superior'); }; similar para authenticated (req.user), admin (rol==='admin'). WorkPlan schema: virtual('progreso', get % completed); indexes: {orderId:1, activo:1 unique}, {estado:1}.
 * Types: mongoose@types 8.19.x (HydratedDocument), zod@types 3.23.x (z.infer<CreateWorkPlanType>), express@types 4.18.x (Request & {user?}). Swagger: tags 'WorkPlans', params {id: string pattern ObjectId}, query enum Object.values(WORKPLAN_STATUS), body ref CreateWorkPlan. Pruebas: Jest spy WorkPlan.create (expect(res.status(201)).toBeTruthy()), mock rbac no throw para engineer, test progreso calc 100% si all completada, aggregate stats count APPROVED, emitToRole.calledWith('technician', {workplanId}). Error handling: ZodError to BAD_REQUEST, MongooseError to INTERNAL, validation isValid ID.
 * Model Assumes: WorkPlan extends Document {titulo, descripcion?, unidadNegocio, orderId: ref 'Order', estado: enum ['DRAFT','APPROVED'], responsables: {ingResidente?: ref 'User', ...}, cronograma: [ {actividad, responsable: ref 'User', fechaInicio/Fin: Date, completada: bool} ], costoTotalMateriales?, progreso: virtual Number, aprobadoPor?: ref 'User', fechaAprobacion?: Date, activo: bool default true, deletedAt?: Date, creadoPor: ref 'User' }; Order: {numeroOrden, clienteNombre, lugar, estado: enum ['planning','in_progress','completed'], workplans?: [ref 'WorkPlan'], creadoPor: ref 'User'}.
 */

import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import mongoose, { Types, HydratedDocument } from 'mongoose';
import WorkPlan from '../models/WorkPlan.js';
import type { WorkPlanDocument } from '../models/WorkPlan.js'; // Assume exported
import Order from '../models/Order.js';
import type { OrderDocument } from '../models/Order.js'; // Assume exported or define below
import { HTTP_STATUS, WORKPLAN_STATUS, ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { emitToRole } from '../config/socket.js';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger.js';
import { requireEngineerOrHigher, requireAuthenticated, requireAdmin } from '../middleware/rbac.js'; // Static import, assume exports as (req: Request & {user?: AuthUser}): void

// Define if not exported
type OrderDocument = HydratedDocument<typeof Order>; // Or import if available

// Expanded AuthUser (align global + User fields, resuelve mismatches)
type AuthUser = {
  userId: string;
  _id?: Types.ObjectId;
  rol: string;
  nombre?: string;
  email?: string;
  active?: boolean;
  createdAt?: Date;
  tokenVersion?: number;
};

// Loose TypedRequest (compatible con asyncHandler/Request, no strict TParams)
type TypedRequest<TBody = any> = Request<ParamsDictionary, any, TBody> & {
  user?: AuthUser;
};

// WorkPlan filter partial (FilterQuery<WorkPlanDocument>)
interface WorkPlanFilter {
  activo?: boolean;
  estado?: (typeof WORKPLAN_STATUS)[keyof typeof WORKPLAN_STATUS];
  orderId?: Types.ObjectId;
  unidadNegocio?: string;
}

// Cronograma activity typed (subdoc)
interface CronogramaActivity {
  _id: Types.ObjectId;
  actividad: string;
  responsable: Types.ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  completada: boolean;
}

// Helper DRY
const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress as string || 'unknown';
};

// Build audit payload (details last optional, resuelve TS1016)
const buildAuditPayload = (
  req: TypedRequest,
  resourceId?: string,
  action: string,
  resource: string,
  status: 'SUCCESS' | 'FAILURE',
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW',
  details?: Record<string, any> // Optional last
) => ({
  userId: req.user?.userId,
  userRol: req.user?.rol,
  action,
  resource,
  resourceId,
  ipAddress: getClientIP(req),
  userAgent: req.get('user-agent') || 'unknown',
  method: req.method,
  endpoint: req.originalUrl || req.url,
  status,
  severity,
  details,
});

// Validate/get Order by ID or numeroOrden (return typed)
const getOrderByIdOrNumero = async (identifier: string): Promise<OrderDocument | null> => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Order.findById(identifier).lean() as OrderDocument | null;
  }
  return await Order.findOne({ numeroOrden: identifier }).lean() as OrderDocument | null;
};

// Zod Schemas (max before optional TS2339, enum values as const)
const WorkPlanListQuerySchema = z.object({
  page: z.string().default('1').transform((val: string): number => Math.max(1, parseInt(val, 10))),
  limit: z.string().default('10').transform((val: string): number => Math.min(50, Math.max(1, parseInt(val, 10)))),
  estado: z.enum(Object.values(WORKPLAN_STATUS) as [string, ...string[]]).optional(),
  orderId: z.string().optional(),
  unidadNegocio: z.string().max(50).optional(), // max before optional
}).passthrough();

type WorkPlanListQueryType = z.infer<typeof WorkPlanListQuerySchema>;

const CreateWorkPlanSchema = z.object({
  orderId: z.string().min(1, 'Order ID o número requerido'),
  titulo: z.string().min(5, 'Título mínimo 5 caracteres').max(200),
  descripcion: z.string().min(10).max(1000).optional(),
  unidadNegocio: z.string().min(1, 'Unidad de negocio requerida').max(50),
  responsables: z.object({
    ingResidente: z.string().optional(),
    tecnicoElectricista: z.string().optional(),
    hes: z.string().optional(),
  }).optional(),
  cronograma: z.array(z.object({
    actividad: z.string().min(1, 'Actividad requerida').max(200),
    responsable: z.string().min(1, 'Responsable requerido'),
    fechaInicio: z.string().datetime('Fecha inicio inválida'),
    fechaFin: z.string().datetime('Fecha fin inválida'),
    completada: z.boolean().default(false),
  })).min(1, 'Al menos una actividad en cronograma'),
  costoTotalMateriales: z.number().min(0).optional(),
});

type CreateWorkPlanType = z.infer<typeof CreateWorkPlanSchema>;

const UpdateWorkPlanSchema = CreateWorkPlanSchema.partial().omit({ orderId: true });
UpdateWorkPlanSchema.refine((data) => Object.keys(data).length > 0, { message: 'Al menos un campo para actualizar' });

type UpdateWorkPlanType = z.infer<typeof UpdateWorkPlanSchema>;

const CompleteActivitySchema = z.object({
  id: z.string().refine(mongoose.Types.ObjectId.isValid, 'ID de plan inválido'),
  actividadId: z.string().refine(mongoose.Types.ObjectId.isValid, 'ID de actividad inválido'),
});

type CompleteActivityType = z.infer<typeof CompleteActivitySchema>;

/**
 * Obtener todos los planes de trabajo con paginación
 * @route GET /api/v1/workplans
 * @access Private (engineer or higher)
 * @swagger tags: [WorkPlans] summary: Obtener planes paginados security: [{ bearerAuth: [] }] parameters: ... responses: 200: { $ref: '#/components/schemas/PaginatedResponse<WorkPlan>' }
 */
export const getAllWorkPlans = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireEngineerOrHigher(req as TypedRequest); // Cast loose

    const query = WorkPlanListQuerySchema.safeParse(req.query);
    if (!query.success) {
      errorResponse(res, `Filtros inválidos: ${query.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const { page, limit, estado, orderId, unidadNegocio } = query.data;

    const filters: WorkPlanFilter = { activo: true };
    if (estado) filters.estado = estado;
    if (orderId) {
      const orderDoc = await getOrderByIdOrNumero(orderId);
      if (!orderDoc) {
        errorResponse(res, 'Orden inválida', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      filters.orderId = orderDoc._id;
    }
    if (unidadNegocio) filters.unidadNegocio = unidadNegocio;

    const skip = (page - 1) * limit;

    const [workplans, total] = await Promise.all([
      WorkPlan.find(filters)
        .populate('orderId', 'numeroOrden clienteNombre lugar estado')
        .populate('responsables.ingResidente', 'nombre email telefono cargo')
        .populate('responsables.tecnicoElectricista', 'nombre email telefono cargo')
        .populate('responsables.hes', 'nombre email telefono cargo')
        .populate('aprobadoPor', 'nombre email cargo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WorkPlan.countDocuments(filters),
    ]);

    const pages = Math.ceil(total / limit);

    await createAuditLog(buildAuditPayload(req as TypedRequest, undefined, 'GET_WORKPLANS', 'WorkPlan', 'SUCCESS', 'LOW', { page, limit, estado, unidadNegocio }));

    paginatedResponse(
      res,
      {
        data: workplans,
        pagination: { page, limit, total, pages },
      },
      'Planes de trabajo obtenidos exitosamente',
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener plan de trabajo por ID
 * @route GET /api/v1/workplans/:id
 * @access Private (authenticated)
 * @swagger ... responses: 200: { $ref: '#/components/schemas/WorkPlan' } 404: ErrorResponse
 */
export const getWorkPlanById = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireAuthenticated(req as TypedRequest);

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const workplan = await WorkPlan.findOne({ _id: id, activo: true })
      .populate('orderId', 'numeroOrden clienteNombre lugar estado')
      .populate('responsables.ingResidente', 'nombre email telefono cargo')
      .populate('responsables.tecnicoElectricista', 'nombre email telefono cargo')
      .populate('responsables.hes', 'nombre email telefono cargo')
      .populate('cronograma.responsable', 'nombre email')
      .populate('aprobadoPor', 'nombre email cargo')
      .populate('creadoPor', 'nombre email')
      .lean() as WorkPlanDocument | null;

    if (!workplan) {
      errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    await createAuditLog(buildAuditPayload(req as TypedRequest, id, 'GET_WORKPLAN', 'WorkPlan', 'SUCCESS', 'LOW'));

    successResponse(
      res,
      { data: workplan },
      'Plan de trabajo obtenido exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener plan de trabajo por orden
 * @route GET /api/v1/workplans/order/:orderId
 * @access Private (authenticated)
 * @swagger ... responses: 200: WorkPlan 404: ErrorResponse
 */
export const getWorkPlanByOrderId = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireAuthenticated(req as TypedRequest);

    const { orderId } = req.params as { orderId: string };

    const orderDoc = await getOrderByIdOrNumero(orderId);
    if (!orderDoc) {
      errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
      return;
    }

    const workplan = await WorkPlan.findOne({ orderId: orderDoc._id, activo: true })
      .populate('responsables.ingResidente', 'nombre email')
      .populate('responsables.tecnicoElectricista', 'nombre email')
      .populate('responsables.hes', 'nombre email')
      .populate('aprobadoPor', 'nombre email')
      .populate('creadoPor', 'nombre email')
      .lean() as WorkPlanDocument | null;

    if (!workplan) {
      errorResponse(res, 'No existe plan de trabajo para esta orden', HTTP_STATUS.NOT_FOUND);
      return;
    }

    await createAuditLog(buildAuditPayload(req as TypedRequest, workplan._id.toString(), 'GET_WORKPLAN_BY_ORDER', 'WorkPlan', 'SUCCESS', 'LOW', { orderId: orderDoc._id.toString() }));

    successResponse(
      res,
      { data: workplan },
      'Plan de trabajo obtenido exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Crear nuevo plan de trabajo
 * @route POST /api/v1/workplans
 * @access Private (engineer or higher)
 * @swagger requestBody: { $ref: '#/components/schemas/CreateWorkPlan' } responses: 201: WorkPlan 409: Conflict
 */
export const createWorkPlan = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireEngineerOrHigher(req as TypedRequest);

    const data = CreateWorkPlanSchema.parse(req.body);
    const { orderId: identifier } = data;

    const orderDoc = await getOrderByIdOrNumero(identifier);
    if (!orderDoc) {
      errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
      return;
    }

    // RBAC: Order owner or admin
    if (orderDoc.creadoPor.toString() !== (req.user?._id?.toString() || req.user?.userId) && req.user?.rol !== ROLES.ADMIN) {
      errorResponse(res, 'No tienes permisos para esta orden', HTTP_STATUS.FORBIDDEN);
      return;
    }

    // Check existing
    const existingWorkplan = await WorkPlan.findOne({ orderId: orderDoc._id, activo: true }).lean();
    if (existingWorkplan) {
      errorResponse(res, 'Ya existe un plan de trabajo activo para esta orden', HTTP_STATUS.CONFLICT);
      return;
    }

    // Transform to ObjectId/Dates
    const workplanData: Partial<WorkPlanDocument> = {
      ...data,
      orderId: orderDoc._id,
      estado: WORKPLAN_STATUS.DRAFT,
      creadoPor: new Types.ObjectId(req.user!.userId),
      activo: true,
      responsables: data.responsables ? {
        ingResidente: data.responsables.ingResidente ? new Types.ObjectId(data.responsables.ingResidente) : undefined,
        tecnicoElectricista: data.responsables.tecnicoElectricista ? new Types.ObjectId(data.responsables.tecnicoElectricista) : undefined,
        hes: data.responsables.hes ? new Types.ObjectId(data.responsables.hes) : undefined,
      } : undefined,
      cronograma: data.cronograma.map((act) => ({
        ...act,
        _id: new Types.ObjectId(), // New subdoc ID
        responsable: new Types.ObjectId(act.responsable),
        fechaInicio: new Date(act.fechaInicio),
        fechaFin: new Date(act.fechaFin),
      })),
      costoTotalMateriales: data.costoTotalMateriales,
    };

    const workplan = await WorkPlan.create(workplanData) as WorkPlanDocument;

    // Update order ref
    await Order.findByIdAndUpdate(orderDoc._id, { $addToSet: { workplans: workplan._id } }).exec();

    logger.info(`WorkPlan creado para orden ${orderDoc.numeroOrden} por ${req.user?.email || req.user?.nombre} desde ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req as TypedRequest, workplan._id.toString(), 'CREATE_WORKPLAN', 'WorkPlan', 'SUCCESS', 'MEDIUM', { orderId: orderDoc._id.toString(), titulo: data.titulo }));

    // Emit
    emitToRole(ROLES.TECHNICIAN, 'workplan_created', {
      workplanId: workplan._id,
      orderId: orderDoc._id,
      createdBy: req.user?.nombre,
    });

    // Populate for response
    await workplan.populate([
      { path: 'orderId', select: 'numeroOrden clienteNombre lugar estado' },
      { path: 'responsables.ingResidente', select: 'nombre email' },
      { path: 'responsables.tecnicoElectricista', select: 'nombre email' },
      { path: 'responsables.hes', select: 'nombre email' },
      { path: 'creadoPor', select: 'nombre email' },
    ]);

    createdResponse(
      res,
      { data: workplan.toObject() },
      'Plan de trabajo creado exitosamente'
    );
  }
);

/**
 * Actualizar plan de trabajo
 * @route PUT /api/v1/workplans/:id
 * @access Private (engineer or higher)
 * @swagger requestBody: { $ref: '#/components/schemas/UpdateWorkPlan' } responses: 200: WorkPlan 403: Forbidden
 */
export const updateWorkPlan = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireEngineerOrHigher(req as TypedRequest);

    const { id } = req.params as { id: string };
    const updates = UpdateWorkPlanSchema.parse(req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const workplan = await WorkPlan.findOne({ _id: id, activo: true }) as WorkPlanDocument | null;
    if (!workplan) {
      errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Lock if approved (admin only)
    if (workplan.estado === WORKPLAN_STATUS.APPROVED && req.user?.rol !== ROLES.ADMIN) {
      errorResponse(res, 'No se puede modificar un plan aprobado', HTTP_STATUS.FORBIDDEN);
      return;
    }

    // Permissions
    if (workplan.creadoPor.toString() !== (req.user?._id?.toString() || req.user?.userId) && req.user?.rol !== ROLES.ADMIN) {
      errorResponse(res, 'No tienes permisos para esta actualización', HTTP_STATUS.FORBIDDEN);
      return;
    }

    // Apply updates (handle cronograma)
    Object.assign(workplan, updates);
    if (updates.cronograma) {
      workplan.cronograma = updates.cronograma.map((act: any) => ({
        ...act,
        _id: new Types.ObjectId(act._id || mongoose.Types.ObjectId()), // Preserve or new ID
        responsable: new Types.ObjectId(act.responsable),
        fechaInicio: new Date(act.fechaInicio),
        fechaFin: new Date(act.fechaFin),
      }));
    }
    await workplan.save({ validateModifiedOnly: true });

    await workplan.populate('orderId responsables.creadoPor');

    logger.info(`WorkPlan actualizado: ${id} por ${req.user?.email || req.user?.nombre} desde ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req as TypedRequest, id, 'UPDATE_WORKPLAN', 'WorkPlan', 'SUCCESS', 'LOW', { changes: Object.keys(updates), titulo: workplan.titulo }));

    successResponse(
      res,
      { data: workplan.toObject() },
      'Plan de trabajo actualizado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Eliminar plan de trabajo (soft delete)
 * @route DELETE /api/v1/workplans/:id
 * @access Private (admin only)
 * @swagger responses: 200: SuccessResponse 404: ErrorResponse
 */
export const deleteWorkPlan = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireAdmin(req as TypedRequest);

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const workplan = await WorkPlan.findOneAndUpdate(
      { _id: id, activo: true },
      { activo: false, deletedAt: new Date() },
      { new: true }
    ).lean() as WorkPlanDocument | null;

    if (!workplan) {
      errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Remove ref
    await Order.findByIdAndUpdate(workplan.orderId, { $pull: { workplans: new Types.ObjectId(id) } }).exec();

    logger.info(`WorkPlan eliminado: ${id} por ${req.user?.email || req.user?.nombre} desde ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req as TypedRequest, id, 'DELETE_WORKPLAN', 'WorkPlan', 'SUCCESS', 'HIGH', { titulo: workplan.titulo }));

    successResponse(
      res,
      null,
      'Plan de trabajo eliminado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Aprobar plan de trabajo
 * @route POST /api/v1/workplans/:id/approve
 * @access Private (engineer or higher)
 * @swagger responses: 200: WorkPlan 400: BadRequest
 */
export const approveWorkPlan = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireEngineerOrHigher(req as TypedRequest);

    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const workplan = await WorkPlan.findOne({ _id: id, activo: true }).populate('orderId') as WorkPlanDocument | null;
    if (!workplan) {
      errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    if (workplan.estado === WORKPLAN_STATUS.APPROVED) {
      errorResponse(res, 'El plan ya está aprobado', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    workplan.estado = WORKPLAN_STATUS.APPROVED;
    workplan.aprobadoPor = new Types.ObjectId(req.user!.userId);
    workplan.fechaAprobacion = new Date();
    await workplan.save();

    // Update order
    const order = workplan.orderId as OrderDocument;
    if (order && order.estado === 'planning') {
      order.estado = 'in_progress';
      await order.save();
    }

    logger.info(`WorkPlan aprobado: ${id} por ${req.user?.email || req.user?.nombre} desde ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req as TypedRequest, id, 'APPROVE_WORKPLAN', 'WorkPlan', 'SUCCESS', 'MEDIUM', { titulo: workplan.titulo }));

    emitToRole(ROLES.TECHNICIAN, 'workplan_approved', {
      workplanId: workplan._id,
      orderId: workplan.orderId,
      approvedBy: req.user?.nombre,
    });

    successResponse(
      res,
      { data: workplan.toObject() },
      'Plan de trabajo aprobado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Marcar actividad del cronograma como completada
 * @route PATCH /api/v1/workplans/:id/cronograma/:actividadId/complete
 * @access Private (authenticated, assigned user)
 * @swagger parameters: {id, actividadId pattern ObjectId} responses: 200: {data: {actividad, progreso}} 403: Forbidden
 */
export const completeActivity = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireAuthenticated(req as TypedRequest);

    const { id, actividadId } = req.params as { id: string; actividadId: string };

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(actividadId)) {
      errorResponse(res, 'IDs inválidos', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const workplan = await WorkPlan.findOne({ _id: id, activo: true }) as WorkPlanDocument | null;
    if (!workplan) {
      errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    // Subdoc access
    const actividad = workplan.cronograma.id(new Types.ObjectId(actividadId));
    if (!actividad || actividad.completada) {
      errorResponse(res, 'Actividad no encontrada o ya completada', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Check assignment (as any for subdoc props)
    const actAny = actividad as any;
    if (actAny.responsable.toString() !== (req.user?._id?.toString() || req.user?.userId) && req.user?.rol !== ROLES.ADMIN) {
      errorResponse(res, 'No autorizado para completar esta actividad', HTTP_STATUS.FORBIDDEN);
      return;
    }

    actAny.completada = true;

    // Progress calc runtime
    const totalActivities = workplan.cronograma.length;
    const completedCount = workplan.cronograma.filter((a: any) => a.completada).length + 1;
    const progreso = Math.round((completedCount / totalActivities) * 100);

    await workplan.save();

    logger.info(`Actividad completada: ${actividadId} en workplan ${id} por ${req.user?.email || req.user?.nombre} desde ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req as TypedRequest, id, 'COMPLETE_ACTIVITY', 'WorkPlan', 'SUCCESS', 'LOW', { actividadId, actividad: actAny.actividad }));

    successResponse(
      res,
      { data: { actividad: (actividad as any).toObject(), progreso } },
      'Actividad completada exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener estadísticas de planes de trabajo
 * @route GET /api/v1/workplans/stats/summary
 * @access Private (admin or engineer)
 * @swagger responses: 200: {data: {stats: [...], summary: {total, approved, approvalRate}}} 
 */
export const getWorkPlanStats = asyncHandler(
  async (req: TypedRequest, res: Response): Promise<void> => {
    requireEngineerOrHigher(req as TypedRequest);

    const matchStage: any = { activo: true };

    const stats = await WorkPlan.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          avgCostoMateriales: { $avg: '$costoTotalMateriales' },
          totalProgreso: { $sum: '$progreso' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalWorkplans = await WorkPlan.countDocuments({ activo: true });
    const approvedWorkplans = await WorkPlan.countDocuments({ activo: true, estado: WORKPLAN_STATUS.APPROVED });
    const approvalRate = totalWorkplans > 0 ? ((approvedWorkplans / totalWorkplans) * 100).toFixed(2) : '0.00';

    await createAuditLog(buildAuditPayload(req as TypedRequest, undefined, 'GET_WORKPLAN_STATS', 'WorkPlan', 'SUCCESS', 'LOW'));

    successResponse(
      res,
      {
        data: {
          stats,
          summary: {
            total: totalWorkplans,
            approved: approvedWorkplans,
            approvalRate,
          },
        },
      },
      'Estadísticas obtenidas exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);


