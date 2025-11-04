import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import type { AuditLogData } from '../types/index.js';

/**
 * Función helper para crear logs de auditoría manualmente
 * @param data Datos del log
 * @returns Promise<void>
 */
export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    const logData = {
      ...data,
      timestamp: new Date(),
      userId: typeof data.userId === 'string' ? new Types.ObjectId(data.userId) : data.userId,
    };
    await AuditLog.create(logData);
  } catch (error) {
    logger.error('[AuditLog] Error saving log:', {
      error: (error as Error).message,
      action: data.action,
      resource: data.resource,
    });
  }
};

/**
 * Loggea intentos de login fallidos (async)
 * @param email Email attempted
 * @param ipAddress Client IP
 * @param userAgent User agent
 * @param reason Reason (e.g., 'Invalid credentials')
 */
export const logLoginFailed = async (
  email: string,
  ipAddress: string,
  userAgent: string,
  reason: string
): Promise<void> => {
  await createAuditLog({
    userId: undefined,
    userEmail: email || 'unknown',
    action: 'LOGIN_FAILED',
    resource: 'Auth',
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    status: 'FAILURE',
    severity: 'MEDIUM',
    description: `Login fallido para ${email || 'unknown'}: ${reason}`,
  });
};
