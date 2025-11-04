/**
 * WorkPlan Model (TypeScript - November 2025 - FIXED)
 * @description Modelo Mongoose para planes de trabajo CERMONT ATG
 */

import mongoose, { Schema, Document, Model, HydratedDocument, Types } from 'mongoose';
import { logger } from '../utils/logger.js';

// ==================== CONSTANTS ====================

const WORKPLAN_STATUS_VALUES = ['draft', 'approved', 'in_progress', 'completed', 'rejected'] as const;
const BUSINESS_UNITS_VALUES = ['CCTV', 'IT', 'MNT', 'SC', 'GEN', 'OTROS'] as const;
const PRIORITY_VALUES = ['baja', 'media', 'alta', 'urgente'] as const;
const RISK_LEVELS = ['bajo', 'medio', 'alto', 'critico'] as const;

type WorkPlanStatus = typeof WORKPLAN_STATUS_VALUES[number];
type BusinessUnit = typeof BUSINESS_UNITS_VALUES[number];
type Priority = typeof PRIORITY_VALUES[number];
type RiskLevel = typeof RISK_LEVELS[number];
type RolAprobacion = 'engineer' | 'coordinator_hes' | 'admin';

// ==================== INTERFACES ====================

export interface IWorkPlan extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  titulo: string;
  descripcion?: string;
  alcance: string;
  unidadNegocio: BusinessUnit;
  responsables: {
    ingResidente?: Types.ObjectId;
    tecnicoElectricista?: Types.ObjectId;
    hes?: Types.ObjectId;
  };
  creadoPor: Types.ObjectId;
  materiales: any[];
  herramientas: any[];
  equipos: any[];
  elementosSeguridad: any[];
  personalRequerido: {
    electricistas?: number;
    tecnicosTelecomunicacion?: number;
    instrumentistas?: number;
    obreros?: number;
  };
  cronograma: any[];
  estado: WorkPlanStatus;
  aprobaciones: any[];
  aprobadoPor?: Types.ObjectId;
  fechaAprobacion?: Date;
  observaciones?: string;
  riesgos: any[];
  metricas: {
    costoTotalEstimado?: number;
    duracionTotalDias?: number;
    porcentajeCompletado?: number;
    materialesCompletos?: boolean;
    herramientasCompletas?: boolean;
  };
  archivos: any[];
  requiereRevision?: boolean;
  prioridad: Priority;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  costoTotalMateriales: number;
  totalPersonal: number;
  progresoActividades: number;
  estaAprobado: boolean;
  totalHerramientas: number;
  totalEquipos: number;
  materialesRecibidos: number;
  tieneCertificadosVencidos: boolean;
  duracionTotal: number;
}

export interface IWorkPlanMethods {
  completeActivity(activityId: Types.ObjectId, userId: Types.ObjectId): Promise<HydratedDocument<IWorkPlan>>;
  aprobar(userId: Types.ObjectId, rol: RolAprobacion, comentarios?: string): Promise<HydratedDocument<IWorkPlan>>;
  rechazar(userId: Types.ObjectId, rol: RolAprobacion, comentarios: string): Promise<HydratedDocument<IWorkPlan>>;
  verificarRecursos(): { todoListo: boolean; faltantes: any };
  getProximasActividades(dias?: number): any[];
}

export interface IWorkPlanModel extends Model<IWorkPlan, {}, IWorkPlanMethods> {
  findByStatus(status: WorkPlanStatus, options?: { page?: number; limit?: number }): Promise<HydratedDocument<IWorkPlan>[]>;
  findPendingApproval(options?: { page?: number; limit?: number }): Promise<HydratedDocument<IWorkPlan>[]>;
  findByOrder(orderId: Types.ObjectId): Promise<HydratedDocument<IWorkPlan> | null>;
  findByResponsable(userId: Types.ObjectId, options?: { page?: number; limit?: number }): Promise<HydratedDocument<IWorkPlan>[]>;
  findByUnidad(unidad: BusinessUnit, options?: { estado?: any; page?: number; limit?: number }): Promise<HydratedDocument<IWorkPlan>[]>;
  search(query: string, options?: { page?: number; limit?: number }): Promise<HydratedDocument<IWorkPlan>[]>;
  getEstadisticas(): Promise<any[]>;
  getByPrioridad(prioridad: Priority): Promise<HydratedDocument<IWorkPlan>[]>;
}

// ==================== SUB-SCHEMAS ====================

const MaterialSchema = new Schema({
  descripcion: { type: String, required: true, trim: true, maxlength: 200 },
  cantidad: { type: Number, required: true, min: 0, max: 1000 },
  unidad: { type: String, default: 'und', trim: true, maxlength: 10 },
  proveedor: { type: String, trim: true, maxlength: 100 },
  costo: { type: Number, min: 0, default: 0 },
  solicitado: { type: Boolean, default: false },
  recibido: { type: Boolean, default: false },
  fechaSolicitud: Date,
  fechaRecepcion: Date,
}, { _id: true });

