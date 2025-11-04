/**
 * ToolKit Model (TypeScript - November 2025 - FINAL FIX)
 * @description Modelo Mongoose para kits de herramientas CERMONT ATG
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { logger } from '../utils/logger';
import AuditLog from './AuditLog';

// ==================== CONSTANTS ====================

// Asume que TOOLKIT_CATEGORIES es un array en constants.ts
const TOOLKIT_CATEGORIES = ['electrico', 'telecomunicaciones', 'CCTV', 'instrumentacion', 'general'] as const;
type Categoria = typeof TOOLKIT_CATEGORIES[number];

// ==================== INTERFACES ====================

interface Item {
  nombre: string;
  cantidad: number;
  descripcion?: string;
  esencial?: boolean;
  requiereCertificacion?: boolean;
  _id?: Types.ObjectId;
}

interface ToolKitDoc extends Document {
  nombre: string;
  descripcion?: string;
  tags?: string[];
  categoria: Categoria;
  herramientas: Types.DocumentArray<Item & Document>;
  equipos: Types.DocumentArray<Item & Document>;
  elementosSeguridad: Types.DocumentArray<Item & Document>;
  isActive: boolean;
  creadoPor: Types.ObjectId;
  vecesUtilizado: number;
  ultimaUso?: Date;
  ordersUsedIn: Types.ObjectId[];
  version: number;
  createdAt: Date;
  updatedAt: Date;

  totalItems: number;
  herramientasEsenciales: (Item & Document)[];
  equiposConCertificacion: (Item & Document)[];
  totalEsenciales: number;
  requiereCertificacion: boolean;

  incrementUsage(orderId: Types.ObjectId, userId: Types.ObjectId): Promise<this>;
  clone(newName: string, clonerId: Types.ObjectId): Promise<ToolKitDoc>;
  isSufficientForOrder(orderCategoria: string): boolean;
}

interface ToolKitModel extends Model<ToolKitDoc> {
  findByCategory(category: Categoria, options?: { page?: number; limit?: number; sort?: any }): Promise<any[]>;
  getMostUsed(limit?: number, options?: { categoria?: Categoria }): Promise<any[]>;
  search(query: string, options?: { page?: number; limit?: number }): Promise<any[]>;
  getForOrder(orderId: Types.ObjectId, orderCategoria: string): Promise<any[]>;
  getStatsByCategory(): Promise<any[]>;
}

// ==================== SUB-SCHEMA ====================

const ItemSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'Nombre requerido'],
    trim: true,
    maxlength: [100, 'Nombre máximo 100 caracteres'],
  },
  cantidad: {
    type: Number,
    required: [true, 'Cantidad requerida'],
    min: [1, 'Cantidad mínima 1'],
    max: [100, 'Cantidad máxima 100'],
  },
  descripcion: { 
    type: String, 
    trim: true, 
    maxlength: 200 
  },
  esencial: { type: Boolean, default: false },
  requiereCertificacion: { type: Boolean, default: false },
}, { _id: true });

// ==================== MAIN SCHEMA ====================

const toolKitSchema = new Schema<ToolKitDoc, ToolKitModel>({
  nombre: {
    type: String,
    required: [true, 'Nombre requerido'],
    unique: true,
    trim: true,
    maxlength: 100,
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  tags: [{ 
    type: String, 
    trim: true, 
    lowercase: true, 
    maxlength: 50 
  }],

  categoria: {
    type: String,
    required: [true, 'Categoría requerida'],
    enum: TOOLKIT_CATEGORIES,
  },

  herramientas: [ItemSchema],
  equipos: [ItemSchema],
  elementosSeguridad: [ItemSchema],

  isActive: { type: Boolean, default: true, index: true },

  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creador requerido'],
    index: true,
  },

  vecesUtilizado: { type: Number, default: 0, min: 0 },
  ultimaUso: { type: Date },
  ordersUsedIn: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  version: { type: Number, default: 1 },
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  strict: true,
  collection: 'toolkits',
});

// ==================== INDEXES ====================

toolKitSchema.index({ nombre: 1, isActive: 1 });
toolKitSchema.index({ categoria: 1, vecesUtilizado: -1 });
toolKitSchema.index({ creadoPor: 1, isActive: 1 });
toolKitSchema.index({ tags: 1 });
toolKitSchema.index({ ultimaUso: -1 });
toolKitSchema.index({ nombre: 'text', descripcion: 'text', tags: 'text' });

// ==================== VIRTUALS ====================

toolKitSchema.virtual('totalItems').get(function () {
  const h = this.herramientas.reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0);
  const e = this.equipos.reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0);
  const s = this.elementosSeguridad.reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0);
  return h + e + s;
});

toolKitSchema.virtual('herramientasEsenciales').get(function () {
  return this.herramientas.filter((h: any) => h.esencial);
});

toolKitSchema.virtual('equiposConCertificacion').get(function () {
  return this.equipos.filter((e: any) => e.requiereCertificacion);
});

toolKitSchema.virtual('totalEsenciales').get(function () {
  return this.herramientasEsenciales.reduce((sum: number, h: any) => sum + h.cantidad, 0);
});

toolKitSchema.virtual('requiereCertificacion').get(function () {
  return this.equiposConCertificacion.length > 0;
});

// ==================== HOOKS ====================

toolKitSchema.pre('save', function (next) {
  if (this.herramientas.length === 0 && this.equipos.length === 0 && this.elementosSeguridad.length === 0) {
    return next(new Error('Al menos un item requerido'));
  }
  
  if (this.tags && this.isModified('tags')) {
    const uniqueTags = [...new Set(this.tags.map((t: string) => t.toLowerCase().trim()))].filter((t: string) => t);
    this.tags = uniqueTags;
  }
  
  if (!this.isNew && (this.isModified('herramientas') || this.isModified('equipos') || this.isModified('elementosSeguridad'))) {
    this.version += 1;
  }
  next();
});

toolKitSchema.post('save', async function (doc) {
  try {
    const action = doc.isNew ? 'CREATE_TOOLKIT' : 'UPDATE_TOOLKIT';
    await (AuditLog as any).log({
      userId: doc.creadoPor,
      action,
      resource: 'ToolKit',
      resourceId: doc._id,
      description: doc.isNew ? `Kit creado: ${doc.nombre}` : `Kit actualizado: ${doc.nombre}`,
      metadata: { categoria: doc.categoria, version: doc.version },
      status: 'SUCCESS',
      severity: 'LOW',
    });
  } catch (err) {
    logger.error('[ToolKit] Audit failed', { error: err });
  }
});

// ==================== INSTANCE METHODS ====================

toolKitSchema.methods.incrementUsage = async function (orderId: Types.ObjectId, userId: Types.ObjectId) {
  this.vecesUtilizado += 1;
  this.ultimaUso = new Date();
  if (orderId && !this.ordersUsedIn.includes(orderId)) {
    this.ordersUsedIn.push(orderId);
  }
  await this.save();

  await (AuditLog as any).log({
    userId,
    action: 'USE_TOOLKIT',
    resource: 'ToolKit',
    resourceId: this._id,
    description: `Kit utilizado: ${this.nombre}`,
    metadata: { orderId, categoria: this.categoria },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  return this;
};

toolKitSchema.methods.clone = async function (newName: string, clonerId: Types.ObjectId) {
  if (!newName || newName === this.nombre) {
    throw new Error('Nuevo nombre requerido y único');
  }
  
  const existing = await (this.constructor as ToolKitModel).findOne({ nombre: newName });
  if (existing) throw new Error('Nombre ya existe');

  const cloneData: any = {
    nombre: newName,
    descripcion: `Copia de ${this.nombre}`,
    categoria: this.categoria,
    tags: this.tags,
    herramientas: this.herramientas.map((h: any) => ({ ...h.toObject(), _id: undefined })),
    equipos: this.equipos.map((e: any) => ({ ...e.toObject(), _id: undefined })),
    elementosSeguridad: this.elementosSeguridad.map((s: any) => ({ ...s.toObject(), _id: undefined })),
    creadoPor: clonerId,
    version: 1,
  };
  
  const clone = await (this.constructor as ToolKitModel).create(cloneData);

  await (AuditLog as any).log({
    userId: clonerId,
    action: 'CLONE_TOOLKIT',
    resource: 'ToolKit',
    resourceId: clone._id,
    description: `Kit clonado: ${newName} desde ${this.nombre}`,
    metadata: { originalId: this._id },
    status: 'SUCCESS',
    severity: 'MEDIUM',
  });

  return clone;
};

toolKitSchema.methods.isSufficientForOrder = function (orderCategoria: string): boolean {
  return this.categoria === orderCategoria && this.totalEsenciales > 0;
};

// ==================== STATIC METHODS ====================

toolKitSchema.statics.findByCategory = function (category: Categoria, options: any = {}) {
  const { page = 1, limit = 20, sort = { vecesUtilizado: -1 } } = options;
  const skip = (page - 1) * limit;
  return this.find({ categoria: category, isActive: true })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('creadoPor', 'nombre email')
    .lean()
    .exec();
};

toolKitSchema.statics.getMostUsed = function (limit = 10, options: any = {}) {
  const match: any = { isActive: true };
  if (options.categoria) match.categoria = options.categoria;
  return this.find(match)
    .sort({ vecesUtilizado: -1, ultimaUso: -1 })
    .limit(limit)
    .lean()
    .exec();
};

toolKitSchema.statics.search = function (query: string, options: any = {}) {
  const { page = 1, limit = 20 } = options;
  return this.find({ $text: { $search: query }, isActive: true }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

toolKitSchema.statics.getForOrder = function (orderId: Types.ObjectId, orderCategoria: string) {
  return this.find({ categoria: orderCategoria, isActive: true })
    .sort({ vecesUtilizado: -1 })
    .populate('ordersUsedIn', 'numeroOrden estado')
    .lean()
    .exec();
};

toolKitSchema.statics.getStatsByCategory = async function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$categoria',
        totalKits: { $sum: 1 },
        avgUsage: { $avg: '$vecesUtilizado' },
        mostUsed: { $first: '$nombre' },
      },
    },
    { $sort: { totalKits: -1 } },
  ]);
};

// ==================== EXPORT ====================

const ToolKit = mongoose.model<ToolKitDoc, ToolKitModel>('ToolKit', toolKitSchema);

export default ToolKit;
export type { ToolKitDoc as IToolKitDoc, ToolKitModel as IToolKitModel };
