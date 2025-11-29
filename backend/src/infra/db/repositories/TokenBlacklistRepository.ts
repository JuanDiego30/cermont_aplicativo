/**
 * Re-export para compatibilidad hacia atrás.
 * TokenBlacklist fue renombrado a RevokedToken.
 */
export { 
  RevokedTokenRepository, 
  RevokedTokenRepository as TokenBlacklistRepository,
  revokedTokenRepository,
  tokenBlacklistRepository 
} from './RevokedTokenRepository.js';
