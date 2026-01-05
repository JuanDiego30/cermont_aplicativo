/**
 * @mapper AlertaMapper
 *
 * Mapea entre Domain Entity y DTOs
 * Pure functions sin efectos secundarios
 */

import { Alerta } from "../../domain/entities/alerta.entity";
import { AlertaResponseDto } from "../dto/alerta-response.dto";

export class AlertaMapper {
  /**
   * Domain Entity → Response DTO
   */
  public static toResponseDto(alerta: Alerta): AlertaResponseDto {
    return {
      id: alerta.getId().getValue(),
      tipo: alerta.getTipo().getValue(),
      prioridad: alerta.getPrioridad().getValue(),
      titulo: alerta.getTitulo(),
      mensaje: alerta.getMensaje(),
      estado: alerta.getEstado().getValue(),
      canales: alerta.getCanales().map((c) => c.getValue()),
      enviadaEn: alerta.getEnviadaEn(),
      leidaEn: alerta.getLeidaEn(),
      intentosEnvio: alerta.getIntentosEnvio(),
      createdAt: alerta.getCreatedAt(),
      updatedAt: alerta.getUpdatedAt(),
    };
  }

  /**
   * Domain Entity → Persistence (Prisma)
   */
  public static toPersistence(alerta: Alerta): any {
    return alerta.toPersistence();
  }

  /**
   * Array de Domain Entities → Array de Response DTOs
   */
  public static toResponseDtoArray(alertas: Alerta[]): AlertaResponseDto[] {
    return alertas.map((alerta) => this.toResponseDto(alerta));
  }
}
