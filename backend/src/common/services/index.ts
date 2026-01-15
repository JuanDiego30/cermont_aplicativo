/**
 * @module Common Services
 * @description Exportación de servicios comunes
 *
 * Nota: Los servicios se han reorganizado:
 * - BaseService se ha consolidado en src/common/base/base.service
 * - LoggerService se ha consolidado en src/lib/logging/logger.service
 * @deprecated Use @/common/base/base.service or @/lib/logging/logger.service instead
 */

export { BaseService, PaginatedResult, buildPaginatedResult } from "../base/base.service";
export { LoggerService } from "../../lib/logging/logger.service";
