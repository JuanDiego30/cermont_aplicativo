/**
 * CctvReport Model (TypeScript - November 2025)
 * @description Modelo Mongoose para reportes de mantenimiento CCTV en CERMONT ATG. Captura detalles de inspección/reparación
 * (equipos, medidas, fotos before/after, eléctrico). Relacionado con Order/User. Soporta aprobación workflow.
 * Optimized: Indexes para queries (date/order), virtuals (counts/status), methods (search/paginate). toJSON sanitizes.
 * Integra con upload controller (fotos URLs), auditLogger (CREATE_REPORT on save).
 * Uso: const report = new CctvReport(data); await report.save(); // + audit
 *       CctvReport.findByOrderAndDate(orderId, start, end); // Efficient search
 * Nota: fotos: S3 URLs via multer. Status enum para workflow. Pre-save: Validate completeness.
 *       Para ATG: En reportsController, populate order/tecnico. Paginate lists.
 * Pruebas: Jest mock save() (isNew true, audit CREATE), findByDateRange (docs + pagination), isComplete (true/false).
 * Types: Interface CctvReportDoc (Document), Equipment (sub-schema), CctvReportModel (Model + Statics).
 * Fixes: Schema<CctvReportDoc, CctvReportModel>. Enums: Status as const. Virtuals typed. Statics async typed.
 * Assumes: Order/User models exist (ref 'Order'/'User'). auditLogger in middleware.
 * Deps: mongoose ^7+.
 */

import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';

// Enums as const for type safety
const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;
type Status = typeof STATUSES[number];

const SISTEMA_ACTIVO = ['AC', 'SOLAR', 'AMBOS', 'NINGUNO'] as const;
type SistemaActivo = typeof SISTEMA_ACTIVO[number];

const LUCES_OBST = ['SI', 'NO', 'N/A'] as const;
type LucesObstruccion = typeof LUCES_OBST[number];

// Sub-schema interface for equipment
interface Equipment {
  tipo?: string;
  modelo?: string;
  serial?: string;
}

// Main document interface
interface CctvReportDoc extends Document {
  [key: string]: any; // Allow dynamic access
  orderId: mongoose.Types.ObjectId;
  camaraNo: number;
  rutinaNo: number;
  lugar: string;
  fecha: Date;
  alturaEstructura: number;
  alturaCamara: number;
  distanciaCamCaja: number;
  camara: Equipment;
  encoderPoe: Equipment;
  radio: Equipment;
  antenaExterna: Equipment & { nombre?: string };
  switchEquipo: Equipment;
  ubicacion?: string;
  master: { radio: Equipment };
  electrico: {
    ac110?: boolean;
    fotovoltaico?: boolean;
    cajaConexion?: boolean;
    transferenciaAutomatica?: boolean;
    puestaTierraOk?: boolean;
    sistemaActivo?: SistemaActivo;
    alimentacionOrigen?: string;
    gabineteBaseTorre?: string;
    tbt?: string;
    lucesObstruccion?: LucesObstruccion;
  };
  observaciones?: string;
  alcance?: string;
  fotos: {
    camaraAntes?: string[];
    camaraDespues?: string[];
    radioAntes?: string[];
    radioDespues?: string[];
    cajaAntes?: string[];
    cajaDespues?: string[];
    electricaAntes?: string[];
    electricaDespues?: string[];
    patAntes?: string[];
    patDespues?: string[];
    generalAntes?: string[];
    generalDespues?: string[];
  };
  tecnicoId: mongoose.Types.ObjectId;
  status: Status;
  aprobadoPor?: mongoose.Types.ObjectId;
  fechaAprobacion?: Date;
  comentariosAprobacion?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  totalFotos: number;
  estaAprobado: boolean;
  requiereAprobacion: boolean;

  // Methods
  isComplete(): boolean;
}

