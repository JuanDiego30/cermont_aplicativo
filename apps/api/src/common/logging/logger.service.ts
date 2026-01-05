/**
 * @file logger.service.ts
 * @description Re-export del LoggerService canónico.
 *
 * Motivo: existían múltiples implementaciones de LoggerService.
 * Para mantener compatibilidad con imports legacy (common/logging),
 * este archivo re-exporta la implementación única en src/lib/logging.
 */

export { LoggerService } from "../../lib/logging/logger.service";
