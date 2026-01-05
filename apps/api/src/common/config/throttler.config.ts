/**
 * @module ThrottlerConfig
 *
 * Configuración de Rate Limiting para proteger contra ataques DDoS y brute force.
 *
 * Límites:
 * - Corto plazo (10s): 20 requests - Previene bursts
 * - Mediano plazo (1min): 100 requests - Uso normal
 * - Largo plazo (1h): 1000 requests - Límite diario por hora
 *
 * Uso: Importar en AppModule.
 */
import { ThrottlerModule, ThrottlerModuleOptions } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";

/**
 * Factory para crear configuración de throttler desde variables de entorno
 */
export const ThrottlerConfigFactory = {
  imports: [],
  inject: [ConfigService],
  useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
    throttlers: [
      {
        name: "short",
        ttl: 10000, // 10 segundos
        limit: config.get<number>("THROTTLE_SHORT_LIMIT") ?? 20,
      },
      {
        name: "medium",
        ttl: 60000, // 1 minuto
        limit: config.get<number>("THROTTLE_MEDIUM_LIMIT") ?? 100,
      },
      {
        name: "long",
        ttl: 3600000, // 1 hora
        limit: config.get<number>("THROTTLE_LONG_LIMIT") ?? 1000,
      },
    ],
    // Skip throttling para health checks
    skipIf: (context) => {
      const request = context.switchToHttp().getRequest();
      const path = request.url;
      return path.startsWith("/api/health");
    },
  }),
};

/**
 * Módulo de throttling pre-configurado
 */
export const ThrottlerConfigModule = ThrottlerModule.forRootAsync(
  ThrottlerConfigFactory,
);
