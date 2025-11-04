/**
 * User Model (TypeScript - November 2025 - Clean Architecture)
 * @description Modelo Mongoose completo para Usuario CERMONT ATG con métodos estáticos, virtuales, seguridad y auditoría.
 */

import mongoose, { Schema, Document, Model, Types, HydratedDocument } from 'mongoose';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import { logger } from '../utils/logger.js';

// ==================== INTERFACES ====================

export interface IUser extends Document, IUserMethods {
  _id: Types.ObjectId;
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  rol: 'root' | 'admin' | 'coordinator_hes' | 'engineer' | 'technician' | 'accountant' | 'client';
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
  avatar?: string;
  isActive: boolean;
  isLocked: boolean;
  lockUntil?: Date;
  loginAttempts: number;
  lastLoginIP?: string;
  lastLogin?: Date;
  lastPasswordChange: Date;
  tokenVersion: number;
  refreshTokens: Array<{
    token: string;
    expiresAt: Date;
    device: 'desktop' | 'mobile' | 'tablet';
    ip: string;
    userAgent: string;
    createdAt: Date;
  }>;
  securityLog: Array<{
    action: 'password_change' | 'email_change' | 'role_change' | 'account_locked' | 'account_unlocked' | 'tokens_invalidated';
    timestamp: Date;
    ip?: string;
    performedBy?: Types.ObjectId;
  }>;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  twoFaSecret?: string;
  twoFaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  nombreCompleto: string;
  iniciales: string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toAuthJSON(): any;
  hasRole(role: string): boolean;
  hasMinRole(minRole: string): boolean;
  incrementLoginAttempts(ip?: string): Promise<HydratedDocument<IUser>>;
  resetLoginAttempts(ip?: string): Promise<HydratedDocument<IUser>>;
  invalidateAllTokens(performerId?: Types.ObjectId, ip?: string): Promise<HydratedDocument<IUser>>;
  addRefreshToken(token: string, expiresAt: Date, device?: string, ip?: string, userAgent?: string): Promise<HydratedDocument<IUser>>;
  removeRefreshToken(token: string): Promise<HydratedDocument<IUser>>;
  hasValidRefreshToken(token: string): boolean;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<HydratedDocument<IUser> | null>;
  findByRole(role: string, options?: { page?: number; limit?: number }): Promise<HydratedDocument<IUser>[]>;
  findActive(options?: { page?: number; limit?: number; especialidad?: string }): Promise<HydratedDocument<IUser>[]>;
  search(query: string, options?: { page?: number; limit?: number; rol?: string }): Promise<HydratedDocument<IUser>[]>;
  getStats(): Promise<any[]>;
  getByEspecialidad(especialidad: string): Promise<HydratedDocument<IUser>[]>;
  comparePasswordStatic(password: string, hash: string): Promise<boolean>;
  incrementLoginAttempts(userId: Types.ObjectId): Promise<HydratedDocument<IUser>>;
  resetLoginAttempts(userId: Types.ObjectId, ip?: string): Promise<HydratedDocument<IUser>>;
  addRefreshTokenStatic(userId: Types.ObjectId, token: string, expiresAt: Date, deviceInfo: any): Promise<HydratedDocument<IUser>>;
  removeRefreshTokenStatic(userId: Types.ObjectId, token: string): Promise<HydratedDocument<IUser>>;
  invalidateAllTokensStatic(userId: Types.ObjectId): Promise<HydratedDocument<IUser>>;
  hasValidRefreshTokenStatic(user: IUser, token: string): boolean;
}

// ==================== CONSTANTS ====================

const ROLES = ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'] as const;

const ROLE_HIERARCHY: Record<string, number> = {
  root: 100,
  admin: 90,
  coordinator_hes: 70,
  engineer: 50,
  technician: 30,
  accountant: 20,
  client: 10,
};

