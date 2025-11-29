/**
 * Re-export del JwtService desde la capa de infraestructura
 * Este archivo existe para mantener compatibilidad con imports legacy
 */

export { jwtService, JwtService } from '../../infra/adapters/security/jwtService.js';
