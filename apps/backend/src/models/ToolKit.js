/**
 * ToolKit Model
 * @description Modelo para kits de herramientas predefinidos
 */

import mongoose from 'mongoose';

const toolKitSchema = new mongoose.Schema(
  {
    // Información básica
    nombre: {
      type: String,
      required: [true, 'El nombre del kit es requerido'],
      unique: true,
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    
    // Categoría del kit
    categoria: {
      type: String,
      enum: {
        values: ['electrico', 'telecomunicaciones', 'CCTV', 'instrumentacion', 'general'],
        message: 'Categoría inválida',
      },
      required: [true, 'La categoría es requerida'],
    },
    
    // Herramientas del kit
    herramientas: [{
      nombre: {
        type: String,
        required: [true, 'El nombre de la herramienta es requerido'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
      esencial: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Equipos del kit
    equipos: [{
      nombre: {
        type: String,
        required: [true, 'El nombre del equipo es requerido'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
      requiereCertificacion: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Elementos de seguridad
    elementosSeguridad: [{
      nombre: {
        type: String,
        required: [true, 'El nombre del elemento de seguridad es requerido'],
        trim: true,
      },
      cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1'],
      },
    }],
    
    // Estado y control
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Usuario que creó el kit
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Estadística de uso
    vecesUtilizado: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para optimización
toolKitSchema.index({ nombre: 1, isActive: 1 });
toolKitSchema.index({ categoria: 1, vecesUtilizado: -1 });

// Virtual: Total de items en el kit
toolKitSchema.virtual('totalItems').get(function () {
  const herramientas = this.herramientas.reduce((sum, item) => sum + item.cantidad, 0);
  const equipos = this.equipos.reduce((sum, item) => sum + item.cantidad, 0);
  const seguridad = this.elementosSeguridad.reduce((sum, item) => sum + item.cantidad, 0);
  return herramientas + equipos + seguridad;
});

// Virtual: Herramientas esenciales
toolKitSchema.virtual('herramientasEsenciales').get(function () {
  return this.herramientas.filter(h => h.esencial);
});

// Virtual: Equipos que requieren certificación
toolKitSchema.virtual('equiposConCertificacion').get(function () {
  return this.equipos.filter(e => e.requiereCertificacion);
});

// Método estático: Buscar por categoría
toolKitSchema.statics.findByCategory = function (category) {
  return this.find({ categoria: category, isActive: true }).sort({ vecesUtilizado: -1 });
};

// Método estático: Obtener más utilizados
toolKitSchema.statics.getMostUsed = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ vecesUtilizado: -1 })
    .limit(limit);
};

// Método de instancia: Incrementar uso
toolKitSchema.methods.incrementUsage = async function () {
  this.vecesUtilizado += 1;
  return await this.save();
};

// Método de instancia: Duplicar kit
toolKitSchema.methods.clone = async function (newName) {
  const ToolKit = this.constructor;
  return await ToolKit.create({
    nombre: newName,
    descripcion: `Copia de: ${this.nombre}`,
    categoria: this.categoria,
    herramientas: this.herramientas,
    equipos: this.equipos,
    elementosSeguridad: this.elementosSeguridad,
  });
};

const ToolKit = mongoose.model('ToolKit', toolKitSchema);

export default ToolKit;