// ==================== SCHEMA ====================

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>({
  nombre: {
    type: String,
    required: [true, 'Nombre requerido'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  apellido: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'],
  },
  password: {
    type: String,
    required: [true, 'Contraseña requerida'],
    minlength: 8,
    select: false,
  },
  rol: {
    type: String,
    enum: ROLES,
    default: 'technician',
    required: [true, 'Rol requerido'],
    index: true,
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: 20,
  },
  cedula: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  cargo: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  especialidad: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  avatar: {
    type: String,
    default: null,
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  tokenVersion: {
    type: Number,
    default: 0,
    select: false,
  },
  refreshTokens: [{
    token: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
    ip: { type: String, maxlength: 45 },
    userAgent: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  loginAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  lockUntil: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  lastLoginIP: {
    type: String,
    select: false,
    maxlength: 45,
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now,
    select: false,
  },
  securityLog: [{
    action: {
      type: String,
      enum: ['password_change', 'email_change', 'role_change', 'account_locked', 'account_unlocked', 'tokens_invalidated'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, maxlength: 45 },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    select: false,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    select: false,
  },
  twoFaSecret: {
    type: String,
    select: false,
  },
  twoFaEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (doc, ret: any) => {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.securityLog;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.tokenVersion;
      delete ret.lastLoginIP;
      delete ret.lastPasswordChange;
      delete ret.createdBy;
      delete ret.updatedBy;
      return ret;
    },
  },
  toObject: { virtuals: true, getters: true },
  strict: true,
  collection: 'users',
});

// ==================== INDICES ====================

UserSchema.index({ rol: 1, isActive: 1 });
UserSchema.index({ isActive: 1, lastLogin: -1 });
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ especialidad: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ nombre: 'text', email: 'text', cargo: 'text', especialidad: 'text' });

// ==================== VIRTUALS ====================

UserSchema.virtual('nombreCompleto').get(function(this: IUser): string {
  return `${this.nombre}${this.apellido ? ` ${this.apellido}` : ''}`.trim();
});

UserSchema.virtual('iniciales').get(function(this: IUser): string {
  const parts = this.nombreCompleto.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 3);
});

UserSchema.virtual('isLocked').get(function(this: IUser): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// ==================== HOOKS ====================

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);
    
    if (!this.isNew) {
      this.lastPasswordChange = new Date();
      this.securityLog.push({
        action: 'password_change',
        timestamp: new Date(),
        performedBy: this.updatedBy || this._id,
      } as any);
      
      if (this.securityLog.length > 10) {
        this.securityLog = this.securityLog.slice(-10);
      }
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.pre('save', function(next) {
  // Limpiar tokens expirados
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter((rt: any) => rt.expiresAt > new Date());
    if (this.refreshTokens.length > 5) {
      this.refreshTokens = this.refreshTokens.slice(-5);
    }
  }

  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.updatedBy || this._id;
  }
  
  next();
});

// ==================== INSTANCE METHODS ====================

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  
  try {
    return await verifyPassword(this.password, candidatePassword);
  } catch (error) {
    logger.error('Password comparison error:', error);
    throw new Error('Error en comparación de contraseña');
  }
};

UserSchema.methods.toAuthJSON = function(): any {
  return {
    _id: this._id,
    nombre: this.nombreCompleto,
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

UserSchema.methods.hasRole = function(role: string): boolean {
  return this.rol === role;
};

UserSchema.methods.hasMinRole = function(minRole: string): boolean {
  return (ROLE_HIERARCHY[this.rol] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
};

UserSchema.methods.incrementLoginAttempts = async function(ip?: string): Promise<HydratedDocument<IUser>> {
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({ $set: { loginAttempts: 1, lockUntil: undefined } });
    this.loginAttempts = 1;
    this.lockUntil = undefined;
    return this;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
  const lockMinutes = parseInt(process.env.ACCOUNT_LOCKOUT_TIME_MIN || '15');

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    const lockTime = new Date(Date.now() + lockMinutes * 60 * 1000);
    updates.$set = { lockUntil: lockTime };
    this.securityLog.push({ action: 'account_locked', timestamp: new Date(), ip } as any);
    if (this.securityLog.length > 10) {
      this.securityLog = this.securityLog.slice(-10);
    }
    logger.warn(`User locked: ${this.email} after ${maxAttempts} attempts`);
  }

  await this.updateOne(updates);
  await this.save({ validateBeforeSave: false });
  
  const updated = await (this.constructor as IUserModel).findById(this._id);
  if (updated) Object.assign(this, updated);
  
  return this;
};

UserSchema.methods.resetLoginAttempts = async function(ip?: string): Promise<HydratedDocument<IUser>> {
  this.securityLog.push({ action: 'account_unlocked', timestamp: new Date(), ip } as any);
  if (this.securityLog.length > 10) {
    this.securityLog = this.securityLog.slice(-10);
  }
  
  await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date(), lastLoginIP: ip, lockUntil: undefined },
  });
  
  await this.save({ validateBeforeSave: false });
  
  const updated = await (this.constructor as IUserModel).findById(this._id);
  if (updated) Object.assign(this, updated);
  
  return this;
};

UserSchema.methods.invalidateAllTokens = async function(
  performerId?: Types.ObjectId,
  ip?: string
): Promise<HydratedDocument<IUser>> {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  this.securityLog.push({
    action: 'tokens_invalidated',
    timestamp: new Date(),
    ip,
    performedBy: performerId,
  } as any);
  
  if (this.securityLog.length > 10) {
    this.securityLog = this.securityLog.slice(-10);
  }
  
  logger.info(`All tokens invalidated for: ${this.email}`);
  return this.save();
};

