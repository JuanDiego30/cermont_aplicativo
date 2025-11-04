/**
 * Order Model - Máquina de Estados Institucional (TypeScript - November 2025)
 * @description Modelo Mongoose para Órdenes de Trabajo con flujo 1→14 estados
 */

import mongoose, { Schema, Document, Model, Types, HydratedDocument } from 'mongoose';
import { logger } from '../utils/logger.js';

// ==================== ENUMS Y CONSTANTES ====================

export enum OrderState {
  Solicitud = 'solicitud',
  Visita = 'visita',
  PO = 'po',
  Planeacion = 'planeacion',
  Ejecucion = 'ejecucion',
  Informe = 'informe',
  Acta = 'acta',
  SES = 'ses',
  Factura = 'factura',
  Pago = 'pago',
  Cancelada = 'cancelada',
  Rechazada = 'rechazada',
  Pausada = 'pausada'
}

export enum OrderPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent'
}

// Transiciones permitidas
export const ALLOWED_TRANSITIONS: Record<OrderState, OrderState[]> = {
  [OrderState.Solicitud]: [OrderState.Visita, OrderState.Cancelada, OrderState.Rechazada],
  [OrderState.Visita]: [OrderState.PO, OrderState.Cancelada, OrderState.Rechazada],
  [OrderState.PO]: [OrderState.Planeacion, OrderState.Cancelada, OrderState.Rechazada],
  [OrderState.Planeacion]: [OrderState.Ejecucion, OrderState.Pausada, OrderState.Cancelada, OrderState.Rechazada],
  [OrderState.Ejecucion]: [OrderState.Informe, OrderState.Pausada, OrderState.Cancelada],
  [OrderState.Pausada]: [OrderState.Planeacion, OrderState.Ejecucion, OrderState.Cancelada],
  [OrderState.Informe]: [OrderState.Acta, OrderState.Cancelada],
  [OrderState.Acta]: [OrderState.SES, OrderState.Cancelada],
  [OrderState.SES]: [OrderState.Factura, OrderState.Cancelada],
  [OrderState.Factura]: [OrderState.Pago, OrderState.Cancelada],
  [OrderState.Pago]: [], // Estado final
  [OrderState.Cancelada]: [], // Estado final
  [OrderState.Rechazada]: [] // Estado final
};

// ==================== INTERFACES ====================

interface StateTransition {
  from: OrderState;
  to: OrderState;
  by: Types.ObjectId;
  at: Date;
  notes?: string;
}

export interface IOrder extends Document {
  // Identificación
  orderNumber: string;
  clientName: string;
  description: string;

  // Estado y transiciones
  state: OrderState;

  // Ubicación
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Prioridad y tiempos
  priority: OrderPriority;
  estimatedDuration: number; // horas
  createdAt: Date;
  updatedAt: Date;

  // Asignación
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;

  // Documentos y prerrequisitos
  poNumber?: string;
  poDate?: Date;
  planningComplete?: boolean;
  certificationsVerified?: boolean;
  astApproved?: boolean;
  actaSigned?: boolean;
  sesApproved?: boolean;
  invoiceApproved?: boolean;

  // Fechas de transición (para KPIs)
  solicitudAt?: Date;
  visitaAt?: Date;
  poAt?: Date;
  planeacionAt?: Date;
  ejecucionAt?: Date;
  informeAt?: Date;
  actaAt?: Date;
  sesAt?: Date;
  facturaAt?: Date;
  pagoAt?: Date;

  // Historial de cambios
  stateHistory: Array<{
    from?: OrderState;
    to: OrderState;
    by: Types.ObjectId;
    at: Date;
    notes?: string;
  }>;
  updatesHistory: Array<{
    updatedBy: Types.ObjectId;
    updatedAt: Date;
    changes: any;
  }>;
}

export interface IOrderMethods {
  transitionState(newState: OrderState, userId: Types.ObjectId, notes?: string): Promise<HydratedDocument<IOrder>>;
  validateStatePrerequisites(newState: OrderState): Promise<void>;
  calculateCycleTime(): number;
}

export interface IOrderModel extends Model<IOrder, {}, IOrderMethods> {
  findByState(state: OrderState, options?: { page?: number; limit?: number }): Promise<HydratedDocument<IOrder>[]>;
  getCycleTimeStats(): Promise<any>;
  generateOrderNumber(): Promise<string>;
}

// ==================== SCHEMA ====================

