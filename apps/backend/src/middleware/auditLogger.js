import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware para auditar automáticamente operaciones en rutas
 * Uso: router.post('/orders', auth, auditLogger('CREATE', 'Order'), controller.create)
 */
export const auditLogger = (action, resource) => {
  return asyncHandler(async (req, res, next) => {
    // Guardar referencia al método original de res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para interceptar la respuesta
    res.json = function(body) {

      // Crear log de auditoría solo si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          userId: req.user?._id,
          userEmail: req.user?.email || 'anonymous',
          userRole: req.user?.rol,
          action,
          resource,
          resourceId: body?.data?._id || body?._id || req.params?.id,
          changes: {
            before: req.auditBefore, // Puede setearse en controladores antes de update/delete
            after: body?.data || body
          },
          description: generateDescription(action, resource, req),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          method: req.method,
          endpoint: req.originalUrl,
          status: 'SUCCESS',
          severity: determineSeverity(action, resource)
        }).catch(err => console.error('[AuditLogger] Error:', err.message));
      }

      // Llamar al método original
      return originalJson(body);
    };

    next();
  });
};

/**
 * Función helper para crear logs de auditoría manualmente
 * Uso en controladores: await createAuditLog({ ... })
 */
export const createAuditLog = async (data) => {
  try {
    await AuditLog.create({
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    // No lanzar error para no interrumpir flujo principal
    console.error('[AuditLog] Error guardando log:', error.message);
  }
};

/**
 * Middleware para loggear intentos de acceso denegado
 * Usar en middleware authorize() cuando falla la autorización
 */
export const logAccessDenied = asyncHandler(async (req, res) => {
  await createAuditLog({
    userId: req.user?._id,
    userEmail: req.user?.email || 'anonymous',
    userRole: req.user?.rol,
    action: 'PERMISSION_DENIED',
    resource: extractResourceFromUrl(req.originalUrl),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    method: req.method,
    endpoint: req.originalUrl,
    status: 'DENIED',
    severity: 'HIGH',
    errorMessage: `Acceso denegado a ${req.method} ${req.originalUrl}`
  });

  res.status(403).json({
    success: false,
    error: {
      message: 'No tienes permisos para realizar esta acción',
      code: 'PERMISSION_DENIED'
    }
  });
});

/**
 * Middleware para loggear intentos de login fallidos
 */
export const logLoginFailed = async (email, ipAddress, userAgent, reason) => {
  await createAuditLog({
    userId: null,
    userEmail: email || 'unknown',
    action: 'LOGIN_FAILED',
    resource: 'Auth',
    ipAddress,
    userAgent,
    method: 'POST',
    endpoint: '/api/auth/login',
    status: 'FAILURE',
    severity: 'MEDIUM',
    errorMessage: reason
  });
};

// ========================================
// FUNCIONES HELPER
// ========================================

/**
 * Determinar severidad según acción y recurso
 */
const determineSeverity = (action, resource) => {
  // Severidad CRÍTICA
  if (action === 'DELETE' && ['User', 'Order', 'WorkPlan'].includes(resource)) {
    return 'CRITICAL';
  }
  if (action === 'ROLE_CHANGE' || action === 'TOKEN_REVOKED') {
    return 'CRITICAL';
  }

  // Severidad ALTA
  if (action === 'DELETE' || action === 'PASSWORD_CHANGE') {
    return 'HIGH';
  }
  if (action === 'LOGIN_FAILED' || action === 'PERMISSION_DENIED') {
    return 'HIGH';
  }

  // Severidad MEDIA
  if (action === 'UPDATE' && ['User', 'Order'].includes(resource)) {
    return 'MEDIUM';
  }
  if (action === 'CREATE' && resource === 'User') {
    return 'MEDIUM';
  }

  // Severidad BAJA (por defecto)
  return 'LOW';
};

/**
 * Generar descripción legible de la acción
 */
const generateDescription = (action, resource, req) => {
  const userName = req.user?.nombre || req.user?.email || 'Usuario';
  const resourceName = resource;
  const resourceId = req.params?.id || 'nuevo';

  const descriptions = {
    CREATE: `${userName} creó ${resourceName} (ID: ${resourceId})`,
    UPDATE: `${userName} actualizó ${resourceName} (ID: ${resourceId})`,
    DELETE: `${userName} eliminó ${resourceName} (ID: ${resourceId})`,
    LOGIN: `${userName} inició sesión`,
    LOGOUT: `${userName} cerró sesión`,
    PASSWORD_CHANGE: `${userName} cambió su contraseña`,
    ROLE_CHANGE: `${userName} modificó roles de usuario`,
    FILE_UPLOAD: `${userName} subió archivo en ${resourceName}`,
    FILE_DELETE: `${userName} eliminó archivo de ${resourceName}`
  };

  return descriptions[action] || `${userName} realizó ${action} en ${resourceName}`;
};

/**
 * Extraer nombre de recurso desde URL
 */
const extractResourceFromUrl = (url) => {
  const match = url.match(/\/api\/([^\/]+)/);
  if (match && match[1]) {
    const resourceMap = {
      'users': 'User',
      'orders': 'Order',
      'workplans': 'WorkPlan',
      'toolkits': 'ToolKit',
      'reports': 'Report',
      'auth': 'Auth'
    };
    return resourceMap[match[1]] || 'Unknown';
  }
  return 'Unknown';
};

export default auditLogger;