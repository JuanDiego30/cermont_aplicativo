/**
 * Índice de servicios
 * Centraliza todas las exportaciones de servicios para facilitar las importaciones
 */

// Servicios principales
export { default as userService } from './user.service.js';
export { default as orderService } from './order.service.js';
export { default as notificationService } from './notification.service.js';
export { default as statsService } from './stats.service.js';

// Servicios de soporte
export { default as authService } from './auth.service.js';
export { default as cacheService } from './cache.service.js';
export { default as emailService } from './email.service.js';
export { default as archivingService } from './archiving.service.js';

// Re-exportar funciones específicas si es necesario
export { sendEmail } from './email.service.js';
export { generateOrderNumber } from './order.service.js';
export { getInvolvedUsers } from './order.service.js';
