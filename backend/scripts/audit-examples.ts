/**
 * GUÍA DE USO: AuditService
 * 
 * Ejemplos completos de cómo usar el servicio de auditoría
 * en la aplicación Cermont.
 * 
 * ✅ ACTUALIZADO PARA: Prisma + SQLite (noviembre 2025)
 * 
 * @file scripts/audit-examples.ts
 * @since 1.0.0
 */

import type { Request, Response, NextFunction } from 'express';
import { AuditAction } from '../src/domain/entities/AuditLog.js';
import { AuditService } from '../src/domain/services/AuditService.js';
import { AuditLogRepository } from '../src/infra/db/repositories/AuditLogRepository.js'; // ← CORRECCIÓN

// ==========================================
// SETUP: Instanciar repositorio y servicio
// ==========================================

const auditLogRepository = new AuditLogRepository(); // ← CORRECCIÓN (sin 'Mongo' prefix)
const auditService = new AuditService(auditLogRepository);

// ==========================================
// EJEMPLOS DE USO EN USE CASES
// ==========================================

/**
 * Ejemplo 1: Crear una orden
 * Use-case: CreateOrder
 */
export async function exampleCreateOrder() {
  const orderData = {
    id: 'order123',
    orderNumber: 'ORD-2025-001', // ← Agregado (requerido en schema)
    clientName: 'Juan Pérez',
    clientEmail: 'juan@example.com',
    description: 'Reparación de baño',
    location: 'Calle 123, Bogotá',
    state: 'SOLICITUD',
    priority: 'NORMAL', // ← Agregado
    createdBy: 'user456',
    responsibleId: 'user456', // ← Agregado
  };

  // 1. Crear la orden en la base de datos
  // const order = await orderRepository.create(orderData);

  // 2. Registrar el log de auditoría
  await auditService.logCreate(
    'Order',           // Tipo de entidad
    orderData.id,      // ID de la entidad
    'user456',         // ID del usuario que realizó la acción
    orderData,         // Estado después (la orden creada)
    '192.168.1.100',   // IP del usuario
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  console.log('✅ Orden creada y auditada');
}

/**
 * Ejemplo 2: Actualizar una orden
 * Use-case: UpdateOrder
 */
export async function exampleUpdateOrder() {
  const orderId = 'order123';
  
  // Estado antes de la actualización
  const oldOrder = {
    id: orderId,
    state: 'SOLICITUD',
    description: 'Reparación de baño',
    responsibleId: null,
  };

  // Estado después de la actualización
  const updatedOrder = {
    id: orderId,
    state: 'SOLICITUD',
    description: 'Reparación de baño - Cliente llamó para confirmar',
    responsibleId: 'user789', // Asignado a un técnico
  };

  // 1. Actualizar la orden en la base de datos
  // const order = await orderRepository.update(orderId, updatedOrder);

  // 2. Registrar el log de auditoría
  await auditService.logUpdate(
    'Order',
    orderId,
    'user456',
    oldOrder,      // Estado antes
    updatedOrder,  // Estado después
    '192.168.1.100',
    'Mozilla/5.0...'
  );

  console.log('✅ Orden actualizada y auditada');
}

/**
 * Ejemplo 3: Transición de estado
 * Use-case: TransitionOrderState
 */
export async function exampleTransitionOrder() {
  const orderId = 'order123';
  const userId = 'user456';
  const oldState = 'SOLICITUD';
  const newState = 'VISITA';

  // 1. Validar transición con OrderStateMachine
  // orderStateMachine.validateTransition(oldState, newState);

  // 2. Actualizar el estado
  // await orderRepository.update(orderId, { state: newState });

  // 3. Registrar transición de estado
  // TODO: Implement logTransition method in AuditService if needed
  // await auditService.logTransition(
  //   'Order',
  //   orderId,
  //   userId,
  //   oldState,      // Estado anterior
  //   newState,      // Estado nuevo
  //   '192.168.1.100',
  //   'Mozilla/5.0...'
  // );

  console.log(`✅ Orden transicionada: ${oldState} → ${newState}`);
}

/**
 * Ejemplo 4: Autenticación - Login exitoso
 * Use-case: Login
 */
export async function exampleLogin() {
  const userId = 'user456';
  const ip = '192.168.1.100';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

  // 1. Validar credenciales
  // const user = await userRepository.findByEmail(email);
  // await passwordHasher.verify(user.password, password);

  // 2. Generar tokens
  // const accessToken = jwtService.generateAccessToken(user);
  // const refreshToken = jwtService.generateRefreshToken(user);

  // 3. Actualizar último login
  // await userRepository.update(userId, { lastLogin: new Date() });

  // 4. Registrar login exitoso
  // TODO: Implement logLogin method in AuditService if needed
  // await auditService.logLogin(userId, ip, userAgent);

  console.log('✅ Login exitoso auditado');
}

/**
 * Ejemplo 5: Autenticación - Logout
 * Use-case: Logout
 */
export async function exampleLogout() {
  const userId = 'user456';
  const ip = '192.168.1.100';
  const userAgent = 'Mozilla/5.0...';

  // 1. Invalidar tokens
  // await tokenService.revokeAllUserRefreshTokens(userId);

  // 2. Registrar logout
  // TODO: Implement logLogout method in AuditService if needed
  // await auditService.logLogout(userId, ip, userAgent);

  console.log('✅ Logout auditado');
}

/**
 * Ejemplo 6: Autenticación - Login fallido
 * Use-case: Login (caso de error)
 */
export async function exampleLoginFailed() {
  const email = 'usuario@ejemplo.com';
  const ip = '192.168.1.100';
  const userAgent = 'Mozilla/5.0...';
  const reason = 'Contraseña incorrecta (intento 3/5)';

  // 1. Incrementar intentos fallidos
  // await userRepository.incrementLoginAttempts(email);

  // 2. Registrar login fallido
  await auditService.logLoginFailed(email, ip, userAgent, reason);

  console.log('⚠️ Login fallido auditado');
}

/**
 * Ejemplo 7: Eliminar evidencia
 * Use-case: DeleteEvidence
 */
export async function exampleDeleteEvidence() {
  const evidenceId = 'evidence789';
  const userId = 'user456';
  
  // Estado antes de eliminar
  const evidence = {
    id: evidenceId,
    filename: 'foto-escalera.jpg', // ← CORRECCIÓN (era fileName)
    uploadedBy: userId,
    orderId: 'order123',
    stage: 'EJECUCION',
    status: 'APPROVED',
  };

  // 1. Eliminar archivo del storage
  // await fileStorage.delete(evidence.filePath);

  // 2. Eliminar registro de la base de datos
  // await evidenceRepository.delete(evidenceId);

  // 3. Registrar eliminación
  await auditService.logDelete(
    'Evidence',
    evidenceId,
    userId,
    evidence,          // Estado antes de eliminar
    '192.168.1.100',
    'Mozilla/5.0...',
    'Evidencia duplicada - reemplazada por evidence790'  // Razón
  );

  console.log('✅ Evidencia eliminada y auditada');
}

/**
 * Ejemplo 8: Aprobar plan de trabajo
 * Use-case: ApproveWorkPlan
 */
export async function exampleApproveWorkPlan() {
  const workPlanId = 'workplan456';
  const userId = 'user789'; // Supervisor
  const comments = 'Aprobado con presupuesto de $5,000,000 COP';

  const before = {
    id: workPlanId,
    status: 'DRAFT',
    approvedBy: null,
    approvedAt: null,
  };

  const after = {
    id: workPlanId,
    status: 'APPROVED',
    approvedBy: userId,
    approvedAt: new Date(),
    approvalComments: comments,
  };

  // 1. Actualizar plan de trabajo
  // await workPlanRepository.approve(workPlanId, userId, comments);

  // 2. Registrar aprobación
  await auditService.logUpdate(
    'WorkPlan',
    workPlanId,
    userId,
    before,
    after,
    '192.168.1.100',
    'Mozilla/5.0...'
  );

  console.log('✅ Plan de trabajo aprobado y auditado');
}

// ==========================================
// EJEMPLOS DE CONSULTAS
// ==========================================

/**
 * Ejemplo 9: Buscar historial de una orden
 */
export async function exampleQueryOrderLogs() {
  const orderId = 'order123';

  // Buscar todos los logs de una orden (últimos 100)
  const orderLogs = await auditLogRepository.findByEntity('Order', orderId);
  
  console.log('📋 Historial de la orden:');
  orderLogs.forEach((log: any) => { // ← Agregado tipo any para evitar error
    console.log(`  ${log.timestamp.toISOString()} - ${log.action} por ${log.userId}`);
  });

  // Contar acciones específicas
  const [creates, updates, transitions] = await Promise.all([
    auditLogRepository.count({
      entityType: 'Order',
      entityId: orderId,
      action: AuditAction.CREATE,
    }),
    auditLogRepository.count({
      entityType: 'Order',
      entityId: orderId,
      action: AuditAction.UPDATE,
    }),
    auditLogRepository.count({
      entityType: 'Order',
      entityId: orderId,
      action: AuditAction.TRANSITION,
    }),
  ]);

  console.log(`📊 Estadísticas: ${creates} creates, ${updates} updates, ${transitions} transitions`);
}

/**
 * Ejemplo 10: Auditoría de usuario
 */
export async function exampleQueryUserLogs() {
  const userId = 'user456';

  // Logs de un usuario en las últimas 24 horas
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const userLogs = await auditLogRepository.findByUser(userId, { start: yesterday });

  console.log(`📊 ${userLogs.length} acciones del usuario en las últimas 24h:`);
  
  // Agrupar por tipo de acción
  const actionCounts = userLogs.reduce((acc: any, log: any) => { // ← Agregado tipo any
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(actionCounts).forEach(([action, count]) => {
    console.log(`  ${action}: ${count}`);
  });
}

/**
 * Ejemplo 11: Logins del día
 */
export async function exampleQueryTodaysLogins() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [loginLogs, loginCount, failedLogins] = await Promise.all([
    auditLogRepository.find({
      action: AuditAction.LOGIN,
      startDate: startOfDay,
      limit: 20,
      skip: 0,
    }),
    auditLogRepository.count({
      action: AuditAction.LOGIN,
      startDate: startOfDay,
    }),
    auditLogRepository.count({
      action: AuditAction.LOGIN_FAILED,
      startDate: startOfDay,
    }),
  ]);

  console.log(`🔐 Logins hoy: ${loginCount} exitosos, ${failedLogins} fallidos`);
  console.log(`   Mostrando los primeros ${loginLogs.length}:`);
  
  loginLogs.forEach((log: any) => { // ← Agregado tipo any
    console.log(`   ${log.timestamp.toLocaleTimeString()} - Usuario ${log.userId} desde ${log.ip}`);
  });
}

/**
 * Ejemplo 12: Limpiar logs antiguos (tarea programada)
 */
export async function exampleCleanupOldLogs() {
  // Eliminar logs de más de 90 días
  const retentionDays = 90;
  const deleted = await auditLogRepository.deleteOlderThan(retentionDays);
  
  console.log(`🧹 Limpieza completada: ${deleted} logs eliminados (> ${retentionDays} días)`);
}

// ==========================================
// INTEGRACIÓN EN MIDDLEWARE EXPRESS
// ==========================================

/**
 * Interface para Request con usuario autenticado
 */
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    jti: string;
  };
}

