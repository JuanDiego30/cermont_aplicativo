/**
 * @module Common Services
 * @description Exportación de servicios comunes
 *
 * Nota: Los servicios se han reorganizado:
 * - BaseService se ha consolidado en src/shared/base/base.service
 * - LoggerService se ha consolidado en src/shared/logging/logger.service
 * @deprecated Use @/shared/base/base.service or @/shared/logging/logger.service instead
 */

export { LoggerService } from '../../shared/logging/logger.service';
export { BaseService, PaginatedResult, buildPaginatedResult } from '../base/base.service';
