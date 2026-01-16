/**
 * @service OfflineSyncService
 *
 * Gestiona sincronización de datos entre modo offline y servidor.
 * Uso: Técnicos en campo sin conexión sincronizarán al reconectarse.
 * Integración: Se inyecta en EjecucionService, no modifica lógica existente.
 *
 * Principios:
 * - SRP: Solo gestiona sincronización offline
 * - DRY: Centraliza lógica de validación y reintentos
 * - Type-safe: Interfaces estrictas para todos los payloads
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IOfflinePayload,
  IOfflineChecklistItem,
  ISyncResult,
  ISyncError,
  ISyncMetrics,
} from '../interfaces/sync-state.interface';

@Injectable()
export class OfflineSyncService {
  private readonly logger = new Logger(OfflineSyncService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000;
  private readonly SCHEMA_VERSION = 1;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Construye estructura de checklist para modo offline.
   * - No requiere conexión a internet después de generarse
   * - Todos los items precargados localmente
   *
   * @param ejecucionId ID de la ejecución a preparar
   * @returns Payload estructurado para offline
   */
  async buildOfflineChecklist(ejecucionId: string): Promise<IOfflinePayload> {
    try {
      // Obtener ejecución con checklists completos
      const ejecucion = await this.prisma.ejecucion.findUnique({
        where: { id: ejecucionId },
        include: {
          orden: {
            select: {
              id: true,
              numero: true,
            },
          },
          checklists: {
            include: {
              items: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });

      if (!ejecucion) {
        throw new BadRequestException(`Ejecución ${ejecucionId} no encontrada`);
      }

      // Construir items planos para offline
      const items: IOfflineChecklistItem[] = [];
      let ordenGlobal = 0;

      for (const checklist of ejecucion.checklists) {
        for (const item of checklist.items) {
          items.push({
            id: item.id,
            nombre: item.nombre,
            estado: this.mapEstadoItem(item.estado, item.completado),
            completadoEn: item.completadoEn ?? undefined,
            observaciones: item.observaciones ?? undefined,
            fotosAdjuntas: [],
            checklistId: checklist.id,
            orden: ordenGlobal++,
          });
        }
      }

      const payload: IOfflinePayload = {
        ejecucionId,
        ordenId: ejecucion.orden.id,
        numeroOrden: ejecucion.orden.numero,
        items,
        timestamp: new Date(),
        deviceId: this.generateDeviceId(),
        schemaVersion: this.SCHEMA_VERSION,
      };

      this.logger.log(
        `✅ Checklist offline construido para ejecución ${ejecucionId}: ${items.length} items`
      );

      return payload;
    } catch (error) {
      this.logger.error(`❌ Error construyendo checklist offline`, error);
      throw error;
    }
  }

  /**
   * Sincroniza cambios realizados offline con el servidor.
   * - Reintentos automáticos si falla conexión
   * - Validación de integridad antes de persistir
   * - Auditoría de cambios
   *
   * @param payload Datos capturados offline
   * @param userId ID del usuario que sincroniza
   */
  async syncWhenOnline(payload: IOfflinePayload, userId: string): Promise<ISyncResult> {
    let retryCount = 0;
    const startTime = Date.now();
    const errors: ISyncError[] = [];

    while (retryCount < this.MAX_RETRIES) {
      try {
        // Paso 1: Validar integridad del payload
        await this.validateOfflineIntegrity(payload);

        // Paso 2: Procesar cada item en transacción
        const result = await this.prisma.$transaction(async tx => {
          let itemsActualizados = 0;

          for (const item of payload.items) {
            try {
              await tx.checklistItemEjecucion.update({
                where: { id: item.id },
                data: {
                  estado: item.estado,
                  completado: item.estado === 'completado',
                  completadoEn: item.completadoEn ? new Date(item.completadoEn) : null,
                  observaciones: item.observaciones,
                  completadoPorId: item.estado === 'completado' ? userId : null,
                },
              });
              itemsActualizados++;
            } catch (itemError) {
              errors.push({
                itemId: item.id,
                operation: 'UPDATE',
                entityType: 'CHECKLIST',
                message: itemError instanceof Error ? itemError.message : 'Error desconocido',
                code: 'ITEM_UPDATE_FAILED',
                retryCount,
                timestamp: new Date(),
                retryable: true,
              });
            }
          }

          // Paso 3: Actualizar estado de sincronización en ejecución
          await tx.ejecucion.update({
            where: { id: payload.ejecucionId },
            data: {
              sincronizado: true,
              ubicacionGPS: payload.ubicacionGPS ? JSON.stringify(payload.ubicacionGPS) : undefined,
              updatedAt: new Date(),
            },
          });

          return itemsActualizados;
        });

        // Paso 4: Registrar auditoría
        await this.prisma.auditLog.create({
          data: {
            entityType: 'Ejecucion',
            entityId: payload.ejecucionId,
            action: 'SYNC_OFFLINE',
            userId,
            changes: {
              itemsSincronizados: result,
              deviceId: payload.deviceId,
              timestamp: payload.timestamp,
              errores: errors.length,
            },
          },
        });

        const processingTime = Date.now() - startTime;

        this.logger.log(
          `✅ Sincronización exitosa para ejecución ${payload.ejecucionId}: ${result} items en ${processingTime}ms`
        );

        return {
          success: true,
          id: payload.ejecucionId,
          tipo: 'EJECUCION',
          mensaje: `Sincronización completada. ${result} items actualizados.`,
          processingTimeMs: processingTime,
        };
      } catch (error) {
        retryCount++;
        this.logger.warn(
          `⚠️ Intento ${retryCount}/${this.MAX_RETRIES} fallido: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`
        );

        if (retryCount < this.MAX_RETRIES) {
          // Backoff exponencial
          await this.delay(this.RETRY_DELAY_MS * Math.pow(2, retryCount - 1));
        }
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    const errorMessage = `Falló sincronización después de ${this.MAX_RETRIES} intentos`;
    this.logger.error(`❌ ${errorMessage}`);

    return {
      success: false,
      id: payload.ejecucionId,
      tipo: 'EJECUCION',
      mensaje: errorMessage,
    };
  }

  /**
   * Valida integridad de datos offline antes de sincronizar.
   * - Sin duplicados
   * - Todos los items existen en BD
   * - Estados válidos
   *
   * @throws BadRequestException si validación falla
   */
  async validateOfflineIntegrity(payload: IOfflinePayload): Promise<boolean> {
    // Validar duplicados
    const uniqueIds = new Set(payload.items.map(item => item.id));
    if (uniqueIds.size !== payload.items.length) {
      throw new BadRequestException('Payload contiene items duplicados');
    }

    // Validar estados
    const validStates = ['pendiente', 'completado', 'rechazado'];
    for (const item of payload.items) {
      if (!validStates.includes(item.estado)) {
        throw new BadRequestException(`Estado inválido: ${item.estado}`);
      }
    }

    // Validar que items existan en BD
    const itemsEnBD = await this.prisma.checklistItemEjecucion.findMany({
      where: {
        id: { in: payload.items.map(i => i.id) },
      },
      select: { id: true },
    });

    if (itemsEnBD.length !== payload.items.length) {
      const idsEnBD = new Set(itemsEnBD.map(i => i.id));
      const idsFaltantes = payload.items.filter(i => !idsEnBD.has(i.id)).map(i => i.id);

      throw new BadRequestException(`Items no encontrados en BD: ${idsFaltantes.join(', ')}`);
    }

    // Validar versión del schema
    if (payload.schemaVersion > this.SCHEMA_VERSION) {
      throw new BadRequestException(
        `Versión de schema ${payload.schemaVersion} no soportada. Máxima: ${this.SCHEMA_VERSION}`
      );
    }

    this.logger.debug(`✅ Validación de integridad pasó para ${payload.ejecucionId}`);

    return true;
  }

  /**
   * Obtiene métricas de sincronización para un usuario.
   */
  async getSyncMetrics(userId: string): Promise<ISyncMetrics> {
    // Obtener logs de sincronización del usuario
    const recentSyncs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: 'SYNC_OFFLINE',
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalSynced = recentSyncs.reduce((sum, log) => {
      const changes = log.changes as { itemsSincronizados?: number } | null;
      return sum + (changes?.itemsSincronizados ?? 0);
    }, 0);

    const totalFailed = recentSyncs.reduce((sum, log) => {
      const changes = log.changes as { errores?: number } | null;
      return sum + (changes?.errores ?? 0);
    }, 0);

    return {
      totalSynced,
      totalFailed,
      avgSyncTimeMs: 0, // TODO: Calcular desde logs
      lastSyncTimestamp: recentSyncs[0]?.createdAt ?? null,
      pendingByType: {},
      localStorageBytes: 0,
    };
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private mapEstadoItem(
    estado: string,
    completado: boolean
  ): 'pendiente' | 'completado' | 'rechazado' {
    if (completado) return 'completado';
    if (estado === 'rechazado') return 'rechazado';
    return 'pendiente';
  }

  private generateDeviceId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