const HerramientaSchema = new Schema({
  descripcion: { type: String, required: true, trim: true, maxlength: 200 },
  cantidad: { type: Number, required: true, min: 1, max: 50 },
  disponible: { type: Boolean, default: true },
  ubicacion: { type: String, trim: true, maxlength: 100 },
  toolkitId: { type: Schema.Types.ObjectId, ref: 'ToolKit' },
}, { _id: true });

const EquipoSchema = new Schema({
  descripcion: { type: String, required: true, trim: true, maxlength: 200 },
  cantidad: { type: Number, required: true, min: 1, max: 20 },
  certificado: {
    numero: { type: String, trim: true, maxlength: 50 },
    vigencia: Date,
    vencido: { type: Boolean, default: false },
  },
}, { _id: true });

const ElementoSeguridadSchema = new Schema({
  descripcion: { type: String, required: true, trim: true, maxlength: 200 },
  cantidad: { type: Number, required: true, min: 1, max: 50 },
  categoria: { type: String, enum: ['EPP', 'Señalización', 'Protección colectiva', 'Emergencia', 'Otro'], default: 'EPP' },
}, { _id: true });

const ActividadSchema = new Schema({
  actividad: { type: String, required: true, trim: true, maxlength: 300 },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  responsable: { type: Schema.Types.ObjectId, ref: 'User' },
  completada: { type: Boolean, default: false },
  fechaCompletada: Date,
  duracionReal: { type: Number, min: 0 },
  observaciones: { type: String, trim: true, maxlength: 500 },
}, { _id: true });

const AprobacionSchema = new Schema({
  aprobadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rol: { type: String, enum: ['engineer', 'coordinator_hes', 'admin'], required: true },
  aprobado: { type: Boolean, required: true },
  comentarios: { type: String, trim: true, maxlength: 500 },
  fecha: { type: Date, default: Date.now },
}, { _id: true });

