/**
 * Use Case: Obtener evidencias por orden
 * Resuelve: Listado paginado de evidencias filtradas por orden
 * 
 * @file backend/src/app/evidences/use-cases/GetEvidencesByOrder.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { Evidence } from '../../../domain/entities/Evidence.js';
import { EvidenceStatus } from '../../../domain/entities/Evidence.js';
import { logger } from '../../../shared/utils/logger.js';

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

const DEFAULT_SORT = {
  field: 'createdAt' as const,
  order: 'desc' as const,
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  INVALID_STATUS: (status: string) => `Estado inválido: ${status}`,
  INVALID_PAGE: 'El número de página debe ser mayor a 0',
  INVALID_LIMIT: `El límite debe estar entre 1 y ${PAGINATION_CONFIG.MAX_LIMIT}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GetEvidencesByOrderUseCase]',
} as const;

interface GetEvidencesByOrderInput {
  orderId: string;
  stage?: string;
  status?: EvidenceStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

interface GetEvidencesByOrderOutput {
  evidences: Evidence[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export class GetEvidencesByOrderUseCase {
  constructor(private readonly evidenceRepository: IEvidenceRepository) {}

  async execute(input: GetEvidencesByOrderInput): Promise<GetEvidencesByOrderOutput> {
    this.validateInput(input);

    const filters = this.buildFilters(input);
    const pagination = this.buildPagination(input);
    const sorting = this.buildSorting(input);

    const [evidences, total] = await Promise.all([
      this.evidenceRepository.findByFilters(filters, pagination, sorting),
      this.evidenceRepository.countByFilters(filters),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    const hasMore = pagination.page < totalPages;

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencias obtenidas`, {
      orderId: input.orderId,
      count: evidences.length,
      total,
      filters,
    });

    return {
      evidences,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  private validateInput(input: GetEvidencesByOrderInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (input.page !== undefined && input.page < 1) {
      throw new Error(ERROR_MESSAGES.INVALID_PAGE);
    }

    if (input.limit !== undefined) {
      if (input.limit < 1 || input.limit > PAGINATION_CONFIG.MAX_LIMIT) {
        throw new Error(ERROR_MESSAGES.INVALID_LIMIT);
      }
    }

    if (input.status !== undefined) {
      this.validateStatus(input.status);
    }
  }

  private validateStatus(status: string): void {
    const validStatuses = Object.values(EvidenceStatus);
    if (!validStatuses.includes(status as EvidenceStatus)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(status));
    }
  }

  private buildFilters(input: GetEvidencesByOrderInput): EvidenceFilters {
    return {
      orderId: input.orderId,
      stage: input.stage,
      status: input.status,
    };
  }

  private buildPagination(input: GetEvidencesByOrderInput): PaginationParams {
    const page = input.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(
      input.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      PAGINATION_CONFIG.MAX_LIMIT
    );
    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  private buildSorting(input: GetEvidencesByOrderInput): SortingParams {
    return {
      field: input.sortBy || DEFAULT_SORT.field,
      order: input.sortOrder || DEFAULT_SORT.order,
    };
  }
}

// Tipos helper para el repositorio
interface EvidenceFilters {
  orderId: string;
  stage?: string;
  status?: EvidenceStatus;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface SortingParams {
  field: 'createdAt' | 'updatedAt' | 'status';
  order: 'asc' | 'desc';
}

