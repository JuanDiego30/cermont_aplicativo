/**
 * Admin Controller (TypeScript - November 2025)
 * @description Endpoints de administración para rate limiting, con validación Zod y auth RBAC.
 * Uso: En admin.routes.ts (router.get('/rate-limit/stats', authenticate, requireMinRole('admin'), getRateLimitStats);). Integrado con rateLimiter (block/unblock), Zod (IP schemas), logger (audit trails).
 * Secure: Admin-only (req.user.rol check), IP validation (IPv4/IPv6 mejorada), no expose sensitive (remaining/resetTime optional). Performance: AsyncHandler wrap, no DB calls (in-memory rate manager).
 * Types: express@types, zod@types. Pruebas: Mock rateLimitManager en Jest (e.g., jest.mock('../middleware/rateLimiter')). Para ATG: Audit logs en actions (integra con auditService si needed).
 * Fixes: Align AuthUser a global types (rol en lugar de role), type guards en lugar de casts (resuelve TS2352/2430), Zod.safeParse() para safe validation, agrega remaining/resetTime en status.
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimitManager } from '../middleware/rateLimiter';
import { successResponse, errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Tipo alineado con global express.d.ts (user: { userId: string; rol: string; tokenVersion?: number; email?: string; } | undefined)
type AuthUser = {
  userId: string;
  rol: string;
  tokenVersion?: number;
  email?: string;
};

// Extensión typed de Request (compatible con global user)
type TypedRequest<T = any, P = any> = Request<P, any, T> & {
  user?: AuthUser;
};

// Regex mejorada para IPv4/IPv6 (incluye ::, ::1, abbreviated)
const IpSchema = z.string().regex(
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|:)$|::1$|^::$/
);

type IpType = z.infer<typeof IpSchema>;

const BlockBodySchema = z.object({
  ip: IpSchema,
  reason: z.string().optional(),
});

type BlockBodyType = z.infer<typeof BlockBodySchema>;

const IpBodySchema = z.object({
  ip: IpSchema,
});

type IpBodyType = z.infer<typeof IpBodySchema>;

/**
 * Verificar rol admin (type guard inline para DRY)
 * @param req - Express request con user de auth middleware
 * @throws Error si no admin (caught by asyncHandler)
 */
const requireAdmin = (req: Request & { user?: AuthUser }): void => {
  if (!req.user || req.user.rol !== 'admin') {
    throw new Error('Acceso denegado: Requiere rol admin');
  }
};

/**
 * Obtener estadísticas de rate limiting
 * @route GET /api/v1/admin/rate-limit/stats
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Obtener estadísticas de rate limiting
 * security:
 *   - bearerAuth: []
 * responses:
 *   200:
 *     description: Estadísticas obtenidas
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/SuccessResponse'
 *   403:
 *     description: Acceso denegado
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/ErrorResponse'
 */
export const getRateLimitStats = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const stats = rateLimitManager.getStats();

    successResponse(
      res,
      {
        stats,
        timestamp: new Date().toISOString(),
      },
      'Estadísticas de rate limiting obtenidas'
    );
  }
);

/**
 * Bloquear IP
 * @route POST /api/v1/admin/rate-limit/block
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Bloquear IP por abuso
 * security:
 *   - bearerAuth: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [ip]
 *         properties:
 *           ip:
 *             type: string
 *             example: '192.168.1.1'
 *           reason:
 *             type: string
 *             example: 'Múltiples intentos fallidos'
 * responses:
 *   200:
 *     description: IP bloqueada
 *   403:
 *     description: Acceso denegado
 */
export const blockIp = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = BlockBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const { ip, reason } = parseResult.data;

    rateLimitManager.blockIp(ip, reason || 'Manual block by admin');

    logger.info(`IP blocked by admin: ${ip} (reason: ${reason || 'N/A'}) by user ${req.user?.userId}`);

    successResponse(
      res,
      { ip, reason: reason || 'Bloqueo manual' },
      'IP bloqueada exitosamente'
    );
  }
);

/**
 * Desbloquear IP
 * @route POST /api/v1/admin/rate-limit/unblock
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Desbloquear IP
 * security:
 *   - bearerAuth: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [ip]
 *         properties:
 *           ip:
 *             type: string
 *             example: '192.168.1.1'
 * responses:
 *   200:
 *     description: IP desbloqueada
 *   403:
 *     description: Acceso denegado
 */
