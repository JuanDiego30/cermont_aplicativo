/**
 * @decorator SkipThrottle
 *
 * Decorador para excluir endpoints del rate limiting.
 * 
 * Uso:
 * @SkipThrottle()
 * @Get('health')
 * healthCheck() { ... }
 *
 * También se puede usar a nivel de controller para excluir todas las rutas.
 */
export { SkipThrottle, Throttle } from '@nestjs/throttler';

// Re-exportar para uso centralizado
// @SkipThrottle() - Desactiva rate limiting para el endpoint/controller
// @Throttle({ default: { limit: 3, ttl: 60000 } }) - Personaliza límites para endpoint específico
