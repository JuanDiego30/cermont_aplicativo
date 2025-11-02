/**
 * CctvReport Model
 * @description Modelo de Mongoose para reportes de mantenimiento CCTV
 */

import mongoose from 'mongoose';

const cctvReportSchema = new mongoose.Schema(
  {
    // Relación con orden de trabajo
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    
    // Información general
    camaraNo: {
      type: Number,
      min: 1,
    },
    rutinaNo: {
      type: Number,
      min: 1,
    },
    lugar: {
      type: String,
      required: [true, 'El lugar es requerido'],
      trim: true,
      maxlength: [200, 'El lugar no puede exceder 200 caracteres'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida'],
      default: Date.now,
    },
    
    // Medidas de la estructura
    alturaEstructura: {
      type: Number,
      min: [0, 'La altura no puede ser negativa'],
    },
    alturaCamara: {
      type: Number,
      min: [0, 'La altura no puede ser negativa'],
    },
    distanciaCamCaja: {
      type: Number,
      min: [0, 'La distancia no puede ser negativa'],
    },
    
    // Cámara
    camara: {
      tipo: { type: String, trim: true },
      modelo: { type: String, trim: true },
      serial: { type: String, trim: true },
    },
    
    // Encoder/PoE
    encoderPoe: {
      tipo: { type: String, trim: true },
      modelo: { type: String, trim: true },
      serial: { type: String, trim: true },
    },
    
    // Radio
    radio: {
      tipo: { type: String, trim: true },
      modelo: { type: String, trim: true },
      serial: { type: String, trim: true },
    },
    
    // Antena externa
    antenaExterna: {
      nombre: { type: String, trim: true },
      tipo: { type: String, trim: true },
      serial: { type: String, trim: true },
    },
    
    // Switch
    switchEquipo: {
      tipo: { type: String, trim: true },
      modelo: { type: String, trim: true },
      serial: { type: String, trim: true },
    },
    
    ubicacion: {
      type: String,
      trim: true,
    },
    
    // Master
    master: {
      radio: {
        tipo: { type: String, trim: true },
        modelo: { type: String, trim: true },
        serial: { type: String, trim: true },
      },
    },
    
    // Sistema eléctrico
    electrico: {
      ac110: { type: Boolean, default: false },
      fotovoltaico: { type: Boolean, default: false },
      cajaConexion: { type: Boolean, default: false },
      transferenciaAutomatica: { type: Boolean, default: false },
      puestaTierraOk: { type: Boolean, default: false },
      sistemaActivo: {
        type: String,
        enum: ['AC', 'SOL', null],
      },
      alimentacionOrigen: { type: String, trim: true },
      gabineteBaseTorre: { type: String, trim: true },
      tbt: { type: String, trim: true },
      lucesObstruccion: { type: String, trim: true },
    },
    
    observaciones: {
      type: String,
      trim: true,
      maxlength: [2000, 'Las observaciones no pueden exceder 2000 caracteres'],
    },
    
    alcance: {
      type: String,
      trim: true,
      maxlength: [2000, 'El alcance no puede exceder 2000 caracteres'],
    },
    
    // Registro fotográfico (URLs de las imágenes)
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
    
    // Técnico responsable
    tecnicoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El técnico es requerido'],
    },
    
    // Aprobación
    aprobadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fechaAprobacion: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compuestos para búsquedas eficientes
cctvReportSchema.index({ orderId: 1, fecha: -1 });
cctvReportSchema.index({ lugar: 1, fecha: -1 });
cctvReportSchema.index({ tecnicoId: 1, fecha: -1 });

// Virtual: Total de fotos cargadas
cctvReportSchema.virtual('totalFotos').get(function () {
  let total = 0;
  for (const categoria in this.fotos) {
    total += this.fotos[categoria].length;
  }
  return total;
});

// Virtual: Estado de aprobación
cctvReportSchema.virtual('estaAprobado').get(function () {
  return !!this.aprobadoPor;
});

// Método estático: Buscar reportes por rango de fechas
cctvReportSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    fecha: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ fecha: -1 });
};

const CctvReport = mongoose.model('CctvReport', cctvReportSchema);

export default CctvReport;