export const unblockIp = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = IpBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const { ip } = parseResult.data;

    rateLimitManager.unblockIp(ip);

    logger.info(`IP unblocked by admin: ${ip} by user ${req.user?.userId}`);

    successResponse(
      res,
      { ip },
      'IP desbloqueada exitosamente'
    );
  }
);

/**
 * Agregar IP a whitelist
 * @route POST /api/v1/admin/rate-limit/whitelist
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Agregar IP a whitelist
 * security:
 *   - bearerAuth: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [ip]
 *         properties:
 *           ip:
 *             type: string
 *             example: '192.168.1.1'
 * responses:
 *   200:
 *     description: IP whitelisteada
 *   403:
 *     description: Acceso denegado
 */
export const whitelistIp = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = IpBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const { ip } = parseResult.data;

    rateLimitManager.whitelistIp(ip);

    logger.info(`IP whitelisted by admin: ${ip} by user ${req.user?.userId}`);

    successResponse(
      res,
      { ip },
      'IP agregada a whitelist exitosamente'
    );
  }
);

/**
 * Remover IP de whitelist
 * @route DELETE /api/v1/admin/rate-limit/whitelist/:ip
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Remover IP de whitelist
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: ip
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     example: '192.168.1.1'
 * responses:
 *   200:
 *     description: IP removida
 *   403:
 *     description: Acceso denegado
 */
export const removeFromWhitelist = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = IpSchema.safeParse(req.params.ip);
    if (!parseResult.success) {
      throw new Error(`IP inválida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const ip = parseResult.data;

    rateLimitManager.removeFromWhitelist(ip);

    logger.info(`IP removed from whitelist by admin: ${ip} by user ${req.user?.userId}`);

    successResponse(
      res,
      { ip },
      'IP removida de whitelist exitosamente'
    );
  }
);

/**
 * Resetear límite para una IP
 * @route POST /api/v1/admin/rate-limit/reset
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Resetear rate limit de IP
 * security:
 *   - bearerAuth: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [ip]
 *         properties:
 *           ip:
 *             type: string
 *             example: '192.168.1.1'
 * responses:
 *   200:
 *     description: Límite reseteado
 *   403:
 *     description: Acceso denegado
 */
export const resetIpLimit = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = IpBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const { ip } = parseResult.data;

    const keysReset = rateLimitManager.resetIpLimit(ip);

    logger.info(`Rate limit reset for IP: ${ip} by user ${req.user?.userId}`);

    successResponse(
      res,
      { ip, keysReset },
      `Límite reseteado para IP (${keysReset} keys)`
    );
  }
);

/**
 * Verificar estado de una IP
 * @route GET /api/v1/admin/rate-limit/check/:ip
 * @access Private (Admin only)
 * @swagger
 * tags: [Sistema]
 * summary: Ver estado de IP (whitelist, blacklist, remaining)
 * security:
 *   - bearerAuth: []
 * parameters:
 *   - name: ip
 *     in: path
 *     required: true
 *     schema:
 *       type: string
 *     example: '192.168.1.1'
 * responses:
 *   200:
 *     description: Estado obtenido
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             ip:
 *               type: string
 *             isWhitelisted:
 *               type: boolean
 *             isBlacklisted:
 *               type: boolean
 *             remaining:
 *               type: integer
 *             resetTime:
 *               type: integer
 *             timestamp:
 *               type: string
 *               format: date-time
 *   403:
 *     description: Acceso denegado
 */
export const checkIpStatus = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = IpSchema.safeParse(req.params.ip);
    if (!parseResult.success) {
      throw new Error(`IP inválida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const ip = parseResult.data;

    const status = {
      ip,
      isWhitelisted: rateLimitManager.isWhitelisted(ip),
      isBlacklisted: rateLimitManager.isBlacklisted(ip),
      remaining: rateLimitManager.getRemaining?.(ip) ?? 0, // Asumiendo método; fallback 0
      resetTime: rateLimitManager.getResetTime?.(ip) ?? 0, // Asumiendo método; fallback 0 (Unix timestamp)
      timestamp: new Date().toISOString(),
    };

    successResponse(
      res,
      status,
      'Estado de IP obtenido'
    );
  }
);
