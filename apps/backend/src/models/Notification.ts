/**
 * Notification Model (TypeScript - November 2025)
 * @description Modelo Mongoose para notificaciones del sistema CERMONT ATG
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { logger } from '../utils/logger.js';

// ==================== CONSTANTS ====================

const NOTIFICATION_TYPES = [
  'order_assigned',
  'order_status_changed',
  'order_note_added',
  'workplan_approved',
  'workplan_created',
  'user_mentioned',
  'system_alert',
  'password_changed',
  'account_activated',
  'account_deactivated',
] as const;

export { NOTIFICATION_TYPES };

type NotificationType = typeof NOTIFICATION_TYPES[number];

// ==================== INTERFACES ====================

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // Usuario destinatario
  type: NotificationType;
  title?: string;
  message: string;
  data?: Record<string, any>; // Datos adicionales (orderId, etc.)
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationModel extends Model<INotification> {
  findByUser(userId: Types.ObjectId, options?: { limit?: number; skip?: number }): Promise<INotification[]>;
  findUnreadByUser(userId: Types.ObjectId, options?: { limit?: number }): Promise<INotification[]>;
  markAsRead(notificationId: Types.ObjectId, userId: Types.ObjectId): Promise<INotification | null>;
  markAllAsRead(userId: Types.ObjectId): Promise<number>;
  createNotification(data: Partial<INotification>): Promise<INotification>;
}

// ==================== SCHEMA ====================

const notificationSchema = new Schema<INotification, INotificationModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

// ==================== INDEXES ====================

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// ==================== MIDDLEWARE ====================

notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// ==================== STATIC METHODS ====================

notificationSchema.statics.findByUser = function(
  userId: Types.ObjectId,
  options: { limit?: number; skip?: number } = {}
): Promise<INotification[]> {
  const query = this.find({ userId }).sort({ createdAt: -1 });

  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);

  return query.exec();
};

notificationSchema.statics.findUnreadByUser = function(
  userId: Types.ObjectId,
  options: { limit?: number } = {}
): Promise<INotification[]> {
  const query = this.find({ userId, read: false }).sort({ createdAt: -1 });

  if (options.limit) query.limit(options.limit);

  return query.exec();
};

notificationSchema.statics.markAsRead = function(
  notificationId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<INotification | null> {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true, readAt: new Date() },
    { new: true }
  ).exec();
};

notificationSchema.statics.markAllAsRead = function(
  userId: Types.ObjectId
): Promise<number> {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  ).then(result => result.modifiedCount);
};

notificationSchema.statics.createNotification = function(
  data: Partial<INotification>
): Promise<INotification> {
  return this.create(data);
};

// ==================== EXPORT ====================

const Notification = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;
export type { NotificationType };
export { NOTIFICATION_TYPES };