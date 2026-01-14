/**
 * Use Case: ReintentarEnvioUseCase
 *
 * Reintenta envío de alertas fallidas (ejecutado por cron job)
 */

import { Injectable, Inject, Logger } from "@nestjs/common";
import { NotificationQueueService } from "../../infrastructure/queue/notification-queue.service";
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from "../../domain/repositories/alerta.repository.interface";

@Injectable()
export class ReintentarEnvioUseCase {
  private readonly logger = new Logger(ReintentarEnvioUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
    @Inject("NotificationQueueService")
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  async execute(): Promise<{ reintentadas: number }> {
    this.logger.log("Iniciando reintento de alertas fallidas");

    // Obtener alertas fallidas con intentos < 3
    const alertasFallidas =
      await this.alertaRepository.findFallidasParaReintentar();

    let reintentadas = 0;

    for (const alerta of alertasFallidas) {
      try {
        // Incrementar intentos
        alerta.incrementarIntentos();

        // Guardar
        await this.alertaRepository.save(alerta);

        // Encolar para reintento
        await this.notificationQueue.enqueue({
          alertaId: alerta.getId().getValue(),
          canales: alerta.getCanalesExternos().map((c) => c.getValue()),
          isRetry: true,
        });

        reintentadas++;
        this.logger.debug(
          `Alerta ${alerta.getId().getValue()} encolada para reintento`,
        );
      } catch (error) {
        // Log error pero continuar con siguiente alerta
        this.logger.error(
          `Error reintentando alerta ${alerta.getId().getValue()}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(`Reintento completado: ${reintentadas} alertas encoladas`);

    return { reintentadas };
  }
}