const OrderSchema = new Schema<IOrder, IOrderModel, IOrderMethods>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.Solicitud,
      required: true,
      index: true
    },
    stateHistory: [
      {
        from: { type: String, enum: Object.values(OrderState) },
        to: { type: String, enum: Object.values(OrderState), required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        at: { type: Date, default: Date.now },
        notes: { type: String }
      }
    ],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 }
      }
    },
    priority: {
      type: String,
      enum: Object.values(OrderPriority),
      default: OrderPriority.Medium,
      required: true,
      index: true
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    poNumber: { type: String, sparse: true },
    poDate: { type: Date },
    planningComplete: { type: Boolean, default: false },
    certificationsVerified: { type: Boolean, default: false },
    astApproved: { type: Boolean, default: false },
    actaSigned: { type: Boolean, default: false },
    sesApproved: { type: Boolean, default: false },
    invoiceApproved: { type: Boolean, default: false },

    // Timestamps de transiciones
    solicitudAt: { type: Date },
    visitaAt: { type: Date },
    poAt: { type: Date },
    planeacionAt: { type: Date },
    ejecucionAt: { type: Date },
    informeAt: { type: Date },
    actaAt: { type: Date },
    sesAt: { type: Date },
    facturaAt: { type: Date },
    pagoAt: { type: Date },

    // Historial de cambios
    updatesHistory: [{
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      updatedAt: { type: Date, default: Date.now },
      changes: { type: Schema.Types.Mixed }
    }]
  },
  { timestamps: true }
);

// Índices compuestos para consultas frecuentes
OrderSchema.index({ state: 1, createdAt: -1 });
OrderSchema.index({ assignedTo: 1, state: 1 });
OrderSchema.index({ state: 1, priority: 1 });

// Agregar campo stateHistory al esquema
OrderSchema.add({
  stateHistory: [{
    from: { type: String, enum: Object.values(OrderState) },
    to: { type: String, enum: Object.values(OrderState), required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
    notes: { type: String }
  }]
});

// ==================== MIDDLEWARE ====================

// Pre-save hook para generar número de orden
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ==================== METHODS ====================

OrderSchema.methods.transitionState = async function(
  newState: OrderState,
  userId: Types.ObjectId,
  notes?: string
): Promise<HydratedDocument<IOrder>> {
  // Validar transición permitida
  if (!ALLOWED_TRANSITIONS[this.state].includes(newState)) {
    throw new Error(
      `Invalid transition from ${this.state} to ${newState}. Allowed: ${ALLOWED_TRANSITIONS[this.state].join(', ')}`
    );
  }

  // Validar prerrequisitos
  await this.validateStatePrerequisites(newState);

  // Aplicar transición
  const oldState = this.state;
  this.state = newState;
  this.stateHistory.push({
    from: oldState,
    to: newState,
    by: userId,
    at: new Date(),
    notes
  });

  // Actualizar timestamp específico del estado
  const stateTimestampField = `${newState}At` as keyof IOrder;
  if (stateTimestampField in this) {
    (this as any)[stateTimestampField] = new Date();
  }

  await this.save();

  logger.info('Order state transitioned', {
    orderId: this._id,
    orderNumber: this.orderNumber,
    from: oldState,
    to: newState,
    by: userId
  });

  return this;
};

OrderSchema.methods.validateStatePrerequisites = async function(newState: OrderState): Promise<void> {
  switch (newState) {
    case OrderState.Planeacion:
      if (!this.poNumber) {
        throw new Error('PO number is required before moving to planning phase');
      }
      break;

    case OrderState.Ejecucion:
      if (!this.planningComplete) {
        throw new Error('Work plan must be completed before execution');
      }
      if (!this.certificationsVerified) {
        throw new Error('Worker certifications must be verified before execution');
      }
      if (!this.astApproved) {
        throw new Error('AST (Job Safety Analysis) must be approved before execution');
      }
      break;

    case OrderState.Informe:
      // Verificar evidencias mínimas (esto se implementará en el servicio)
      break;

    case OrderState.SES:
      if (!this.actaSigned) {
        throw new Error('Acta must be signed before submitting SES');
      }
      break;

    case OrderState.Factura:
      if (!this.sesApproved) {
        throw new Error('SES must be approved before generating invoice');
      }
      break;

    case OrderState.Pago:
      if (!this.invoiceApproved) {
        throw new Error('Invoice must be approved before marking as paid');
      }
      break;
  }
};

OrderSchema.methods.calculateCycleTime = function(): number {
  if (!this.solicitudAt || !this.pagoAt) {
    return 0;
  }
  return Math.round((this.pagoAt.getTime() - this.solicitudAt.getTime()) / (1000 * 60 * 60 * 24));
};

// ==================== STATICS ====================

OrderSchema.statics.findByState = function(
  state: OrderState,
  options: { page?: number; limit?: number } = {}
): Promise<HydratedDocument<IOrder>[]> {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({ state })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
};

OrderSchema.statics.getCycleTimeStats = async function(): Promise<any> {
  const completedOrders = await this.find({
    state: OrderState.Pago,
    pagoAt: { $exists: true },
    solicitudAt: { $exists: true }
  });

  const cycleTimes = completedOrders.map(order => order.calculateCycleTime());

  if (cycleTimes.length === 0) {
    return { avgCycleTime: 0, minCycleTime: 0, maxCycleTime: 0, count: 0 };
  }

  return {
    avgCycleTime: Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length),
    minCycleTime: Math.min(...cycleTimes),
    maxCycleTime: Math.max(...cycleTimes),
    count: cycleTimes.length
  };
};

OrderSchema.statics.generateOrderNumber = async function(): Promise<string> {
  const count = await this.countDocuments();
  return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
};

// ==================== EXPORT ====================

export const Order = mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);
