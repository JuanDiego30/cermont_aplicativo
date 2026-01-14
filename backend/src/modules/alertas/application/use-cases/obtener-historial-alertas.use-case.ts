/**
 * Use Case: ObtenerHistorialAlertasUseCase
 *
 * Obtiene historial paginado de alertas del usuario actual
 */

import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from "../../domain/repositories/alerta.repository.interface";
import { HistorialQueryDto } from "../dto/historial-query.dto";
import { PaginatedAlertasResponseDto } from "../dto/alerta-response.dto";
import { AlertaMapper } from "../mappers/alerta.mapper";

@Injectable()
export class ObtenerHistorialAlertasUseCase {
  private readonly logger = new Logger(ObtenerHistorialAlertasUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
  ) {}

  async execute(
    usuarioId: string,
    query: HistorialQueryDto,
  ): Promise<PaginatedAlertasResponseDto> {
    // Validar paginación
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    // Obtener alertas del repositorio
    const result = await this.alertaRepository.findHistorial({
      usuarioId,
      page,
      limit,
      tipo: query.tipo,
      estado: query.estado,
      prioridad: query.prioridad,
      soloNoLeidas: query.soloNoLeidas,
    });

    // Mapear a DTOs
    const items = AlertaMapper.toResponseDtoArray(result.items);

    return {
      items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