UserSchema.methods.addRefreshToken = async function(
  token: string,
  expiresAt: Date,
  device: string = 'desktop',
  ip?: string,
  userAgent?: string
): Promise<HydratedDocument<IUser>> {
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }
  
  this.refreshTokens.push({
    token,
    expiresAt,
    device: device as any,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    createdAt: new Date(),
  } as any);
  
  return this.save();
};

UserSchema.methods.removeRefreshToken = async function(token: string): Promise<HydratedDocument<IUser>> {
  this.refreshTokens = this.refreshTokens.filter((rt: any) => rt.token !== token);
  return this.save();
};

UserSchema.methods.hasValidRefreshToken = function(token: string): boolean {
  return this.refreshTokens.some((rt: any) => rt.token === token && rt.expiresAt > new Date());
};

// ==================== STATIC METHODS ====================

UserSchema.statics.findByEmail = function(email: string): Promise<HydratedDocument<IUser> | null> {
  return this.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +tokenVersion +refreshTokens +securityLog');
};

UserSchema.statics.findByRole = function(
  role: string,
  options: { page?: number; limit?: number } = {}
): Promise<HydratedDocument<IUser>[]> {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ rol: role, isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password -refreshTokens')
    .lean() as any;
};

UserSchema.statics.findActive = function(
  options: { page?: number; limit?: number; especialidad?: string } = {}
): Promise<HydratedDocument<IUser>[]> {
  const { page = 1, limit = 50, especialidad } = options;
  const query: any = { isActive: true };
  
  if (especialidad) {
    query.especialidad = { $regex: especialidad, $options: 'i' };
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ lastLogin: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password -refreshTokens -securityLog')
    .lean() as any;
};

UserSchema.statics.search = function(
  query: string,
  options: { page?: number; limit?: number; rol?: string } = {}
): Promise<HydratedDocument<IUser>[]> {
  const { page = 1, limit = 20, rol } = options;
  const match: any = { $text: { $search: query }, isActive: true };
  
  if (rol) match.rol = rol;
  
  const skip = (page - 1) * limit;
  
  return this.find(match, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password -refreshTokens')
    .lean() as any;
};

UserSchema.statics.getStats = async function(): Promise<any[]> {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$rol',
        count: { $sum: 1 },
        avgLastLogin: { $avg: { $ifNull: ['$lastLogin', new Date(0)] } },
        especialidades: { $addToSet: '$especialidad' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

UserSchema.statics.getByEspecialidad = function(especialidad: string): Promise<HydratedDocument<IUser>[]> {
  return this.find({
    especialidad: { $regex: especialidad, $options: 'i' },
    isActive: true,
    rol: { $in: ['technician', 'engineer'] },
  })
    .select('nombreCompleto especialidad telefono')
    .sort({ nombre: 1 })
    .lean() as any;
};

UserSchema.statics.comparePasswordStatic = async function(password: string, hash: string): Promise<boolean> {
  return verifyPassword(hash, password);
};

UserSchema.statics.incrementLoginAttempts = async function(userId: Types.ObjectId): Promise<HydratedDocument<IUser>> {
  const user = await this.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user.incrementLoginAttempts();
};

UserSchema.statics.resetLoginAttempts = async function(userId: Types.ObjectId, ip?: string): Promise<HydratedDocument<IUser>> {
  const user = await this.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user.resetLoginAttempts(ip);
};

UserSchema.statics.addRefreshTokenStatic = async function(
  userId: Types.ObjectId,
  token: string,
  expiresAt: Date,
  deviceInfo: any
): Promise<HydratedDocument<IUser>> {
  const user = await this.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user.addRefreshToken(token, expiresAt, deviceInfo?.device, deviceInfo?.ip, deviceInfo?.userAgent);
};

UserSchema.statics.removeRefreshTokenStatic = async function(
  userId: Types.ObjectId,
  token: string
): Promise<HydratedDocument<IUser>> {
  const user = await this.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user.removeRefreshToken(token);
};

UserSchema.statics.hasValidRefreshTokenStatic = function(user: IUser, token: string): boolean {
  return user.hasValidRefreshToken(token);
};

UserSchema.statics.invalidateAllTokensStatic = async function(userId: Types.ObjectId): Promise<HydratedDocument<IUser>> {
  const user = await this.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user.invalidateAllTokens();
};

// ==================== EXPORT ====================

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
export type UserDocument = HydratedDocument<IUser>;