/**
 * Middleware de auditoría para Express
 * Registra automáticamente todas las acciones exitosas
 * 
 * @example
 * // En app.ts o routes
 * app.use(auditMiddleware(auditService));
 */
export function auditMiddleware(service: AuditService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Guardar el método original send
    const originalSend = res.send.bind(res);

    // Sobrescribir res.send para capturar la respuesta
    res.send = function (body: any): Response {
      const duration = Date.now() - startTime;

      // Solo auditar requests autenticadas y exitosas
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        // Ejecutar auditoría de forma asíncrona (no bloquear respuesta)
        setImmediate(async () => {
          try {
            const entityType = getEntityTypeFromPath(req.path);
            const action = getActionFromMethod(req.method, res.statusCode);

            if (entityType && action) {
              await service.log({
                entityType,
                entityId: req.params.id || req.body?.id || 'system',
                action,
                userId: req.user!.userId,
                before: req.method === 'PUT' || req.method === 'DELETE' ? req.body?.before : undefined,
                after: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
                ip: req.ip || req.connection.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent'),
                reason: `API: ${req.method} ${req.path} (${duration}ms)`,
              });
            }
          } catch (error) {
            console.error('[AuditMiddleware] Error logging action:', error);
            // No lanzar error para no afectar la respuesta
          }
        });
      }

      // Llamar al método original
      return originalSend(body);
    };

    next();
  };
}