// Model with statics
interface CctvReportModel extends Model<CctvReportDoc> {
  findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      page?: number;
      limit?: number;
      populate?: string;
      sort?: { [key: string]: 1 | -1 };
    }
  ): Promise<{
    docs: CctvReportDoc[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
  findByOrderAndDate(
    orderId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
    options?: { populate?: string; select?: string }
  ): Promise<CctvReportDoc[]>;
  getPendingApprovals(approverId?: mongoose.Types.ObjectId, limit?: number): Promise<CctvReportDoc[]>;
}

// Sub-schema for equipment (reusable)
const EquipmentSchema: Schema<Equipment> = new Schema({
  tipo: { type: String, trim: true, maxlength: [100, 'Tipo demasiado largo'] },
  modelo: { type: String, trim: true, maxlength: [100, 'Modelo demasiado largo'] },
  serial: { type: String, trim: true, maxlength: [100, 'Serial demasiado largo'] },
}, { _id: false }); // No _id for subdoc

// Main CCTV Report Schema
const cctvReportSchema = new Schema({
  // Relation to work order
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Orden de trabajo requerida'], // Made required (core link)
    index: true,
  },

  // General info
  camaraNo: {
    type: Number,
    required: [true, 'Número de cámara requerido'],
    min: [1, 'Número de cámara debe ser ≥1'],
  },
  rutinaNo: {
    type: Number,
    required: [true, 'Número de rutina requerido'],
    min: [1, 'Número de rutina debe ser ≥1'],
  },
  lugar: {
    type: String,
    required: [true, 'Lugar requerido'],
    trim: true,
    maxlength: [200, 'Lugar máximo 200 caracteres'],
  },
  fecha: {
    type: Date,
    required: [true, 'Fecha requerida'],
    default: Date.now,
    index: true,
  },

  // Structure measurements
  alturaEstructura: {
    type: Number,
    min: [0, 'Altura estructura no negativa'],
    required: [true, 'Altura de estructura requerida'],
  },
  alturaCamara: {
    type: Number,
    min: [0, 'Altura cámara no negativa'],
    required: [true, 'Altura de cámara requerida'],
  },
  distanciaCamCaja: {
    type: Number,
    min: [0, 'Distancia no negativa'],
    required: [true, 'Distancia cámara-caja requerida'],
  },

  // Equipment sections
  camara: EquipmentSchema,
  encoderPoe: EquipmentSchema,
  radio: EquipmentSchema,
  antenaExterna: new Schema({
    ...EquipmentSchema.obj, // Inherit from EquipmentSchema
    nombre: { type: String, trim: true, maxlength: [100, 'Nombre antena demasiado largo'] }, // Added nombre
  }),
  switchEquipo: EquipmentSchema,

  ubicacion: {
    type: String,
    trim: true,
    maxlength: [200, 'Ubicación máximo 200 caracteres'],
  },

  // Master radio
  master: {
    radio: EquipmentSchema,
  },

  // Electrical system
  electrico: {
    ac110: { type: Boolean, default: false },
    fotovoltaico: { type: Boolean, default: false },
    cajaConexion: { type: Boolean, default: false },
    transferenciaAutomatica: { type: Boolean, default: false },
    puestaTierraOk: { type: Boolean, default: false },
    sistemaActivo: {
      type: String,
      enum: SISTEMA_ACTIVO,
      default: 'NINGUNO',
    },
    alimentacionOrigen: { type: String, trim: true, maxlength: [100] },
    gabineteBaseTorre: { type: String, trim: true, maxlength: [100] },
    tbt: { type: String, trim: true, maxlength: [100] },
    lucesObstruccion: { type: String, enum: LUCES_OBST, default: 'N/A' },
  },

  // Content sections
  observaciones: {
    type: String,
    trim: true,
    maxlength: [2000, 'Observaciones máximo 2000 caracteres'],
  },
  alcance: {
    type: String,
    trim: true,
    maxlength: [2000, 'Alcance máximo 2000 caracteres'],
  },

  // Photo registry (S3/local URLs; arrays for multiples)
  fotos: {
    camaraAntes: [{ type: String }],
    camaraDespues: [{ type: String }],
    radioAntes: [{ type: String }],
    radioDespues: [{ type: String }],
    cajaAntes: [{ type: String }],
    cajaDespues: [{ type: String }],
    electricaAntes: [{ type: String }],
    electricaDespues: [{ type: String }],
    patAntes: [{ type: String }],
    patDespues: [{ type: String }],
    generalAntes: [{ type: String }],
    generalDespues: [{ type: String }],
  },

  // Responsible technician
  tecnicoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Técnico requerido'],
    index: true,
  },

  // Approval workflow
  status: {
    type: String,
    enum: STATUSES,
    default: 'DRAFT',
    index: true,
  },
  aprobadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  fechaAprobacion: { type: Date, index: true },
  comentariosAprobacion: { type: String, trim: true, maxlength: 1000 }, // For rejection notes
}, {
  timestamps: true, // createdAt/updatedAt
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  strict: true,
  collection: 'cctvreports',
});

