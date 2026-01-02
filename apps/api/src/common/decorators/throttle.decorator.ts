/**
 * Custom throttle decorators para Cermont API
 * 
 * Proporciona rate limiting configurable con presets para casos de uso comunes.
 * Basado en @nestjs/throttler con configuraciones específicas del dominio.
 * 
 * @module common/decorators
 */

import { SetMetadata, applyDecorators } from '@nestjs/common';
import { SkipThrottle as NestSkipThrottle, Throttle as NestThrottle } from '@nestjs/throttler';

/**
 * Opciones de configuración para rate limiting
 */
export interface ThrottleOptions {
  /** Número máximo de requests permitidos */
  limit: number;
  /** Ventana de tiempo en milisegundos (TTL) */
  ttl: number;
  /** Nombre descriptivo para logging */
  name?: string;
}

/**
 * Presets de throttle para casos de uso comunes en Cermont
 */
export const THROTTLE_PRESETS = {
  /**
   * Rate limit estricto para autenticación
   * Previene ataques de fuerza bruta
   * 
   * @example 5 intentos cada 15 minutos
   */
  AUTH: {
    limit: 5,
    ttl: 15 * 60_000, // 15 minutos
    name: 'auth',
  } as ThrottleOptions,

  /**
   * Rate limit para endpoints públicos
   * Balance entre usabilidad y protección
   * 
   * @example 100 requests cada 15 minutos
   */
  PUBLIC: {
    limit: 100,
    ttl: 15 * 60_000, // 15 minutos
    name: 'public',
  } as ThrottleOptions,

  /**
   * Rate limit para operaciones de escritura
   * Previene spam y abuso de recursos
   * 
   * @example 30 requests por minuto
   */
  WRITE: {
    limit: 30,
    ttl: 60_000, // 1 minuto
    name: 'write',
  } as ThrottleOptions,

  /**
   * Rate limit para operaciones de lectura
   * Más permisivo que escritura
   * 
   * @example 200 requests por minuto
   */
  READ: {
    limit: 200,
    ttl: 60_000, // 1 minuto
    name: 'read',
  } as ThrottleOptions,

  /**
   * Rate limit para uploads de archivos
   * Previene saturación de almacenamiento
   * 
   * @example 10 uploads cada 5 minutos
   */
  UPLOAD: {
    limit: 10,
    ttl: 5 * 60_000, // 5 minutos
    name: 'upload',
  } as ThrottleOptions,

  /**
   * Rate limit para webhooks externos
   * Protege contra DoS de integraciones
   * 
   * @example 50 requests por minuto
   */
  WEBHOOK: {
    limit: 50,
    ttl: 60_000, // 1 minuto
    name: 'webhook',
  } as ThrottleOptions,
} as const;

/**
 * Metadata key para identificar throttle personalizado
 */
export const THROTTLE_METADATA_KEY = 'throttle_custom_config';

/**
 * Re-exportación del decorador nativo para skip throttle
 * 
 * @decorator SkipThrottle
 * @description Excluye un endpoint o controller completo del rate limiting
 * 
 * @example
 * // Excluir endpoint de health check
 * @Controller('health')
 * export class HealthController {
 *   @Get()
 *   @SkipThrottle()
 *   check() {
 *     return { status: 'ok' };
 *   }
 * }
 * 
 * @example
 * // Excluir todo el controller
 * @Controller('internal')
 * @SkipThrottle()
 * export class InternalController {
 *   // Todos los endpoints sin throttle
 * }
 */
export const SkipThrottle = NestSkipThrottle;

/**
 * Decorador personalizado para rate limiting con opciones tipadas
 * 
 * @decorator Throttle
 * @param options - Configuración de límites (puede usar presets o custom)
 * @returns Decorador aplicable a métodos o clases
 * 
 * @example
 * // Usando preset de autenticación
 * @Post('login')
 * @Throttle(THROTTLE_PRESETS.AUTH)
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 * 
 * @example
 * // Configuración personalizada
 * @Post('reports/generate')
 * @Throttle({ limit: 3, ttl: 300_000, name: 'report-generation' })
 * async generateReport(@Body() dto: GenerateReportDto) {
 *   return this.reportService.generate(dto);
 * }
 * 
 * @example
 * // Aplicar a todo el controller
 * @Controller('ordenes')
 * @Throttle(THROTTLE_PRESETS.WRITE)
 * export class OrdenesController {
 *   // Todos los endpoints heredan el límite
 * }
 */
export function Throttle(options: ThrottleOptions) {
  // Validar opciones
  validateThrottleOptions(options);

  return applyDecorators(
    NestThrottle({ default: { limit: options.limit, ttl: options.ttl } }),
    SetMetadata(THROTTLE_METADATA_KEY, options),
  );
}

