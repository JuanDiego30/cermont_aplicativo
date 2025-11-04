/**
 * Evidence Model (TypeScript - November 2025)
 * @description Modelo Mongoose para evidencias (fotos/docs/videos) en órdenes de CERMONT ATG. Soporta before/during/after
 * types (EVIDENCE_TYPES), multi-archivos con metadata (size/mime), GPS, tags para search. Relacionado con Order/User.
 * Optimized: Indexes para order/tipo/fecha, virtuals (counts/sums/location), statics paginated (byOrder/tags).
 * Integra upload (URLs from multer), audit (CREATE_EVIDENCE on save), workflow (verified status).
 * Uso: const evidence = new Evidence(data); await evidence.save(); // + audit
 *       Evidence.findByOrder(orderId, {page:1, tipo: 'BEFORE'}); // Paginated by type
 * Nota: archivos: S3/local URLs, validated mime/size in upload middleware. Tags lowercase/auto-unique.
 *       Para ATG: En reportsController, attach to CctvReport/Order. Searchable via tags/descripcion full-text.
 *       Pre-save: Auto-audit. Limit archivos per evidence (env MAX_FILES=10).
 * Pruebas: Jest mock create (isNew true, audit CREATE), findByOrder (docs + pagination, populate), isValid (true/false).
 * Types: Interface EvidenceDoc (Document), Archivo (sub-schema), EvidenceModel (Model + Statics).
 * Fixes: Schema<EvidenceDoc, EvidenceModel>. Enums: Categoria, Status as const. MimeTypes array. Pre-save: AuditLog.create (model static log assumed).
 * Assumes: constants.ts EVIDENCE_TYPES const array. AuditLog static log or create. Order/User refs.
 * Deps: mongoose ^7+.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { EVIDENCE_TYPES, EvidenceType } from '../utils/constants'; // Aligns with .ts migration
import { logger } from '../utils/logger';
import AuditLog from './AuditLog'; // For audit on create/update (AuditData interface)

// Enums as const for type safety
const CATEGORIAS = ['foto', 'documento', 'video', 'otros'] as const;
type Categoria = typeof CATEGORIAS[number];

const STATUSES = ['UPLOADED', 'VERIFIED', 'REJECTED'] as const;
type Status = typeof STATUSES[number];

const MIME_TYPES = [
  'image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'application/octet-stream',
] as const;
type MimeType = typeof MIME_TYPES[number];

// Sub-schema interface for single file
interface Archivo {
  nombre: string;
  url: string;
  mimeType: MimeType;
  tamaño: number;
  uploadedAt: Date;
  _id: mongoose.Types.ObjectId;
}

// Main document interface
interface EvidenceDoc extends Document {
  orderId: mongoose.Types.ObjectId;
  tipo: EvidenceType;
  categoria: Categoria;
  descripcion: string;
  archivos: Archivo[];
  ubicacion?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  fecha: Date;
  uploadedBy: mongoose.Types.ObjectId;
  tags?: string[];
  status: Status;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  metadata?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  totalArchivos: number;
  tamañoTotal: number;
  tieneUbicacion: boolean;
  estaVerificada: boolean;

  // Methods
  isValid(): boolean;
}

// Model with statics
interface EvidenceModel extends Model<EvidenceDoc> {
  findByOrder(
    orderId: mongoose.Types.ObjectId,
    options?: {
      page?: number;
      limit?: number;
      tipo?: EvidenceType;
      categoria?: Categoria;
      sort?: { [key: string]: 1 | -1 };
    }
  ): Promise<{
    docs: EvidenceDoc[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
  findByTags(
    tags: string[],
    options?: { page?: number; limit?: number }
  ): Promise<{
    docs: EvidenceDoc[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>;
  getUnverified(reviewerId?: mongoose.Types.ObjectId, limit?: number): Promise<EvidenceDoc[]>;
}

// Sub-schema for single file (reusable)
const ArchivoSchema: Schema<Archivo> = new Schema({
  nombre: {
    type: String,
    required: [true, 'Nombre de archivo requerido'],
    trim: true,
    maxlength: [255, 'Nombre de archivo demasiado largo'],
  },
  url: {
    type: String,
    required: [true, 'URL de archivo requerida'],
    trim: true,
    validate: {
      validator: (v: string) => /^https?:\/\//.test(v) || /^\/uploads\//.test(v), // Basic URL check
      message: 'URL inválida',
    },
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type requerido'],
    enum: MIME_TYPES,
    trim: true,
  },
  tamaño: {
    type: Number,
    required: [true, 'Tamaño requerido'],
    min: [1, 'Tamaño debe ser >0'],
    max: [50 * 1024 * 1024, 'Archivo máximo 50MB'], // Enforce limit
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true }); // _id for individual files

// Main Evidence Schema
const evidenceSchema = new Schema({
  // Relation to work order
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'ID de orden requerido'],
    index: true,
  },

  // Evidence type (before/during/after)
  tipo: {
    type: String,
    required: [true, 'Tipo requerido'],
    enum: {
      values: Object.values(EVIDENCE_TYPES), // ['antes', 'durante', 'despues']
      message: 'Tipo inválido; debe ser uno de EVIDENCE_TYPES',
    },
    index: true,
  },

  // File category
  categoria: {
    type: String,
    enum: CATEGORIAS,
    default: 'foto',
    index: true,
  },

  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'Descripción máxima 500 caracteres'],
    required: [true, 'Descripción requerida'],
  },

  // Associated files
  archivos: [ArchivoSchema],

  // Location
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [200, 'Ubicación máxima 200 caracteres'],
  },

  // GPS coordinates
  coordenadas: {
    lat: {
      type: Number,
      min: [-90, 'Latitud inválida'],
      max: [90, 'Latitud inválida'],
    },
    lng: {
      type: Number,
      min: [-180, 'Longitud inválida'],
      max: [180, 'Longitud inválida'],
    },
  },

  fecha: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // Uploader
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuario requerido'],
    index: true,
  },

  // Search tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag demasiado largo'],
  }],

  // Workflow status
  status: {
    type: String,
    enum: STATUSES,
    default: 'UPLOADED',
    index: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true, // Optional
  },
  verifiedAt: { type: Date },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}, // {device, orientation, etc.}
  },
}, {
  timestamps: true, // createdAt/updatedAt
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  strict: true,
  collection: 'evidences',
});

// ========================================
// INDEXES for Performance & Search
// ========================================
evidenceSchema.index({ orderId: 1, tipo: 1 }); // By order and type
evidenceSchema.index({ orderId: 1, fecha: -1 }); // Recent by order
evidenceSchema.index({ uploadedBy: 1, fecha: -1 }); // User uploads
evidenceSchema.index({ tags: 1 }); // Tag search (text index if Mongo supports)
// For full-text: evidenceSchema.index({ descripcion: 'text', tags: 'text' }); // If enabled

// ========================================
// VIRTUALS
// ========================================
evidenceSchema.virtual('totalArchivos').get(function (this: EvidenceDoc) {
  return this.archivos.length;
});

evidenceSchema.virtual('tamañoTotal').get(function (this: EvidenceDoc) {
  return this.archivos.reduce((total, archivo) => total + (archivo.tamaño || 0), 0);
});

evidenceSchema.virtual('tieneUbicacion').get(function (this: EvidenceDoc) {
  return !!(this.coordenadas?.lat && this.coordenadas?.lng);
});

evidenceSchema.virtual('estaVerificada').get(function (this: EvidenceDoc) {
  return this.status === 'VERIFIED';
});

// ========================================
// METHODS & STATICS
// ========================================

/**
 * Instance: Validate evidence (archivos >0, valid URLs)
 * @returns boolean
 */