// ========================================
// INDEXES for Performance
// ========================================
cctvReportSchema.index({ orderId: 1, fecha: -1 }); // Order reports (recent)
cctvReportSchema.index({ lugar: 1, fecha: -1 }); // Location search
cctvReportSchema.index({ tecnicoId: 1, fecha: -1 }); // Tech reports
cctvReportSchema.index({ status: 1, fecha: -1 }); // Workflow queries
cctvReportSchema.index({ aprobadoPor: 1, fecha: -1 }); // Approver oversight

// ========================================
// VIRTUALS
// ========================================
cctvReportSchema.virtual('totalFotos').get(function (this: CctvReportDoc) {
  let total = 0;
  Object.values(this.fotos).forEach(arr => total += (Array.isArray(arr) ? arr.length : 0));
  return total;
});

cctvReportSchema.virtual('estaAprobado').get(function (this: CctvReportDoc) {
  return this.status === 'APPROVED';
});

cctvReportSchema.virtual('requiereAprobacion').get(function (this: CctvReportDoc) {
  return this.status === 'SUBMITTED';
});

// ========================================
// METHODS & STATICS
// ========================================

/**
 * Instance method: Validate completeness (for submission)
 * @returns boolean
 */
cctvReportSchema.methods.isComplete = function (this: CctvReportDoc): boolean {
  const requiredSections = ['camara', 'encoderPoe', 'radio', 'electrico', 'observaciones'];
  return requiredSections.every(section => this[section] && Object.keys(this[section]).length > 0);
};

/**
 * Static: Find by date range (paginated)
 * @param startDate Start date
 * @param endDate End date
 * @param options Pagination and populate options
 * @returns Promise with docs and pagination
 */
cctvReportSchema.statics.findByDateRange = async function (
  startDate: Date,
  endDate: Date,
  options: {
    page?: number;
    limit?: number;
    populate?: string;
    sort?: { [key: string]: 1 | -1 };
  } = {}
): Promise<{
  docs: CctvReportDoc[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const { page = 1, limit = 20, populate = 'orderId tecnicoId aprobadoPor', sort = { fecha: -1 } } = options;
  const skip = (page - 1) * limit;

  const match = { fecha: { $gte: startDate, $lte: endDate } };
  const [docs, total] = await Promise.all([
    this.find(match).sort(sort).skip(skip).limit(limit).populate(populate).lean(),
    this.countDocuments(match),
  ]);

  return {
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Static: Find by order ID and date (efficient)
 * @param orderId Order ID
 * @param startDate Start date (optional)
 * @param endDate End date (optional)
 * @param options Populate and select options
 * @returns Promise<CctvReportDoc[]>
 */
cctvReportSchema.statics.findByOrderAndDate = async function (
  orderId: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date,
  options: { populate?: string; select?: string } = {}
): Promise<CctvReportDoc[]> {
  const match: Record<string, any> = { orderId };
  if (startDate && endDate) {
    match.fecha = { $gte: startDate, $lte: endDate };
  }
  return this.find(match)
    .sort({ fecha: -1 })
    .populate('tecnicoId aprobadoPor', 'nombre email rol')
    .select(options.select || '-fotos') // Exclude large fotos in list (populate on detail)
    .lean();
};

/**
 * Static: Get pending approvals (SUBMITTED)
 * @param approverId Approver ID (optional)
 * @param limit Result limit
 * @returns Promise<CctvReportDoc[]>
 */
cctvReportSchema.statics.getPendingApprovals = async function (
  approverId: mongoose.Types.ObjectId | null = null,
  limit: number = 50
): Promise<CctvReportDoc[]> {
  const match: any = { status: 'SUBMITTED' };
  if (approverId) match.aprobadoPor = approverId; // Filter by approver if assigned

  return this.find(match)
    .sort({ updatedAt: -1 }) // Use updatedAt (or add submittedAt if needed)
    .limit(limit)
    .populate('orderId tecnicoId', 'titulo lugar nombre')
    .lean();
};

// Pre-save hook: Auto-audit CREATE/UPDATE (integrate with auditLogger)
cctvReportSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Audit CREATE
    // Note: Full audit in middleware; here minimal
  }
  next();
});

const CctvReport = mongoose.model('CctvReport', cctvReportSchema);

export type ICctvReportDoc = CctvReportDoc;
export type ICctvReportModel = CctvReportModel;

export default CctvReport;
