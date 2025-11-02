/**
 * Evidence Model
 * @description Modelo para evidencias fotográficas y documentales de órdenes
 */

import mongoose from 'mongoose';
import { EVIDENCE_TYPES } from '../utils/constants.js';

const evidenceSchema = new mongoose.Schema(
  {
    // Relación con orden de trabajo
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'El ID de orden es requerido'],
    },
    
    // Tipo de evidencia (antes, durante, después)
    tipo: {
      type: String,
      enum: {
        values: Object.values(EVIDENCE_TYPES),
        message: 'Tipo de evidencia inválido',
      },
      required: [true, 'El tipo de evidencia es requerido'],
    },
    
    // Categoría del archivo
    categoria: {
      type: String,
      enum: ['foto', 'documento', 'video', 'otros'],
      default: 'foto',
    },
    
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    
    // Archivos asociados
    archivos: [{
      nombre: {
        type: String,
        required: [true, 'El nombre del archivo es requerido'],
      },
      url: {
        type: String,
        required: [true, 'La URL del archivo es requerida'],
      },
      mimeType: {
        type: String,
      },
      tamaño: {
        type: Number,
        min: 0,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Ubicación de la evidencia
    ubicacion: {
      type: String,
      trim: true,
    },
    
    // Coordenadas GPS (opcional)
    coordenadas: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    
    fecha: {
      type: Date,
      default: Date.now,
    },
    
    // Usuario que subió la evidencia
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario que sube la evidencia es requerido'],
    },
    
    // Etiquetas para búsqueda
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compuestos
evidenceSchema.index({ orderId: 1, tipo: 1 });
evidenceSchema.index({ orderId: 1, fecha: -1 });
evidenceSchema.index({ uploadedBy: 1, fecha: -1 });
evidenceSchema.index({ tags: 1 });

// Virtual: Número total de archivos
evidenceSchema.virtual('totalArchivos').get(function () {
  return this.archivos.length;
});

// Virtual: Tamaño total de archivos
evidenceSchema.virtual('tamañoTotal').get(function () {
  return this.archivos.reduce((total, archivo) => total + (archivo.tamaño || 0), 0);
});

// Virtual: Tiene coordenadas
evidenceSchema.virtual('tieneUbicacion').get(function () {
  return !!(this.coordenadas && this.coordenadas.lat && this.coordenadas.lng);
});

// Método estático: Buscar evidencias por tipo
evidenceSchema.statics.findByType = function (orderId, tipo) {
  return this.find({ orderId, tipo }).sort({ fecha: -1 });
};

// Método estático: Buscar por etiquetas
evidenceSchema.statics.findByTags = function (tags) {
  return this.find({ tags: { $in: tags } }).sort({ fecha: -1 });
};

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;