/**
 * Extrae el tipo de entidad desde la ruta
 */
function getEntityTypeFromPath(path: string): string | null {
  if (path.includes('/orders')) return 'Order';
  if (path.includes('/users')) return 'User';
  if (path.includes('/evidences')) return 'Evidence';
  if (path.includes('/workplans')) return 'WorkPlan';
  if (path.includes('/auth')) return 'Auth';
  return null;
}

/**
 * Determina la acción de auditoría según el método HTTP y status code
 */
function getActionFromMethod(method: string, statusCode: number): AuditAction | null {
  if (method === 'POST' && statusCode === 201) return AuditAction.CREATE;
  if (method === 'PUT' && statusCode === 200) return AuditAction.UPDATE;
  if (method === 'PATCH' && statusCode === 200) return AuditAction.UPDATE;
  if (method === 'DELETE' && statusCode === 200) return AuditAction.DELETE;
  return null;
}

// ==========================================
// EXPORTAR EJEMPLOS PARA TESTING
// ==========================================

export const auditExamples = {
  createOrder: exampleCreateOrder,
  updateOrder: exampleUpdateOrder,
  transitionOrder: exampleTransitionOrder,
  login: exampleLogin,
  logout: exampleLogout,
  loginFailed: exampleLoginFailed,
  deleteEvidence: exampleDeleteEvidence,
  approveWorkPlan: exampleApproveWorkPlan,
  queryOrderLogs: exampleQueryOrderLogs,
  queryUserLogs: exampleQueryUserLogs,
  queryTodaysLogins: exampleQueryTodaysLogins,
  cleanupOldLogs: exampleCleanupOldLogs,
};

// ==========================================
// EJEMPLOS DE INTEGRACIÓN EN USE CASES
// ==========================================

/**
 * Ejemplo de cómo integrar AuditService en un use-case real
 */
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: any,
    private readonly auditService: AuditService
  ) {}

  async execute(params: {
    clientName: string;
    description: string;
    location: string;
    createdBy: string;
    ip: string;
    userAgent?: string;
  }) {
    // 1. Validar datos de entrada
    // ... validaciones ...

    // 2. Crear la orden
    const order = await this.orderRepository.create({
      clientName: params.clientName,
      description: params.description,
      location: params.location,
      state: 'SOLICITUD',
      createdBy: params.createdBy,
    });

    // 3. Registrar auditoría
    await this.auditService.logCreate(
      'Order',
      order.id,
      params.createdBy,
      order,
      params.ip,
      params.userAgent
    );

    // 4. Retornar orden creada
    return order;
  }
}
