/**
 * Use Case: Listar Kits
 * 
 * Permite obtener una lista paginada de kits con filtros opcionales.
 * 
 * Filtros soportados:
 * - category: Filtrar por categoría específica
 * - active: Filtrar por estado activo/inactivo
 * - search: Búsqueda por nombre o descripción
 * - sortBy: Campo para ordenar resultados
 * - sortOrder: Dirección de ordenamiento (asc/desc)
 * 
 * @file src/app/kits/use-cases/ListKits.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import type { Kit } from '../../../domain/entities/Kit.js';
import { KitCategory } from '../../../domain/entities/Kit.js';
import { logger } from '../../../shared/utils/logger.js';

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

const DEFAULT_SORT = {
  FIELD: 'createdAt' as const,
  ORDER: 'desc' as const,
} as const;

const ERROR_MESSAGES = {
  INVALID_PAGE: 'El número de página debe ser mayor a 0',
  INVALID_LIMIT: `El límite debe estar entre 1 y ${PAGINATION_CONFIG.MAX_LIMIT}`,
  INVALID_CATEGORY: (validCategories: string[]) =>
    `Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`,
  INVALID_SORT_FIELD: (validFields: string[]) =>
    `Campo de ordenamiento inválido. Debe ser uno de: ${validFields.join(', ')}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ListKitsUseCase]',
} as const;

const VALID_SORT_FIELDS = ['name', 'category', 'createdAt', 'updatedAt'] as const;
type SortField = (typeof VALID_SORT_FIELDS)[number];

interface ListKitsInput {
  category?: KitCategory;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: 'asc' | 'desc';
}

interface ListKitsOutput {
  kits: Kit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface KitFilters {
  category?: KitCategory;
  active?: boolean;
  search?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface SortingParams {
  field: SortField;
  order: 'asc' | 'desc';
}

export class ListKitsUseCase {
  constructor(private readonly kitRepository: IKitRepository) {}

  async execute(input: ListKitsInput = {}): Promise<ListKitsOutput> {
    this.validateInput(input);

    const filters = this.buildFilters(input);
    const pagination = this.buildPagination(input);
    const sorting = this.buildSorting(input);

    const [kits, total] = await Promise.all([
      this.kitRepository.findAllWithFilters(filters, pagination, sorting),
      this.kitRepository.count(filters),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    const hasMore = pagination.page < totalPages;

    logger.info(`${LOG_CONTEXT.USE_CASE} Kits listados`, {
      count: kits.length,
      total,
      filters,
      page: pagination.page,
    });

    return {
      kits,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  private validateInput(input: ListKitsInput): void {
    if (input.page !== undefined && input.page < 1) {
      throw new Error(ERROR_MESSAGES.INVALID_PAGE);
    }

    if (input.limit !== undefined) {
      if (input.limit < 1 || input.limit > PAGINATION_CONFIG.MAX_LIMIT) {
        throw new Error(ERROR_MESSAGES.INVALID_LIMIT);
      }
    }

    if (input.category !== undefined) {
      this.validateCategory(input.category);
    }

    if (input.sortBy !== undefined) {
      this.validateSortField(input.sortBy);
    }
  }

  private validateCategory(category: string): void {
    const validCategories = Object.values(KitCategory) as string[];
    if (!validCategories.includes(category as KitCategory)) {
      throw new Error(ERROR_MESSAGES.INVALID_CATEGORY(validCategories));
    }
  }

  private validateSortField(sortBy: string): void {
    if (!VALID_SORT_FIELDS.includes(sortBy as SortField)) {
      throw new Error(ERROR_MESSAGES.INVALID_SORT_FIELD([...VALID_SORT_FIELDS]));
    }
  }

  private buildFilters(input: ListKitsInput): KitFilters {
    return {
      category: input.category,
      active: input.active,
      search: input.search?.trim(),
    };
  }

  private buildPagination(input: ListKitsInput): PaginationParams {
    const page = input.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(
      input.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      PAGINATION_CONFIG.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private buildSorting(input: ListKitsInput): SortingParams {
    return {
      field: input.sortBy || DEFAULT_SORT.FIELD,
      order: input.sortOrder || DEFAULT_SORT.ORDER,
    };
  }
}

