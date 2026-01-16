import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
// Cache type viene de cache-manager como peer dependency de @nestjs/cache-manager
// TypeScript lo resuelve automáticamente desde node_modules
import type { Cache } from "cache-manager";

/**
 * Servicio para invalidar caché cuando datos cambian
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  /**
   * Invalidar caché de dashboard cuando hay cambios
   */
  async invalidateDashboard(): Promise<void> {
    await Promise.all([
      this.cache.del("dashboard:stats"),
      this.cache.del("dashboard:metricas"),
      this.cache.del("dashboard:recent-orders"),
      this.cache.del("dashboard:overview"),
      this.cache.del("dashboard:kpis"),
      this.cache.del("dashboard:costs"),
      this.cache.del("dashboard:performance"),
    ]);
    this.logger.log("Caché de dashboard invalidado");
  }

  /**
   * Invalidar caché específico
   */
  async invalidateKey(key: string): Promise<void> {
    await this.cache.del(key);
    this.logger.log(`Caché "${key}" invalidado`);
  }

  /**
   * Limpiar TODO el caché
   */
  async clearAll(): Promise<void> {
    // Para cache-manager, intentar diferentes métodos
    try {
      if ((this.cache as any).store?.reset) {
        await (this.cache as any).store.reset();
      } else if ((this.cache as any).clear) {
        await (this.cache as any).clear();
      } else {
        this.logger.warn(
          "No se pudo resetear el caché completamente: método no disponible",
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo resetear el caché completamente: ${message}`,
      );
    }
    this.logger.log("TODO el caché fue limpiado");
  }
}
