/**
 * Use Case: ListChecklistsUseCase
 *
 * Lista checklists con filtros y paginación
 */

import { Injectable, Inject, Logger } from "@nestjs/common";
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from "../../domain/repositories";
import { ListChecklistsQueryDto } from "../dto/list-checklists-query.dto";
import { PaginatedChecklistsResponseDto } from "../dto/checklist-response.dto";
import { ChecklistMapper } from "../mappers/checklist.mapper";

@Injectable()
export class ListChecklistsUseCase {
  private readonly logger = new Logger(ListChecklistsUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
  ) {}

  async execute(
    query: ListChecklistsQueryDto,
  ): Promise<PaginatedChecklistsResponseDto> {
    // Validar paginación
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    // Construir filtros
    const filters = {
      tipo: query.tipo,
      categoria: query.categoria,
      status: query.status,
      activo: query.activo,
      search: query.search,
      ordenId: query.ordenId,
      ejecucionId: query.ejecucionId,
    };

    // Obtener checklists del repositorio
    const result = await this.repository.list(filters, { page, limit });

    // Mapear a DTOs
    const items = ChecklistMapper.toResponseDtoArray(result.items);

    return {
      items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
