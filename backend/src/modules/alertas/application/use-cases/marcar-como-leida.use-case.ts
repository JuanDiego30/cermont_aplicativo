/**
 * Use Case: MarcarComoLeidaUseCase
 *
 * Marca una alerta como leída
 */

import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from "../../domain/repositories/alerta.repository.interface";

@Injectable()
export class MarcarComoLeidaUseCase {
  private readonly logger = new Logger(MarcarComoLeidaUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
  ) {}

  async execute(alertaId: string, usuarioId: string): Promise<void> {
    // Buscar alerta
    const alerta = await this.alertaRepository.findById(alertaId);
    if (!alerta) {
      throw new NotFoundException(`Alerta ${alertaId} no encontrada`);
    }

    // Validar que pertenece al usuario
    if (alerta.getDestinatarioId() !== usuarioId) {
      throw new ForbiddenException(
        "No tienes permiso para marcar esta alerta como leída",
      );
    }

    // Marcar como leída (validación de dominio ocurre aquí)
    alerta.marcarComoLeida();

    // Guardar
    await this.alertaRepository.save(alerta);

    this.logger.log(
      `Alerta ${alertaId} marcada como leída por usuario ${usuarioId}`,
    );
  }
}
