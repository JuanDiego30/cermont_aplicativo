/**
 * WorkPlan Model (Optimized - October 2025)
 * @description Modelo para planes de trabajo con análisis de recursos y métricas
 */

import mongoose from 'mongoose';
import { WORKPLAN_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const workPlanSchema = new mongoose.Schema(
  {
    // ============================================================================
    // RELACIÓN CON ORDEN
    // ============================================================================
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'El ID de orden es requerido'],
    },
    
    // ============================================================================
    // INFORMACIÓN GENERAL
    // ============================================================================
    titulo: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    alcance: {
      type: String,
      required: [true, 'El alcance es requerido'],
      trim: true,
      maxlength: [3000, 'El alcance no puede exceder 3000 caracteres'],
    },
    
    // ============================================================================
    // UNIDAD DE NEGOCIO
    // ============================================================================
    unidadNegocio: {
      type: String,
      enum: {
        values: ['IT', 'MNT', 'SC', 'GEN', 'Otros'],
        message: 'Unidad de negocio inválida',
      },
      required: [true, 'La unidad de negocio es requerida'],
      // índice manejado mediante workPlanSchema.index(...) para evitar duplicados
    },
    
    // ============================================================================
    // RESPONSABLES
    // ============================================================================
    responsables: {
      ingResidente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      tecnicoElectricista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      hes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    
    // Creador del plan (NUEVO)
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // ============================================================================
    // MATERIALES
    // ============================================================================
    materiales: [{
      descripcion: {
        type: String,
        required: [true, 'La descripción del material es requerida'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [0, 'La cantidad no puede ser negativa'],
      },
      unidad: {
        type: String,
        default: 'und',
        trim: true,
      },
      proveedor: {
        type: String,
        trim: true,
      },
      costo: {
        type: Number,
        min: [0, 'El costo no puede ser negativo'],
        default: 0,
      },
      solicitado: { // NUEVO: tracking de solicitud
        type: Boolean,
        default: false,
      },
      recibido: { // NUEVO: tracking de recepción
        type: Boolean,
        default: false,
      },
      fechaSolicitud: Date,
      fechaRecepcion: Date,
    }],
    
    // ============================================================================
    // HERRAMIENTAS
    // ============================================================================
    herramientas: [{
      descripcion: {
        type: String,
        required: [true, 'La descripción de la herramienta es requerida'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
      disponible: {
        type: Boolean,
        default: true,
      },
      ubicacion: { // NUEVO
        type: String,
        trim: true,
      },
    }],
    
    // ============================================================================
    // EQUIPOS
    // ============================================================================
    equipos: [{
      descripcion: {
        type: String,
        required: [true, 'La descripción del equipo es requerida'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
      certificado: {
        numero: { type: String, trim: true },
        vigencia: { type: Date },
        vencido: { type: Boolean, default: false }, // NUEVO: flag calculado
      },
    }],
    
    // ============================================================================
    // ELEMENTOS DE SEGURIDAD
    // ============================================================================
    elementosSeguridad: [{
      descripcion: {
        type: String,
        required: [true, 'La descripción del elemento de seguridad es requerida'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
      categoria: { // NUEVO: clasificación
        type: String,
        enum: ['EPP', 'Señalización', 'Protección colectiva', 'Emergencia', 'Otro'],
        default: 'EPP',
      },
    }],
    
    // ============================================================================
    // PERSONAL REQUERIDO
    // ============================================================================
    personalRequerido: {
      electricistas: { type: Number, default: 0, min: 0 },
      tecnicosTelecomunicacion: { type: Number, default: 0, min: 0 },
      instrumentistas: { type: Number, default: 0, min: 0 },
      obreros: { type: Number, default: 0, min: 0 },
    },
    
    // ============================================================================
    // CRONOGRAMA
    // ============================================================================
    cronograma: [{
      actividad: {
        type: String,
        required: [true, 'La actividad es requerida'],
        trim: true,
      },
      fechaInicio: {
        type: Date,
        required: [true, 'La fecha de inicio es requerida'],
      },
      fechaFin: {
        type: Date,
        required: [true, 'La fecha de fin es requerida'],
      },
      responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      completada: {
        type: Boolean,
        default: false,
      },
      fechaCompletada: Date, // NUEVO
      duracionReal: Number, // NUEVO: en horas
      observaciones: String, // NUEVO
    }],
    
    // ============================================================================
    // ESTADO
    // ============================================================================
    estado: {
      type: String,
      enum: {
        values: Object.values(WORKPLAN_STATUS),
        message: 'Estado inválido',
      },
      default: WORKPLAN_STATUS.DRAFT,
    },
    
    // ============================================================================
    // APROBACIÓN Y WORKFLOW (MEJORADO)
    // ============================================================================
    aprobaciones: [{ // NUEVO: workflow de múltiples aprobaciones
      aprobadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rol: {
        type: String,
        enum: ['engineer', 'coordinator_hes', 'admin'],
        required: true,
      },
      aprobado: {
        type: Boolean,
        required: true,
      },
      comentarios: String,
      fecha: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Compatibilidad con código anterior
    aprobadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fechaAprobacion: {
      type: Date,
    },
    
    // ============================================================================
    // OBSERVACIONES
    // ============================================================================
    observaciones: {
      type: String,
      trim: true,
      maxlength: [2000, 'Las observaciones no pueden exceder 2000 caracteres'],
    },
    
    // ============================================================================
    // RIESGOS IDENTIFICADOS (NUEVO)
    // ============================================================================
    riesgos: [{
      descripcion: {
        type: String,
        required: true,
        trim: true,
      },
      nivel: {
        type: String,
        enum: ['bajo', 'medio', 'alto', 'critico'],
        default: 'medio',
      },
      medidaControl: {
        type: String,
        trim: true,
      },
      responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    
    // ============================================================================
    // MÉTRICAS CALCULADAS (NUEVO)
    // ============================================================================
    metricas: {
      costoTotalEstimado: {
        type: Number,
        default: 0,
      },
      duracionTotalDias: {
        type: Number,
        default: 0,
      },
      porcentajeCompletado: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      materialesCompletos: {
        type: Boolean,
        default: false,
      },
      herramientasCompletas: {
        type: Boolean,
        default: false,
      },
    },
    
    // ============================================================================
    // ARCHIVOS
    // ============================================================================
    archivos: [{
      nombre: { type: String, required: true },
      url: { type: String, required: true },
      tipo: { type: String },
      categoria: { // NUEVO
        type: String,
        enum: ['plano', 'certificado', 'cotizacion', 'foto', 'otro'],
        default: 'otro',
      },
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
    // FLAGS (NUEVO)
    // ============================================================================
    requiereRevision: {
      type: Boolean,
      default: false,
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'urgente'],
      default: 'media',
      // índice manejado mediante workPlanSchema.index(...) para evitar duplicados
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

// Índices simples
workPlanSchema.index({ orderId: 1 });
workPlanSchema.index({ estado: 1 });
workPlanSchema.index({ unidadNegocio: 1 });
workPlanSchema.index({ prioridad: 1 });
workPlanSchema.index({ createdAt: -1 });

// Índices compuestos para queries frecuentes
workPlanSchema.index({ orderId: 1, estado: 1 });
workPlanSchema.index({ estado: 1, createdAt: -1 });
workPlanSchema.index({ 'responsables.ingResidente': 1, estado: 1 });
workPlanSchema.index({ creadoPor: 1, estado: 1 }); // NUEVO: mis planes
workPlanSchema.index({ unidadNegocio: 1, estado: 1 }); // NUEVO: por unidad
workPlanSchema.index({ estado: 1, prioridad: 1 }); // NUEVO: urgentes

// Full-text search (NUEVO)
workPlanSchema.index({
  titulo: 'text',
  descripcion: 'text',
  alcance: 'text',
});

// ============================================================================
// VIRTUALS
// ============================================================================

// Virtual: Costo total de materiales
workPlanSchema.virtual('costoTotalMateriales').get(function () {
  return this.materiales.reduce((total, material) => {
    return total + ((material.costo || 0) * material.cantidad);
  }, 0);
});

// Virtual: Total de personal requerido
workPlanSchema.virtual('totalPersonal').get(function () {
  const p = this.personalRequerido;
  return (p.electricistas || 0) + 
         (p.tecnicosTelecomunicacion || 0) + 
         (p.instrumentistas || 0) + 
         (p.obreros || 0);
});

// Virtual: Porcentaje de actividades completadas
workPlanSchema.virtual('progresoActividades').get(function () {
  if (this.cronograma.length === 0) return 0;
  const completadas = this.cronograma.filter(a => a.completada).length;
  return Math.round((completadas / this.cronograma.length) * 100);
});

// Virtual: Está aprobado
workPlanSchema.virtual('estaAprobado').get(function () {
  return this.estado === WORKPLAN_STATUS.APPROVED;
});

// Virtual: Total de herramientas
workPlanSchema.virtual('totalHerramientas').get(function () {
  return this.herramientas.reduce((sum, h) => sum + h.cantidad, 0);
});

// Virtual: Total de equipos
workPlanSchema.virtual('totalEquipos').get(function () {
  return this.equipos.reduce((sum, e) => sum + e.cantidad, 0);
});

// Virtual: Materiales recibidos (NUEVO)
workPlanSchema.virtual('materialesRecibidos').get(function () {
  if (this.materiales.length === 0) return 100;
  const recibidos = this.materiales.filter(m => m.recibido).length;
  return Math.round((recibidos / this.materiales.length) * 100);
});

// Virtual: Tiene certificados vencidos (NUEVO)
workPlanSchema.virtual('tieneCertificadosVencidos').get(function () {
  const ahora = new Date();
  return this.equipos.some(eq => 
    eq.certificado?.vigencia && eq.certificado.vigencia < ahora
  );
});

// Virtual: Duración total del proyecto (NUEVO)
workPlanSchema.virtual('duracionTotal').get(function () {
  if (this.cronograma.length === 0) return 0;
  
  const fechas = this.cronograma.map(a => ({
    inicio: new Date(a.fechaInicio),
    fin: new Date(a.fechaFin),
  }));
  
  const fechaInicio = Math.min(...fechas.map(f => f.inicio.getTime()));
  const fechaFin = Math.max(...fechas.map(f => f.fin.getTime()));
  
  const diff = fechaFin - fechaInicio;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); // en días
});

// ============================================================================
// MIDDLEWARE PRE-SAVE
// ============================================================================

// Calcular métricas antes de guardar
workPlanSchema.pre('save', function (next) {
  // Calcular costo total
  this.metricas.costoTotalEstimado = this.costoTotalMateriales;
  
  // Calcular duración total
  this.metricas.duracionTotalDias = this.duracionTotal;
  
  // Calcular porcentaje completado
  this.metricas.porcentajeCompletado = this.progresoActividades;
  
  // Verificar materiales completos
  this.metricas.materialesCompletos = this.materiales.length > 0 && 
    this.materiales.every(m => m.recibido);
  
  // Verificar herramientas completas
  this.metricas.herramientasCompletas = this.herramientas.length > 0 &&
    this.herramientas.every(h => h.disponible);
  
  // Marcar certificados vencidos
  const ahora = new Date();
  this.equipos.forEach(eq => {
    if (eq.certificado?.vigencia) {
      eq.certificado.vencido = eq.certificado.vigencia < ahora;
    }
  });
  
  next();
});

// Logging de cambios de estado
workPlanSchema.pre('save', function (next) {
  if (this.isModified('estado') && !this.isNew) {
    logger.info(`WorkPlan ${this._id} changed state to ${this.estado}`);
  }
  next();
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================

/**
 * Marcar actividad como completada
 */
workPlanSchema.methods.completeActivity = async function (activityId) {
  const activity = this.cronograma.id(activityId);
  if (activity && !activity.completada) {
    activity.completada = true;
    activity.fechaCompletada = new Date();
    
    // Calcular duración real
    const duracion = activity.fechaCompletada - activity.fechaInicio;
    activity.duracionReal = duracion / (1000 * 60 * 60); // en horas
    
    logger.info(`Activity ${activityId} completed in workplan ${this._id}`);
  }
  return await this.save();
};

/**
 * Aprobar plan (NUEVO)
 */
workPlanSchema.methods.aprobar = async function (userId, rol, comentarios = '') {
  this.aprobaciones.push({
    aprobadoPor: userId,
    rol,
    aprobado: true,
    comentarios,
    fecha: new Date(),
  });
  
  // Si todas las aprobaciones necesarias están, cambiar estado
  const rolesRequeridos = ['engineer', 'coordinator_hes'];
  const rolesAprobados = this.aprobaciones
    .filter(a => a.aprobado)
    .map(a => a.rol);
  
  if (rolesRequeridos.every(r => rolesAprobados.includes(r))) {
    this.estado = WORKPLAN_STATUS.APPROVED;
    this.aprobadoPor = userId;
    this.fechaAprobacion = new Date();
  }
  
  logger.info(`WorkPlan ${this._id} approved by ${userId} (${rol})`);
  return await this.save();
};

/**
 * Rechazar plan (NUEVO)
 */
workPlanSchema.methods.rechazar = async function (userId, rol, comentarios) {
  this.aprobaciones.push({
    aprobadoPor: userId,
    rol,
    aprobado: false,
    comentarios,
    fecha: new Date(),
  });
  
  this.estado = WORKPLAN_STATUS.DRAFT;
  this.requiereRevision = true;
  
  logger.warn(`WorkPlan ${this._id} rejected by ${userId} (${rol}): ${comentarios}`);
  return await this.save();
};

/**
 * Verificar disponibilidad de recursos (NUEVO)
 */
workPlanSchema.methods.verificarRecursos = function () {
  const faltantes = {
    materiales: this.materiales.filter(m => !m.recibido),
    herramientas: this.herramientas.filter(h => !h.disponible),
    equiposSinCertificar: this.equipos.filter(e => !e.certificado?.numero),
    certificadosVencidos: this.equipos.filter(e => e.certificado?.vencido),
  };
  
  const todoListo = 
    faltantes.materiales.length === 0 &&
    faltantes.herramientas.length === 0 &&
    faltantes.equiposSinCertificar.length === 0 &&
    faltantes.certificadosVencidos.length === 0;
  
  return {
    todoListo,
    faltantes,
  };
};

/**
 * Obtener próximas actividades (NUEVO)
 */
workPlanSchema.methods.getProximasActividades = function (dias = 7) {
  const ahora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  
  return this.cronograma.filter(a => 
    !a.completada &&
    a.fechaInicio >= ahora &&
    a.fechaInicio <= limite
  ).sort((a, b) => a.fechaInicio - b.fechaInicio);
};

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Buscar planes por estado
 */
workPlanSchema.statics.findByStatus = function (status) {
  return this.find({ estado: status }).sort({ createdAt: -1 });
};

/**
 * Buscar planes pendientes de aprobación
 */
workPlanSchema.statics.findPendingApproval = function () {
  return this.find({ estado: WORKPLAN_STATUS.DRAFT })
    .sort({ createdAt: 1 });
};

/**
 * Buscar por orden (NUEVO)
 */
workPlanSchema.statics.findByOrder = function (orderId) {
  return this.findOne({ orderId }).populate('responsables.ingResidente responsables.hes');
};

/**
 * Buscar por responsable (NUEVO)
 */
workPlanSchema.statics.findByResponsable = function (userId) {
  return this.find({
    $or: [
      { 'responsables.ingResidente': userId },
      { 'responsables.tecnicoElectricista': userId },
      { 'responsables.hes': userId },
    ],
  }).sort({ createdAt: -1 });
};

/**
 * Buscar por unidad de negocio (NUEVO)
 */
workPlanSchema.statics.findByUnidad = function (unidad) {
  return this.find({ unidadNegocio: unidad, estado: { $ne: WORKPLAN_STATUS.DRAFT } })
    .sort({ createdAt: -1 });
};

/**
 * Búsqueda full-text (NUEVO)
 */
workPlanSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Obtener estadísticas (NUEVO)
 */
workPlanSchema.statics.getEstadisticas = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        costoPromedio: { $avg: '$metricas.costoTotalEstimado' },
        duracionPromedio: { $avg: '$metricas.duracionTotalDias' },
      },
    },
  ]);
  
  return stats;
};

const WorkPlan = mongoose.model('WorkPlan', workPlanSchema);

export default WorkPlan;
