/**
 * Order Model (Optimized - October 2025)
 * @description Modelo para órdenes de trabajo con performance y analytics avanzados
 */

import mongoose from 'mongoose';
import { ORDER_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const orderSchema = new mongoose.Schema(
  {
    // ============================================================================
    // IDENTIFICACIÓN
    // ============================================================================
    numeroOrden: {
      type: String,
      required: [true, 'El número de orden es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    
    // ============================================================================
    // INFORMACIÓN DEL CLIENTE
    // ============================================================================
    clienteNombre: {
      type: String,
      required: [true, 'El nombre del cliente es requerido'],
      trim: true,
    },
    clienteContacto: {
      nombre: { type: String, trim: true },
      email: { 
        type: String, 
        trim: true,
        lowercase: true,
      },
      telefono: { type: String, trim: true },
    },
    
    // ============================================================================
    // PO NUMBER
    // ============================================================================
    poNumber: {
      type: String,
      trim: true,
    },
    
    // ============================================================================
    // DESCRIPCIÓN Y ALCANCE
    // ============================================================================
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    alcance: {
      type: String,
      trim: true,
      maxlength: [3000, 'El alcance no puede exceder 3000 caracteres'],
    },
    
    // ============================================================================
    // UBICACIÓN
    // ============================================================================
    lugar: {
      type: String,
      required: [true, 'El lugar es requerido'],
      trim: true,
    },
    coordenadas: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    
    // ============================================================================
    // FECHAS
    // ============================================================================
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
    },
    fechaFinEstimada: {
      type: Date,
    },
    fechaFinReal: {
      type: Date,
    },
    
    // ============================================================================
    // ESTADO DE LA ORDEN
    // ============================================================================
    estado: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATUS),
        message: 'Estado inválido',
      },
      default: ORDER_STATUS.PENDING,
    },
    
    // ============================================================================
    // PRIORIDAD
    // ============================================================================
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'urgente'],
      default: 'media',
      // índice manejado a través de schema.index(...) para evitar duplicados
    },
    
    // ============================================================================
    // ASIGNACIONES
    // ============================================================================
    asignadoA: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    creadoPor: { // NUEVO: tracking de creador
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // ============================================================================
    // PLAN DE TRABAJO
    // ============================================================================
    workPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkPlan',
    },
    
    // ============================================================================
    // COSTOS
    // ============================================================================
    costoEstimado: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
    },
    costoReal: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
    },
    moneda: {
      type: String,
      enum: ['COP', 'USD'],
      default: 'COP',
    },
    
    // ============================================================================
    // MÉTRICAS Y KPIs (NUEVO)
    // ============================================================================
    metricas: {
      // Duración en días
      duracionEstimadaDias: {
        type: Number,
        default: 0,
      },
      duracionRealDias: {
        type: Number,
        default: 0,
      },
      
      // SLA (Service Level Agreement)
      sla: {
        tiempoRespuestaHoras: { type: Number, default: 24 },
        tiempoResolucionHoras: { type: Number, default: 72 },
        cumplido: { type: Boolean, default: true },
        fechaLimite: Date,
      },
      
      // Días de atraso
      diasAtrasados: {
        type: Number,
        default: 0,
      },
      
      // Variación de costo (%)
      variacionCostoPorcentaje: {
        type: Number,
        default: 0,
      },
    },
    
    // ============================================================================
    // HISTORIAL DE ESTADOS (MEJORADO)
    // ============================================================================
    historialEstados: [{
      estadoAnterior: {
        type: String,
        enum: Object.values(ORDER_STATUS),
      },
      estadoNuevo: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        required: true,
      },
      cambiadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      comentario: {
        type: String,
        maxlength: 500,
      },
      fecha: {
        type: Date,
        default: Date.now,
      },
      duracionEnEstado: { // NUEVO: cuánto tiempo estuvo en el estado anterior
        type: Number, // en horas
        default: 0,
      },
    }],
    
    // ============================================================================
    // ARCHIVOS ADJUNTOS
    // ============================================================================
    archivos: [{
      nombre: { type: String, required: true },
      url: { type: String, required: true },
      tipo: { type: String },
      tamaño: { type: Number },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // ============================================================================
    // NOTAS Y COMENTARIOS
    // ============================================================================
    notas: [{
      contenido: {
        type: String,
        required: true,
        maxlength: [1000, 'La nota no puede exceder 1000 caracteres'],
      },
      autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // ============================================================================
    // HISTORIAL DE CAMBIOS
    // ============================================================================
    historial: [{
      accion: {
        type: String,
        required: true,
      },
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      detalles: mongoose.Schema.Types.Mixed,
      fecha: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // ============================================================================
    // FACTURACIÓN
    // ============================================================================
    facturacion: {
      numeroFactura: { type: String, trim: true },
      fechaFactura: { type: Date },
      montoFacturado: { type: Number, min: 0 },
      sesNumber: { type: String, trim: true },
      fechaSES: { type: Date },
      aprobadoPor: { type: String, trim: true },
      fechaAprobacion: { type: Date },
      fechaPago: { type: Date },
    },
    
    // ============================================================================
    // TAGS Y CATEGORÍAS (NUEVO)
    // ============================================================================
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    categoria: {
      type: String,
      enum: ['instalacion', 'mantenimiento', 'reparacion', 'consultoria', 'otro'],
      default: 'otro',
    },
    
    // ============================================================================
    // FLAGS DE CONTROL
    // ============================================================================
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    requiereAprobacion: { // NUEVO
      type: Boolean,
      default: false,
    },
    aprobadoPorCliente: { // NUEVO
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// ÍNDICES OPTIMIZADOS
// ============================================================================

// Índices simples ya existentes
// (numeroOrden ya tiene unique: true en campo, no necesita schema.index simple)
orderSchema.index({ estado: 1 });
orderSchema.index({ prioridad: 1 });
orderSchema.index({ fechaInicio: -1 });
orderSchema.index({ clienteNombre: 1 });
orderSchema.index({ poNumber: 1 });

// Índices compuestos para queries frecuentes
orderSchema.index({ estado: 1, fechaInicio: -1 });
orderSchema.index({ estado: 1, prioridad: 1 }); // NUEVO: órdenes urgentes
orderSchema.index({ clienteNombre: 1, createdAt: -1 });
orderSchema.index({ asignadoA: 1, estado: 1 });
orderSchema.index({ isActive: 1, isArchived: 1, createdAt: -1 });
orderSchema.index({ creadoPor: 1, estado: 1 }); // NUEVO: mis órdenes
orderSchema.index({ supervisorId: 1, estado: 1 }); // NUEVO: órdenes supervisadas
orderSchema.index({ fechaFinEstimada: 1, estado: 1 }); // NUEVO: próximas a vencer

// Full-text search (NUEVO)
orderSchema.index({
  numeroOrden: 'text',
  clienteNombre: 'text',
  descripcion: 'text',
  lugar: 'text',
  poNumber: 'text',
});

// Índice geoespacial (NUEVO)
orderSchema.index({ 'coordenadas': '2dsphere' });

// ============================================================================
// VIRTUALS
// ============================================================================

// Virtual: Duración en días
orderSchema.virtual('duracionDias').get(function () {
  if (!this.fechaInicio) return 0;
  const fechaFin = this.fechaFinReal || this.fechaFinEstimada || new Date();
  const diferencia = fechaFin - this.fechaInicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
});

// Virtual: Porcentaje de progreso
orderSchema.virtual('progreso').get(function () {
  const progressMap = {
    [ORDER_STATUS.PENDING]: 0,
    [ORDER_STATUS.PLANNING]: 20,
    [ORDER_STATUS.IN_PROGRESS]: 50,
    [ORDER_STATUS.COMPLETED]: 80,
    [ORDER_STATUS.INVOICING]: 90,
    [ORDER_STATUS.INVOICED]: 95,
    [ORDER_STATUS.PAID]: 100,
    [ORDER_STATUS.CANCELLED]: 0,
  };
  return progressMap[this.estado] || 0;
});

// Virtual: Variación de costo
orderSchema.virtual('variacionCosto').get(function () {
  if (this.costoEstimado === 0) return 0;
  return ((this.costoReal - this.costoEstimado) / this.costoEstimado) * 100;
});

// Virtual: Está atrasada
orderSchema.virtual('estaAtrasada').get(function () {
  if (!this.fechaFinEstimada || this.fechaFinReal) return false;
  return new Date() > this.fechaFinEstimada;
});

// Virtual: Días restantes (NUEVO)
orderSchema.virtual('diasRestantes').get(function () {
  if (!this.fechaFinEstimada || this.fechaFinReal) return null;
  const ahora = new Date();
  const diferencia = this.fechaFinEstimada - ahora;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
});

// Virtual: Es urgente (NUEVO)
orderSchema.virtual('esUrgente').get(function () {
  return this.prioridad === 'urgente' || (this.diasRestantes !== null && this.diasRestantes <= 3);
});

// Virtual: Estado descriptivo (NUEVO)
orderSchema.virtual('estadoDescriptivo').get(function () {
  const descriptions = {
    [ORDER_STATUS.PENDING]: 'Pendiente de planificación',
    [ORDER_STATUS.PLANNING]: 'En planificación',
    [ORDER_STATUS.IN_PROGRESS]: 'En progreso',
    [ORDER_STATUS.COMPLETED]: 'Completada',
    [ORDER_STATUS.INVOICING]: 'En facturación',
    [ORDER_STATUS.INVOICED]: 'Facturada',
    [ORDER_STATUS.PAID]: 'Pagada',
    [ORDER_STATUS.CANCELLED]: 'Cancelada',
  };
  return descriptions[this.estado] || this.estado;
});

// ============================================================================
// MIDDLEWARE PRE-SAVE
// ============================================================================

// Calcular métricas antes de guardar
orderSchema.pre('save', function (next) {
  // Calcular duración estimada
  if (this.fechaInicio && this.fechaFinEstimada) {
    const diff = this.fechaFinEstimada - this.fechaInicio;
    this.metricas.duracionEstimadaDias = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  // Calcular duración real
  if (this.fechaInicio && this.fechaFinReal) {
    const diff = this.fechaFinReal - this.fechaInicio;
    this.metricas.duracionRealDias = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  // Calcular días atrasados
  if (this.fechaFinEstimada && !this.fechaFinReal) {
    const ahora = new Date();
    if (ahora > this.fechaFinEstimada) {
      const diff = ahora - this.fechaFinEstimada;
      this.metricas.diasAtrasados = Math.ceil(diff / (1000 * 60 * 60 * 24));
    } else {
      this.metricas.diasAtrasados = 0;
    }
  }
  
  // Calcular variación de costo
  if (this.costoEstimado > 0) {
    this.metricas.variacionCostoPorcentaje = 
      ((this.costoReal - this.costoEstimado) / this.costoEstimado) * 100;
  }
  
  next();
});

// Agregar cambios de estado al historial
orderSchema.pre('save', function (next) {
  if (this.isModified('estado') && !this.isNew) {
    const estadoAnterior = this.$locals?.previousState;
    
    // Calcular duración en estado anterior
    let duracionEnEstado = 0;
    if (this.historialEstados.length > 0) {
      const ultimoCambio = this.historialEstados[this.historialEstados.length - 1];
      const diff = new Date() - ultimoCambio.fecha;
      duracionEnEstado = diff / (1000 * 60 * 60); // en horas
    }
    
    this.historialEstados.push({
      estadoAnterior,
      estadoNuevo: this.estado,
      cambiadoPor: this.$locals?.userId,
      comentario: this.$locals?.comentario,
      fecha: new Date(),
      duracionEnEstado,
    });
    
    // Agregar al historial general
    this.historial.push({
      accion: 'Cambio de estado',
      usuario: this.$locals?.userId,
      detalles: {
        estadoAnterior,
        estadoNuevo: this.estado,
      },
      fecha: new Date(),
    });
    
    logger.info(`Order ${this.numeroOrden} changed state: ${estadoAnterior} → ${this.estado}`);
  }
  next();
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================

/**
 * Cambiar estado con validación
 */
orderSchema.methods.cambiarEstado = async function (nuevoEstado, userId, comentario = '') {
  // Validar transición de estado
  const transicionesPermitidas = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PLANNING]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.INVOICING, ORDER_STATUS.IN_PROGRESS],
    [ORDER_STATUS.INVOICING]: [ORDER_STATUS.INVOICED, ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.INVOICED]: [ORDER_STATUS.PAID],
    [ORDER_STATUS.PAID]: [], // Estado final
    [ORDER_STATUS.CANCELLED]: [], // Estado final
  };
  
  const permitido = transicionesPermitidas[this.estado]?.includes(nuevoEstado);
  
  if (!permitido) {
    throw new Error(
      `Transición no permitida: ${this.estado} → ${nuevoEstado}`
    );
  }
  
  // Guardar estado anterior en $locals para el middleware
  this.$locals = {
    previousState: this.estado,
    userId,
    comentario,
  };
  
  this.estado = nuevoEstado;
  
  // Si se completa, establecer fecha fin real
  if (nuevoEstado === ORDER_STATUS.COMPLETED && !this.fechaFinReal) {
    this.fechaFinReal = new Date();
  }
  
  return await this.save();
};

/**
 * Agregar nota
 */
orderSchema.methods.agregarNota = async function (contenido, autorId) {
  this.notas.push({
    contenido,
    autor: autorId,
    createdAt: new Date(),
  });
  
  this.historial.push({
    accion: 'Nota agregada',
    usuario: autorId,
    detalles: { contenido: contenido.substring(0, 100) },
    fecha: new Date(),
  });
  
  return await this.save();
};

/**
 * Verificar si cumple SLA
 */
orderSchema.methods.cumpleSLA = function () {
  if (!this.metricas.sla.fechaLimite) return true;
  
  const fechaComparacion = this.fechaFinReal || new Date();
  return fechaComparacion <= this.metricas.sla.fechaLimite;
};

/**
 * Calcular tiempo restante para SLA
 */
orderSchema.methods.tiempoRestanteSLA = function () {
  if (!this.metricas.sla.fechaLimite) return null;
  
  const ahora = new Date();
  const diff = this.metricas.sla.fechaLimite - ahora;
  return Math.ceil(diff / (1000 * 60 * 60)); // en horas
};

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Buscar órdenes activas
 */
orderSchema.statics.findActive = function () {
  return this.find({ isActive: true, isArchived: false })
    .sort({ fechaInicio: -1 });
};

/**
 * Buscar por estado
 */
orderSchema.statics.findByStatus = function (status) {
  return this.find({ estado: status, isActive: true })
    .sort({ fechaInicio: -1 });
};

/**
 * Buscar órdenes del mes actual
 */
orderSchema.statics.findCurrentMonth = function () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return this.find({
    fechaInicio: { $gte: startOfMonth, $lte: endOfMonth },
    isActive: true,
  }).sort({ fechaInicio: -1 });
};

/**
 * Buscar órdenes vencidas (NUEVO)
 */
orderSchema.statics.findVencidas = function () {
  const ahora = new Date();
  return this.find({
    fechaFinEstimada: { $lt: ahora },
    fechaFinReal: { $exists: false },
    isActive: true,
    estado: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.PAID] },
  }).sort({ fechaFinEstimada: 1 });
};

/**
 * Buscar órdenes próximas a vencer (NUEVO)
 */
orderSchema.statics.findProximasAVencer = function (dias = 7) {
  const ahora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  
  return this.find({
    fechaFinEstimada: { $gte: ahora, $lte: limite },
    fechaFinReal: { $exists: false },
    isActive: true,
    estado: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.PAID] },
  }).sort({ fechaFinEstimada: 1 });
};

/**
 * Búsqueda full-text (NUEVO)
 */
orderSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Obtener estadísticas para dashboard (NUEVO)
 */
orderSchema.statics.getEstadisticas = async function () {
  const estadisticas = await this.aggregate([
    {
      $match: { isActive: true, isArchived: false },
    },
    {
      $facet: {
        // Por estado
        porEstado: [
          {
            $group: {
              _id: '$estado',
              count: { $sum: 1 },
              costoTotal: { $sum: '$costoReal' },
            },
          },
        ],
        
        // Por prioridad
        porPrioridad: [
          {
            $group: {
              _id: '$prioridad',
              count: { $sum: 1 },
            },
          },
        ],
        
        // Vencidas
        vencidas: [
          {
            $match: {
              fechaFinEstimada: { $lt: new Date() },
              fechaFinReal: { $exists: false },
              estado: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] },
            },
          },
          { $count: 'total' },
        ],
        
        // Próximas a vencer (7 días)
        proximasAVencer: [
          {
            $match: {
              fechaFinEstimada: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
              fechaFinReal: { $exists: false },
            },
          },
          { $count: 'total' },
        ],
        
        // Métricas generales
        metricas: [
          {
            $group: {
              _id: null,
              totalOrdenes: { $sum: 1 },
              costoEstimadoTotal: { $sum: '$costoEstimado' },
              costoRealTotal: { $sum: '$costoReal' },
              duracionPromedio: { $avg: '$metricas.duracionRealDias' },
            },
          },
        ],
      },
    },
  ]);
  
  return estadisticas[0];
};

/**
 * Buscar por cliente (NUEVO)
 */
orderSchema.statics.findByCliente = function (clienteNombre) {
  return this.find({
    clienteNombre: new RegExp(clienteNombre, 'i'),
    isActive: true,
  }).sort({ fechaInicio: -1 });
};

/**
 * Buscar asignadas a usuario (NUEVO)
 */
orderSchema.statics.findAsignadasA = function (userId) {
  return this.find({
    asignadoA: userId,
    isActive: true,
    estado: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.PAID] },
  }).sort({ prioridad: -1, fechaFinEstimada: 1 });
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