/**
 * Decorador para autenticación con rate limit estricto
 * 
 * @decorator ThrottleAuth
 * @description Preset optimizado para endpoints de autenticación
 * Previene ataques de fuerza bruta (5 intentos/minuto)
 * 
 * @example
 * @Post('login')
 * @ThrottleAuth()
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 */
export function ThrottleAuth() {
  return Throttle(THROTTLE_PRESETS.AUTH);
}

/**
 * Decorador para endpoints públicos
 * 
 * @decorator ThrottlePublic
 * @description Rate limit moderado para APIs públicas (100 req/15min)
 * 
 * @example
 * @Get('ordenes')
 * @ThrottlePublic()
 * async findAll() {
 *   return this.ordenService.findAll();
 * }
 */
export function ThrottlePublic() {
  return Throttle(THROTTLE_PRESETS.PUBLIC);
}

/**
 * Decorador para operaciones de escritura
 * 
 * @decorator ThrottleWrite
 * @description Rate limit para CREATE/UPDATE/DELETE (30 req/min)
 * 
 * @example
 * @Post('ordenes')
 * @ThrottleWrite()
 * async create(@Body() dto: CreateOrdenDto) {
 *   return this.ordenService.create(dto);
 * }
 */
export function ThrottleWrite() {
  return Throttle(THROTTLE_PRESETS.WRITE);
}

/**
 * Decorador para operaciones de lectura
 * 
 * @decorator ThrottleRead
 * @description Rate limit permisivo para GET (200 req/min)
 * 
 * @example
 * @Get('ordenes/:id')
 * @ThrottleRead()
 * async findOne(@Param('id') id: string) {
 *   return this.ordenService.findOne(id);
 * }
 */
export function ThrottleRead() {
  return Throttle(THROTTLE_PRESETS.READ);
}

/**
 * Decorador para uploads de archivos
 * 
 * @decorator ThrottleUpload
 * @description Rate limit para uploads de evidencias/archivos (10 uploads/5min)
 * 
 * @example
 * @Post('evidencias/upload')
 * @ThrottleUpload()
 * @UseInterceptors(FileInterceptor('file'))
 * async uploadFile(@UploadedFile() file: Express.Multer.File) {
 *   return this.evidenciaService.upload(file);
 * }
 */
export function ThrottleUpload() {
  return Throttle(THROTTLE_PRESETS.UPLOAD);
}

/**
 * Decorador para webhooks externos
 * 
 * @decorator ThrottleWebhook
 * @description Rate limit para integraciones externas (50 req/min)
 * 
 * @example
 * @Post('webhooks/google-drive')
 * @ThrottleWebhook()
 * async handleDriveWebhook(@Body() payload: any) {
 *   return this.webhookService.processDrive(payload);
 * }
 */
export function ThrottleWebhook() {
  return Throttle(THROTTLE_PRESETS.WEBHOOK);
}

/**
 * Valida las opciones de throttle
 * 
 * @param options - Opciones a validar
 * @throws {Error} Si las opciones son inválidas
 */
function validateThrottleOptions(options: ThrottleOptions): void {
  if (!options) {
    throw new Error('Las opciones de throttle son requeridas');
  }

  if (!Number.isInteger(options.limit) || options.limit <= 0) {
    throw new Error(
      `El límite debe ser un número entero positivo. Recibido: ${options.limit}`,
    );
  }

  if (!Number.isInteger(options.ttl) || options.ttl <= 0) {
    throw new Error(
      `El TTL debe ser un número entero positivo en milisegundos. Recibido: ${options.ttl}`,
    );
  }

  // Validar que el TTL no sea excesivamente largo (más de 1 hora)
  const MAX_TTL = 60 * 60 * 1000; // 1 hora
  if (options.ttl > MAX_TTL) {
    throw new Error(
      `El TTL no debe exceder 1 hora (${MAX_TTL}ms). Recibido: ${options.ttl}ms`,
    );
  }
}

/**
 * Helper para crear configuración de throttle desde variables de entorno
 * 
 * @param prefix - Prefijo de las variables (ej: 'THROTTLE_AUTH')
 * @param defaults - Valores por defecto si no existen las variables
 * @returns Configuración de throttle
 * 
 * @example
 * // En app.module.ts
 * const authThrottle = createThrottleConfigFromEnv('THROTTLE_AUTH', THROTTLE_PRESETS.AUTH);
 */
export function createThrottleConfigFromEnv(
  prefix: string,
  defaults: ThrottleOptions,
): ThrottleOptions {
  const limit = parseInt(process.env[`${prefix}_LIMIT`] || String(defaults.limit), 10);
  const ttl = parseInt(process.env[`${prefix}_TTL`] || String(defaults.ttl), 10);
  const name = process.env[`${prefix}_NAME`] || defaults.name;

  const config: ThrottleOptions = { limit, ttl, name };

  // Validar configuración cargada
  validateThrottleOptions(config);

  return config;
}
