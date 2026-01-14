/**
 * @service NotificationQueueService
 *
 * Servicio de cola para procesamiento asíncrono de notificaciones
 * Usa BullMQ (open source) para gestión de jobs con Redis
 */

import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from "../../domain/repositories/alerta.repository.interface";
import { NotificationSenderFactory } from "../services/notification-factory";
import { PrismaService } from "../../../../prisma/prisma.service";
import { CanalNotificacion } from "../../domain/value-objects/canal-notificacion.vo";

// BullMQ types (se instalarán con npm install bullmq ioredis)
let Queue: any;
let Worker: any;
let QueueEvents: any;

try {
  // Intentar importar BullMQ si está instalado
  const bullmq = require("bullmq");
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
  QueueEvents = bullmq.QueueEvents;
} catch (error) {
  // Si no está instalado, usar implementación mock
  Logger.warn(
    "BullMQ no está instalado. Usando implementación mock. Instalar con: npm install bullmq ioredis",
  );
}

@Injectable()
export class NotificationQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationQueueService.name);
  private queue: any;
  private worker: any;
  private queueEvents: any;
  private useBullMQ: boolean = false;

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
    private readonly notificationFactory: NotificationSenderFactory,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.initializeQueue();
      this.logger.log("NotificationQueueService inicializado");
    } catch (error) {
      this.logger.error("Error inicializando NotificationQueueService", error);
      // No lanzar error para permitir que la app inicie sin Redis
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  private initializeQueue(): void {
    // Verificar si BullMQ está disponible
    if (Queue && Worker && QueueEvents) {
      this.useBullMQ = true;
      this.initializeBullMQ();
    } else {
      this.useBullMQ = false;
      this.initializeMockQueue();
    }
  }

  private initializeBullMQ(): void {
    try {
      const redisConfig = {
        host: this.config.get("REDIS_HOST") || "localhost",
        port: parseInt(this.config.get("REDIS_PORT") || "6379", 10),
        password: this.config.get("REDIS_PASSWORD") || undefined,
        maxRetriesPerRequest: null, // Requerido para BullMQ
      };

      // Cola para envío de alertas
      this.queue = new Queue("notifications", { connection: redisConfig });

      // Worker que procesa los jobs
      this.worker = new Worker("notifications", this.processJob.bind(this), {
        connection: redisConfig,
        concurrency: 5, // Procesar 5 jobs simultáneamente
        removeOnComplete: {
          age: 3600, // Mantener jobs completados por 1 hora
          count: 1000, // Máximo 1000 jobs completados
        },
        removeOnFail: {
          age: 86400, // Mantener jobs fallidos por 24 horas
        },
      });

      // Escuchar eventos de la cola
      this.queueEvents = new QueueEvents("notifications", {
        connection: redisConfig,
      });

      this.setupEventListeners();
      this.logger.log("✅ BullMQ inicializado correctamente");
    } catch (error) {
      this.logger.error(
        "Error inicializando BullMQ, usando implementación mock",
        error,
      );
      this.initializeMockQueue();
    }
  }

  private initializeMockQueue(): void {
    this.logger.warn(
      "NotificationQueueService usando implementación mock. Para producción, instalar: npm install bullmq ioredis",
    );

    // Mock implementation - procesa inmediatamente
    this.queue = {
      add: async (name: string, payload: any, options?: any) => {
        this.logger.log(`[Queue Mock] Job encolado: ${name}`, payload);
        // Procesar inmediatamente en modo mock
        try {
          await this.processJob({ data: payload });
        } catch (error) {
          this.logger.error("[Queue Mock] Error procesando job:", error);
        }
      },
      getJobCounts: async () => ({
        wait: 0,
        active: 0,
        completed: 0,
        failed: 0,
      }),
      clean: async () => {},
      close: async () => {},
    };
  }

  /**
   * Encolar una alerta para envío
   */
  async enqueue(payload: {
    alertaId: string;
    canales: string[];
    isRetry?: boolean;
  }): Promise<void> {
    try {
      if (this.useBullMQ) {
        await this.queue.add("send-notification", payload, {
          attempts: payload.isRetry ? 3 : 1,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        });
      } else {
        // Mock: procesar inmediatamente
        await this.queue.add("send-notification", payload);
      }

      this.logger.debug(`Alerta ${payload.alertaId} encolada para envío`, {
        canales: payload.canales,
        isRetry: payload.isRetry,
        useBullMQ: this.useBullMQ,
      });
    } catch (error) {
      this.logger.error(`Error encolando alerta ${payload.alertaId}:`, error);
      throw error;
    }
  }

  /**
   * Procesar job de envío
   */
  private async processJob(job: any): Promise<void> {
    const { alertaId, canales, isRetry } = job.data;

    this.logger.log(`[NotificationQueue] Procesando alerta ${alertaId}`, {
      canales,
      isRetry,
    });

    try {
      // Obtener alerta
      const alerta = await this.alertaRepository.findById(alertaId);
      if (!alerta) {
        throw new Error(`Alerta no encontrada: ${alertaId}`);
      }

      // Obtener usuario destinatario
      const usuario = await this.prisma.user.findUnique({
        where: { id: alerta.getDestinatarioId() },
        select: {
          id: true,
          email: true,
          phone: true,
        },
      });

      if (!usuario) {
        throw new Error(`Usuario no encontrado: ${alerta.getDestinatarioId()}`);
      }

      // Agregar fcmToken si existe en el futuro
      const destinatario = {
        ...usuario,
        fcmToken: (usuario as any).fcmToken || null,
      };

      // Enviar por cada canal
      const resultados: Array<{
        canal: string;
        exito: boolean;
        error?: string;
      }> = [];

      for (const canalStr of canales) {
        try {
          const canal = CanalNotificacion.create(canalStr);
          const sender = this.notificationFactory.getSender(canal.getValue());
          await sender.send(alerta, destinatario);

          // Marcar como enviada
          await this.alertaRepository.marcarComoEnviada(
            alertaId,
            canal.getValue(),
          );

          resultados.push({ canal: canal.getValue(), exito: true });
          this.logger.log(
            `✅ Alerta ${alertaId} enviada por ${canal.getValue()}`,
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          resultados.push({ canal: canalStr, exito: false, error: errorMsg });
          this.logger.error(
            `❌ Error enviando alerta ${alertaId} por ${canalStr}:`,
            errorMsg,
          );

          // Si es el último canal y falló, marcar como fallida
          if (canales.indexOf(canalStr) === canales.length - 1) {
            alerta.marcarComoFallida(errorMsg);
            await this.alertaRepository.save(alerta);
          }
        }
      }

      // Si todos los canales fallaron, marcar como fallida
      if (resultados.every((r) => !r.exito)) {
        alerta.marcarComoFallida("Todos los canales fallaron");
        await this.alertaRepository.save(alerta);
      }
    } catch (error) {
      this.logger.error(
        `[NotificationQueue] Error procesando ${alertaId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Setup de listeners de eventos (solo con BullMQ real)
   */
  private setupEventListeners(): void {
    if (!this.queueEvents) {
      return;
    }

    this.queueEvents.on("completed", ({ jobId }: any) => {
      this.logger.debug(`✅ Job ${jobId} completado`);
    });

    this.queueEvents.on("failed", ({ jobId, failedReason }: any) => {
      this.logger.error(`❌ Job ${jobId} falló: ${failedReason}`);
    });

    this.queueEvents.on("error", (error: any) => {
      this.logger.error("❌ Error en NotificationQueue:", error);
    });

    this.worker.on("completed", (job: any) => {
      this.logger.debug(`✅ Job ${job.id} completado exitosamente`);
    });

    this.worker.on("failed", (job: any, err: Error) => {
      this.logger.error(`❌ Job ${job?.id} falló:`, err.message);
    });
  }

  /**
   * Obtener stats de la cola
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      if (this.useBullMQ && this.queue) {
        const counts = await this.queue.getJobCounts();
        return {
          pending: counts.wait || 0,
          processing: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
        };
      } else {
        return await this.queue.getJobCounts();
      }
    } catch (error) {
      this.logger.error("Error obteniendo stats de la cola:", error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }

  /**
   * Limpiar queue (admin only)
   */
  async clearQueue(): Promise<void> {
    try {
      if (this.useBullMQ && this.queue) {
        await this.queue.clean(0, "completed");
        await this.queue.clean(0, "failed");
        this.logger.log("Cola limpiada exitosamente");
      } else {
        await this.queue.clean();
      }
    } catch (error) {
      this.logger.error("Error limpiando cola:", error);
      throw error;
    }
  }

  /**
   * Cerrar conexiones
   */
  private async close(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.close();
      }
      if (this.queue) {
        await this.queue.close();
      }
      if (this.queueEvents) {
        await this.queueEvents.close();
      }
      this.logger.log("NotificationQueueService cerrado");
    } catch (error) {
      this.logger.error("Error cerrando NotificationQueueService:", error);
    }
  }
}
