/**
 * User Model (Optimized - October 2025)
 * @description Modelo para usuarios con seguridad avanzada y performance optimizado
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';
import { hashPassword, verifyPassword, detectHashType } from '../utils/passwordHash.js';
import { logger } from '../utils/logger.js';

const userSchema = new mongoose.Schema(
  {
    // ============================================================================
    // INFORMACIÓN PERSONAL
    // ============================================================================
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // CREDENCIALES
    // ============================================================================
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No devolver por defecto
    },
    
    // ============================================================================
    // ROL Y PERMISOS
    // ============================================================================
    rol: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Rol inválido',
      },
      default: ROLES.TECHNICIAN,
      required: true,
    },
    
    // ============================================================================
    // INFORMACIÓN DE CONTACTO
    // ============================================================================
    telefono: {
      type: String,
      trim: true,
    },
    
    // ============================================================================
    // IDENTIFICACIÓN
    // ============================================================================
    cedula: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite valores null múltiples
    },
    
    // ============================================================================
    // INFORMACIÓN LABORAL
    // ============================================================================
    cargo: {
      type: String,
      trim: true,
      maxlength: [100, 'El cargo no puede exceder 100 caracteres'],
    },
    especialidad: {
      type: String,
      trim: true,
      maxlength: [100, 'La especialidad no puede exceder 100 caracteres'],
    },
    
    // ============================================================================
    // AVATAR/FOTO
    // ============================================================================
    avatar: {
      type: String,
      default: null,
    },
    
    // ============================================================================
    // ESTADO
    // ============================================================================
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // ============================================================================
    // SEGURIDAD AVANZADA (NUEVO)
    // ============================================================================
    
    // Token versioning para invalidar tokens antiguos
    tokenVersion: {
      type: Number,
      default: 0,
      select: false, // No devolver en queries
    },
    
    // Refresh tokens para múltiples dispositivos
    refreshTokens: [{
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      device: {
        type: String,
        default: 'unknown',
      },
      ip: String,
      userAgent: String,
    }],
    
    // Protección contra brute force
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA Y SESIONES (NUEVO)
    // ============================================================================
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      select: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
      select: false,
    },
    
    // Historial de cambios importantes (últimos 10)
    securityLog: [{
      action: {
        type: String,
        enum: ['password_change', 'email_change', 'role_change', 'account_locked', 'account_unlocked'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    
    // ============================================================================
    // TOKENS (EXISTENTES - Mantener compatibilidad)
    // ============================================================================
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    
    // ============================================================================
    // AUDITORÍA DE CREACIÓN/MODIFICACIÓN (NUEVO)
    // ============================================================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false,
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
// (email y cedula ya tienen unique: true en campo, no necesitan schema.index simple)
userSchema.index({ rol: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Índices compuestos para queries comunes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ rol: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 }); // Para dashboard

// Índice de texto para búsqueda
userSchema.index({ nombre: 'text', email: 'text' });

// ============================================================================
// VIRTUALS
// ============================================================================

// Virtual: Nombre completo
userSchema.virtual('nombreCompleto').get(function () {
  return this.nombre;
});

// Virtual: Iniciales
userSchema.virtual('iniciales').get(function () {
  const nombres = this.nombre.split(' ');
  return nombres.map(n => n[0]).join('').toUpperCase();
});

// Virtual: Verificar si cuenta está bloqueada
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================================================
// MIDDLEWARE PRE-SAVE
// ============================================================================

// Hash de contraseña
userSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();

  try {
    // Registrar cambio de contraseña en log de seguridad
    if (!this.isNew) {
      this.lastPasswordChange = new Date();
      this.securityLog.push({
        action: 'password_change',
        timestamp: new Date(),
        performedBy: this._id,
      });
      
      // Mantener solo últimos 10 logs
      if (this.securityLog.length > 10) {
        this.securityLog = this.securityLog.slice(-10);
      }
    }
    
    // Hash con Argon2
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Limpiar refresh tokens expirados antes de guardar
userSchema.pre('save', function (next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );
  }
  next();
});

// ============================================================================
// MÉTODOS DE INSTANCIA
// ============================================================================

/**
 * Comparar contraseña con hash almacenado
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const hashType = detectHashType(this.password);

    if (hashType === 'bcrypt') {
      // Hash antiguo con bcrypt (compatibilidad)
      const isMatch = await bcrypt.compare(candidatePassword, this.password);

      // Si es correcto, rehash con argon2 y guardar
      if (isMatch) {
        try {
          this.password = await hashPassword(candidatePassword);
          await this.save();
          logger.info(`Password rehashed to argon2 for user: ${this.email}`);
        } catch (err) {
          logger.error('Rehash to argon2 failed:', err);
        }
      }

      return isMatch;
    } else if (hashType === 'argon2') {
      // Hash nuevo con argon2
      return await verifyPassword(this.password, candidatePassword);
    }

    return false;
  } catch (error) {
    // Log the original error for debugging
    console.error('comparePassword error:', error);
    throw new Error('Error al comparar contraseñas');
  }
};

/**
 * Generar objeto para JWT/Auth (sin datos sensibles)
 */
userSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    telefono: this.telefono,
    cedula: this.cedula,
    cargo: this.cargo,
    especialidad: this.especialidad,
    avatar: this.avatar,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
  };
};

/**
 * Verificar si tiene rol específico
 */
userSchema.methods.hasRole = function (role) {
  return this.rol === role;
};

/**
 * Verificar si tiene al menos cierto nivel de rol
 */
userSchema.methods.hasMinRole = function (minRole) {
  const ROLE_HIERARCHY = {
    root: 100,
    admin: 90,
    coordinator_hes: 80,
    engineer: 70,
    supervisor: 60,
    technician: 50,
    accountant: 40,
    client: 10,
  };
  
  return ROLE_HIERARCHY[this.rol] >= ROLE_HIERARCHY[minRole];
};

// ============================================================================
// MÉTODOS DE SEGURIDAD (NUEVO)
// ============================================================================

/**
 * Incrementar intentos de login fallidos
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Si ya está bloqueado y el periodo expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  // Incrementar intentos
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta si se alcanzó el máximo de intentos (5)
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCKOUT_TIME) || 15 * 60 * 1000; // 15 min
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
    
    // Registrar en log de seguridad
    this.securityLog.push({
      action: 'account_locked',
      timestamp: new Date(),
    });
    
    logger.warn(`Account locked due to failed login attempts: ${this.email}`);
  }
  
  return await this.updateOne(updates);
};

/**
 * Resetear intentos de login después de login exitoso
 */
userSchema.methods.resetLoginAttempts = async function (ip) {
  return await this.updateOne({
    $set: { 
      loginAttempts: 0,
      lastLogin: new Date(),
      lastLoginIp: ip,
    },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Invalidar todos los tokens (logout en todos los dispositivos)
 */
userSchema.methods.invalidateAllTokens = async function () {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  
  logger.info(`All tokens invalidated for user: ${this.email}`);
  
  return await this.save();
};

/**
 * Agregar refresh token para un dispositivo
 */
userSchema.methods.addRefreshToken = async function (token, expiresAt, device = 'unknown', ip, userAgent) {
  // Limitar a máximo 5 dispositivos
  if (this.refreshTokens.length >= 5) {
    // Eliminar el más antiguo
    this.refreshTokens.shift();
  }
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device,
    ip,
    userAgent,
  });
  
  return await this.save();
};

/**
 * Remover refresh token específico
 */
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return await this.save();
};

/**
 * Verificar si refresh token es válido
 */
userSchema.methods.hasValidRefreshToken = function (token) {
  return this.refreshTokens.some(
    rt => rt.token === token && rt.expiresAt > new Date()
  );
};

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

/**
 * Buscar por email (incluye password para autenticación)
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +tokenVersion');
};

/**
 * Buscar por rol
 */
userSchema.statics.findByRole = function (role) {
  return this.find({ rol: role, isActive: true });
};

/**
 * Buscar usuarios activos
 */
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

/**
 * Búsqueda full-text
 */
userSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Estadísticas de usuarios
 */
userSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$rol',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
      },
    },
  ]);
  
  return stats;
};

// ============================================================================
// EXPORTAR MODELO
// ============================================================================

const User = mongoose.model('User', userSchema);

export default User;
