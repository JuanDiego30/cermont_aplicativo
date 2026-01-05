/**
 * @mapper PreferenciaMapper
 *
 * Mapea entre Domain Entity y DTOs
 */

import { PreferenciaAlerta } from "../../domain/entities/preferencia-alerta.entity";
import { PreferenciaResponseDto } from "../dto/preferencias-alerta.dto";

export class PreferenciaMapper {
  /**
   * Domain Entity → Response DTO
   */
  public static toResponseDto(
    preferencia: PreferenciaAlerta,
  ): PreferenciaResponseDto {
    return {
      id: preferencia.getId(),
      usuarioId: preferencia.getUsuarioId(),
      tipoAlerta: preferencia.getTipoAlerta().getValue(),
      canalesPreferidos: preferencia
        .getCanalesPreferidos()
        .map((c) => c.getValue()),
      noMolestar: preferencia.isNoMolestar(),
      horariosPermitidos: preferencia.getHorariosPermitidos(),
      createdAt: preferencia.getCreatedAt(),
      updatedAt: preferencia.getUpdatedAt(),
    };
  }

  /**
   * Domain Entity → Persistence (Prisma)
   */
  public static toPersistence(preferencia: PreferenciaAlerta): any {
    return preferencia.toPersistence();
  }

  /**
   * Array de Domain Entities → Array de Response DTOs
   */
  public static toResponseDtoArray(
    preferencias: PreferenciaAlerta[],
  ): PreferenciaResponseDto[] {
    return preferencias.map((p) => this.toResponseDto(p));
  }
}
