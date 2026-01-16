/**
 * @useCase ListEvidenciasUseCase
 * @description Handles listing evidencias with filtering and pagination
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { IEvidenciaRepository, EVIDENCIA_REPOSITORY } from '../../domain/repositories';
import { EvidenciaMapper } from '../mappers';
import { ListEvidenciasQueryDto, ListEvidenciasResponse } from '../dto';

@Injectable()
export class ListEvidenciasUseCase {
  private readonly logger = new Logger(ListEvidenciasUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository
  ) {}

  async execute(query: ListEvidenciasQueryDto): Promise<ListEvidenciasResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;

    this.logger.log('Listing evidencias', { query, skip, limit });

    try {
      const [evidencias, total] = await Promise.all([
        this.repository.findMany({
          ordenId: query.ordenId,
          ejecucionId: query.ejecucionId,
          status: query.status,
          includeDeleted: query.includeDeleted,
          skip,
          take: limit,
        }),
        this.repository.count({
          ordenId: query.ordenId,
          ejecucionId: query.ejecucionId,
          status: query.status,
          includeDeleted: query.includeDeleted,
        }),
      ]);

      this.logger.log(`Found ${evidencias.length} of ${total} evidencias`);

      return {
        data: EvidenciaMapper.toResponseList(evidencias),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to list evidencias', {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