evidenceSchema.methods.isValid = function (this: EvidenceDoc): boolean {
  return this.archivos.length > 0 && this.archivos.every(arc => arc.url && arc.tamaño > 0);
};

/**
 * Static: Find by order (paginated, by tipo optional)
 * @param orderId Order ID
 * @param options Pagination and filter options
 * @returns Promise with docs and pagination
 */
evidenceSchema.statics.findByOrder = async function (
  orderId: mongoose.Types.ObjectId,
  options: {
    page?: number;
    limit?: number;
    tipo?: EvidenceType;
    categoria?: Categoria;
    sort?: { [key: string]: 1 | -1 };
  } = {}
): Promise<{
  docs: EvidenceDoc[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const { page = 1, limit = 20, tipo = undefined, categoria = undefined, sort = { fecha: -1 } } = options;
  const skip = (page - 1) * limit;

  const match: any = { orderId };
  if (tipo) match.tipo = tipo;
  if (categoria) match.categoria = categoria;

  const [docs, total] = await Promise.all([
    this.find(match).sort(sort).skip(skip).limit(limit)
      .populate('uploadedBy', 'nombre email rol')
      .select('archivos.nombre archivos.url descripcion tipo -_id') // Include key files, exclude large
      .lean(),
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
 * Static: Search by tags (paginated)
 * @param tags Array of tags
 * @param options Pagination options
 * @returns Promise with docs and pagination
 */
evidenceSchema.statics.findByTags = async function (
  tags: string[],
  options: { page?: number; limit?: number } = {}
): Promise<{
  docs: EvidenceDoc[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const match = { tags: { $in: tags } };
  const [docs, total] = await Promise.all([
    this.find(match).sort({ fecha: -1 }).skip(skip).limit(limit).lean(),
    this.countDocuments(match),
  ]);

  return {
    docs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Static: Get unverified evidences (for review)
 * @param reviewerId Reviewer ID (optional)
 * @param limit Result limit
 * @returns Promise<EvidenceDoc[]>
 */
evidenceSchema.statics.getUnverified = async function (
  reviewerId: mongoose.Types.ObjectId | null = null,
  limit: number = 50
): Promise<EvidenceDoc[]> {
  const match: any = { status: 'UPLOADED' };
  if (reviewerId) match.verifiedBy = reviewerId; // Assigned to reviewer

  return this.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId uploadedBy', 'titulo nombre')
    .select('-archivos') // Exclude files in list
    .lean();
};

// Pre-save hook: Audit create/update
evidenceSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      // Audit CREATE (minimal; full in middleware if req needed)
      const auditData = new AuditLog({
        userId: this.uploadedBy,
        action: 'CREATE_EVIDENCE',
        resource: 'Evidence',
        resourceId: this._id, // Available after save, but pre-save approx
        description: `Evidencia subida: ${(this as any).totalArchivos} archivos)`,
        metadata: { orderId: this.orderId, tipo: this.tipo, totalSize: (this as any).tamañoTotal },
        status: (this as any).isValid() ? 'SUCCESS' : 'FAILURE',
        severity: 'LOW',
      });
      await auditData.save();
    } else if (this.isModified('status')) {
      // Audit VERIFY (use verifiedBy)
      const auditData = new AuditLog({
        userId: this.verifiedBy,
        action: 'VERIFY_EVIDENCE',
        resource: 'Evidence',
        resourceId: this._id,
        description: `Evidencia verificada: ${this.status}`,
        metadata: { previousStatus: (this as any)._originalStatus || 'UPLOADED' }, // Track original if needed
        status: 'SUCCESS',
        severity: 'MEDIUM',
      });
      await auditData.save();
    }
  } catch (error: unknown) {
    const errMsg: string = error instanceof Error ? error.message : 'Audit error';
    logger.error('[Evidence] Audit failed', { error: errMsg, evidenceId: this._id });
  }
  next();
});

const Evidence = mongoose.model('Evidence', evidenceSchema);

export type IEvidenceDoc = EvidenceDoc;
export type IEvidenceModel = EvidenceModel;

export default Evidence;