const RiesgoSchema = new Schema({
  descripcion: { type: String, required: true, trim: true, maxlength: 500 },
  nivel: { type: String, enum: RISK_LEVELS, default: 'medio' },
  medidaControl: { type: String, trim: true, maxlength: 500 },
  responsable: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const ArchivoSchema = new Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 200 },
  url: { type: String, required: true, maxlength: 500 },
  tipo: { type: String, trim: true, maxlength: 50 },
  categoria: { type: String, enum: ['plano', 'certificado', 'cotizacion', 'foto', 'otro'], default: 'otro' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

// ==================== MAIN SCHEMA ====================

const WorkPlanSchema = new Schema<IWorkPlan, IWorkPlanModel, IWorkPlanMethods>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true,
  },
  titulo: { type: String, required: true, trim: true, maxlength: 200 },
  descripcion: { type: String, trim: true, maxlength: 1000 },
  alcance: { type: String, required: true, trim: true, maxlength: 3000 },
  unidadNegocio: { type: String, enum: BUSINESS_UNITS_VALUES, required: true },
  responsables: {
    ingResidente: { type: Schema.Types.ObjectId, ref: 'User' },
    tecnicoElectricista: { type: Schema.Types.ObjectId, ref: 'User' },
    hes: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  materiales: [MaterialSchema],
  herramientas: [HerramientaSchema],
  equipos: [EquipoSchema],
  elementosSeguridad: [ElementoSeguridadSchema],
  personalRequerido: {
    electricistas: { type: Number, default: 0, min: 0, max: 20 },
    tecnicosTelecomunicacion: { type: Number, default: 0, min: 0, max: 20 },
    instrumentistas: { type: Number, default: 0, min: 0, max: 20 },
    obreros: { type: Number, default: 0, min: 0, max: 20 },
  },
  cronograma: [ActividadSchema],
  estado: { type: String, enum: WORKPLAN_STATUS_VALUES, default: 'draft' },
  aprobaciones: [AprobacionSchema],
  aprobadoPor: { type: Schema.Types.ObjectId, ref: 'User' },
  fechaAprobacion: Date,
  observaciones: { type: String, trim: true, maxlength: 2000 },
  riesgos: [RiesgoSchema],
  metricas: {
    costoTotalEstimado: { type: Number, default: 0, min: 0 },
    duracionTotalDias: { type: Number, default: 0, min: 0 },
    porcentajeCompletado: { type: Number, default: 0, min: 0, max: 100 },
    materialesCompletos: { type: Boolean, default: false },
    herramientasCompletas: { type: Boolean, default: false },
  },
  archivos: [ArchivoSchema],
  requiereRevision: { type: Boolean, default: false },
  prioridad: { type: String, enum: PRIORITY_VALUES, default: 'media' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
});

// ==================== INDICES ====================

WorkPlanSchema.index({ orderId: 1, estado: 1 });
WorkPlanSchema.index({ estado: 1, createdAt: -1 });
WorkPlanSchema.index({ unidadNegocio: 1, estado: 1 });
WorkPlanSchema.index({ prioridad: 1, estado: 1 });
WorkPlanSchema.index({ 'responsables.ingResidente': 1 });
WorkPlanSchema.index({ creadoPor: 1, estado: 1 });

// ==================== VIRTUALS ====================

WorkPlanSchema.virtual('costoTotalMateriales').get(function(): number {
  return this.materiales.reduce((total: number, m: any) => total + ((m.costo || 0) * (m.cantidad || 0)), 0);
});

WorkPlanSchema.virtual('totalPersonal').get(function(): number {
  const p = this.personalRequerido;
  return (p.electricistas || 0) + (p.tecnicosTelecomunicacion || 0) + (p.instrumentistas || 0) + (p.obreros || 0);
});

WorkPlanSchema.virtual('progresoActividades').get(function(): number {
  if (this.cronograma.length === 0) return 0;
  const completed = this.cronograma.filter((a: any) => a.completada).length;
  return Math.round((completed / this.cronograma.length) * 100);
});

WorkPlanSchema.virtual('estaAprobado').get(function(): boolean {
  return this.estado === 'approved';
});

WorkPlanSchema.virtual('totalHerramientas').get(function(): number {
  return this.herramientas.reduce((sum: number, h: any) => sum + (h.cantidad || 0), 0);
});

WorkPlanSchema.virtual('totalEquipos').get(function(): number {
  return this.equipos.reduce((sum: number, e: any) => sum + (e.cantidad || 0), 0);
});

WorkPlanSchema.virtual('materialesRecibidos').get(function(): number {
  if (this.materiales.length === 0) return 0;
  const received = this.materiales.filter((m: any) => m.recibido).length;
  return Math.round((received / this.materiales.length) * 100);
});

WorkPlanSchema.virtual('tieneCertificadosVencidos').get(function(): boolean {
  const now = new Date();
  return this.equipos.some((e: any) => e.certificado?.vigencia && e.certificado.vigencia < now);
});

WorkPlanSchema.virtual('duracionTotal').get(function(): number {
  if (this.cronograma.length === 0) return 0;
  const starts = this.cronograma.map((a: any) => new Date(a.fechaInicio).getTime());
  const ends = this.cronograma.map((a: any) => new Date(a.fechaFin).getTime());
  const start = Math.min(...starts);
  const end = Math.max(...ends);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// ==================== HOOKS ====================

WorkPlanSchema.pre('save', function(next) {
  this.metricas.costoTotalEstimado = this.costoTotalMateriales;
  this.metricas.duracionTotalDias = this.duracionTotal;
  this.metricas.porcentajeCompletado = this.progresoActividades;
  this.metricas.materialesCompletos = this.materiales.length > 0 && this.materiales.every((m: any) => m.recibido);
  this.metricas.herramientasCompletas = this.herramientas.length > 0 && this.herramientas.every((h: any) => h.disponible);

  const now = new Date();
  this.equipos.forEach((e: any) => {
    if (e.certificado?.vigencia) e.certificado.vencido = e.certificado.vigencia < now;
  });

  if (this.cronograma.some((a: any) => new Date(a.fechaFin) <= new Date(a.fechaInicio))) {
    return next(new Error('Fecha fin debe ser posterior a inicio'));
  }

  if (this.isModified() && !this.isNew) this.updatedBy = this.updatedBy || this.creadoPor;

  next();
});

// ==================== INSTANCE METHODS ====================

WorkPlanSchema.methods.completeActivity = async function(
  activityId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<HydratedDocument<IWorkPlan>> {
  const activity = this.cronograma.find((a: any) => a._id.equals(activityId));
  if (!activity || activity.completada) return this;

  activity.completada = true;
  activity.fechaCompletada = new Date();
  const duration = activity.fechaCompletada.getTime() - new Date(activity.fechaInicio).getTime();
  activity.duracionReal = Math.round(duration / (1000 * 60 * 60));

  await this.save();
  logger.info(`Activity ${activityId} completed in plan ${this._id}`);
  return this;
};

WorkPlanSchema.methods.aprobar = async function(
  userId: Types.ObjectId,
  rol: RolAprobacion,
  comentarios: string = ''
): Promise<HydratedDocument<IWorkPlan>> {
  if (!['engineer', 'coordinator_hes', 'admin'].includes(rol)) {
    throw new Error('Rol no autorizado para aprobación');
  }

  this.aprobaciones.push({
    aprobadoPor: userId,
    rol,
    aprobado: true,
    comentarios,
    fecha: new Date(),
  });

  const requiredRoles = ['engineer', 'coordinator_hes'];
  const approvedRoles = this.aprobaciones.filter((a: any) => a.aprobado).map((a: any) => a.rol);
  if (requiredRoles.every(r => approvedRoles.includes(r))) {
    this.estado = 'approved';
    this.aprobadoPor = userId;
    this.fechaAprobacion = new Date();
    this.requiereRevision = false;
  }

  await this.save();
  logger.info(`WorkPlan ${this._id} approved by ${userId}`);
  return this;
};

WorkPlanSchema.methods.rechazar = async function(
  userId: Types.ObjectId,
  rol: RolAprobacion,
  comentarios: string
): Promise<HydratedDocument<IWorkPlan>> {
  if (!['engineer', 'coordinator_hes', 'admin'].includes(rol)) {
    throw new Error('Rol no autorizado para rechazo');
  }

  this.aprobaciones.push({
    aprobadoPor: userId,
    rol,
    aprobado: false,
    comentarios,
    fecha: new Date(),
  });

  this.estado = 'draft';
  this.requiereRevision = true;

  await this.save();
  logger.warn(`WorkPlan ${this._id} rejected: ${comentarios}`);
  return this;
};

WorkPlanSchema.methods.verificarRecursos = function() {
  const faltantes = {
    materiales: this.materiales.filter((m: any) => !m.recibido),
    herramientas: this.herramientas.filter((h: any) => !h.disponible),
    equiposSinCert: this.equipos.filter((e: any) => !e.certificado?.numero),
    certVencidos: this.equipos.filter((e: any) => e.certificado?.vencido),
  };

  const todoListo = faltantes.materiales.length === 0 &&
    faltantes.herramientas.length === 0 &&
    faltantes.equiposSinCert.length === 0 &&
    faltantes.certVencidos.length === 0;

  return { todoListo, faltantes };
};

WorkPlanSchema.methods.getProximasActividades = function(dias: number = 7) {
  const now = new Date();
  const limit = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);
  return this.cronograma
    .filter((a: any) => !a.completada && new Date(a.fechaInicio) >= now && new Date(a.fechaInicio) <= limit)
    .sort((a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
};

// ==================== STATIC METHODS ====================

WorkPlanSchema.statics.findByStatus = function(
  status: WorkPlanStatus,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  return this.find({ estado: status })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('creadoPor', 'nombre apellido')
    .lean();
};

WorkPlanSchema.statics.findPendingApproval = function(
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  return this.find({ estado: 'draft', requiereRevision: { $ne: true } })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate('responsables', 'nombre apellido')
    .lean();
};

WorkPlanSchema.statics.findByOrder = function(orderId: Types.ObjectId) {
  return this.findOne({ orderId })
    .populate('responsables', 'nombre apellido rol')
    .populate('orderId', 'numeroOrden estado');
};

WorkPlanSchema.statics.findByResponsable = function(
  userId: Types.ObjectId,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  return this.find({
    $or: [
      { 'responsables.ingResidente': userId },
      { 'responsables.tecnicoElectricista': userId },
      { 'responsables.hes': userId },
      { creadoPor: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('orderId', 'numeroOrden')
    .lean();
};

WorkPlanSchema.statics.findByUnidad = function(
  unidad: BusinessUnit,
  options: { estado?: any; page?: number; limit?: number } = {}
) {
  const { estado = { $ne: 'draft' }, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  return this.find({ unidadNegocio: unidad, estado })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

WorkPlanSchema.statics.search = function(
  query: string,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

WorkPlanSchema.statics.getEstadisticas = async function() {
  return this.aggregate([
    { $match: { estado: { $ne: 'draft' } } },
    {
      $group: {
        _id: { estado: '$estado', unidadNegocio: '$unidadNegocio' },
        count: { $sum: 1 },
        costoPromedio: { $avg: '$metricas.costoTotalEstimado' },
        duracionPromedio: { $avg: '$metricas.duracionTotalDias' },
        avgProgreso: { $avg: '$metricas.porcentajeCompletado' },
      },
    },
    { $sort: { '_id.unidadNegocio': 1, count: -1 } },
  ]);
};

WorkPlanSchema.statics.getByPrioridad = function(prioridad: Priority) {
  return this.find({ prioridad, estado: { $in: ['approved', 'in_progress'] } })
    .populate('orderId')
    .sort({ createdAt: -1 })
    .lean();
};

// ==================== EXPORT ====================

const WorkPlan = mongoose.model<IWorkPlan, IWorkPlanModel>('WorkPlan', WorkPlanSchema);

export default WorkPlan;
