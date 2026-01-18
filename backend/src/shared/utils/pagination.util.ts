/**
 * @util PaginationUtil
 *
 * Utilidad genérica para paginación con Prisma.
 * 100% type-safe - sin 'any'
 *
 * Uso:
 *   const result = await PaginationUtil.paginate({
 *     model: this.prisma.orden,
 *     query: { page: 1, limit: 10 },
 *     where: { active: true },
 *     orderBy: { createdAt: 'desc' },
 *     include: { cliente: true },
 *   });
 */

import type { PaginationMeta } from '../types/api-response.types';
import { createPaginationMeta } from '../types/api-response.types';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Interfaz base para modelos Prisma
 * Evita el uso de 'any' tipando los métodos esperados
 */
export interface PrismaModelDelegate<
  TModel,
  TWhere = Record<string, unknown>,
  TOrderBy = Record<string, 'asc' | 'desc'>,
  TInclude = Record<string, boolean | object>,
  TSelect = Record<string, boolean>,
> {
  findMany(args: {
    where?: TWhere;
    orderBy?: TOrderBy;
    include?: TInclude;
    select?: TSelect;
    skip?: number;
    take?: number;
  }): Promise<TModel[]>;
  count(args: { where?: TWhere }): Promise<number>;
}

export interface PaginateOptions<
  TModel,
  TWhere = Record<string, unknown>,
  TOrderBy = Record<string, 'asc' | 'desc'>,
  TInclude = Record<string, boolean | object>,
  TSelect = Record<string, boolean>,
> {
  model: PrismaModelDelegate<TModel, TWhere, TOrderBy, TInclude, TSelect>;
  query: PaginationQuery;
  where?: TWhere;
  orderBy?: TOrderBy;
  include?: TInclude;
  select?: TSelect;
}

export class PaginationUtil {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  /**
   * Normaliza los parámetros de paginación
   */
  static normalizeQuery(
    query: PaginationQuery
  ): Required<Omit<PaginationQuery, 'sortBy' | 'sortOrder'>> &
    Pick<PaginationQuery, 'sortBy' | 'sortOrder'> {
    const page = Math.max(1, query.page || this.DEFAULT_PAGE);
    const limit = Math.min(this.MAX_LIMIT, Math.max(1, query.limit || this.DEFAULT_LIMIT));
    return {
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder || 'desc',
    };
  }

  /**
   * Calcula skip para Prisma
   */
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calcula total de páginas
   */
  static getTotalPages(total: number, limit: number): number {
    if (limit < 1) {
      throw new Error('Limit debe ser mayor a 0');
    }
    return Math.ceil(total / limit);
  }

  /**
   * Valida parámetros de paginación
   */
  static validateParams(page: number, limit: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page debe ser un entero positivo');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > this.MAX_LIMIT) {
      throw new Error(`Limit debe ser un entero entre 1 y ${this.MAX_LIMIT}`);
    }
  }

  /**
   * Ejecuta consulta paginada genérica
   */
  static async paginate<
    TModel,
    TWhere = Record<string, unknown>,
    TOrderBy = Record<string, 'asc' | 'desc'>,
    TInclude = Record<string, boolean | object>,
    TSelect = Record<string, boolean>,
  >(
    options: PaginateOptions<TModel, TWhere, TOrderBy, TInclude, TSelect>
  ): Promise<PaginatedResult<TModel>> {
    const { model, query, where, orderBy, include, select } = options;
    const normalized = this.normalizeQuery(query);
    const skip = this.getSkip(normalized.page, normalized.limit);

    // Ejecutar consultas en paralelo
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        include,
        select,
        skip,
        take: normalized.limit,
      }),
      model.count({ where }),
    ]);

    return {
      data,
      meta: createPaginationMeta(total, normalized.page, normalized.limit),
    };
  }

  /**
   * Crea respuesta de paginación desde datos ya obtenidos
   */
  static createResponse<T>(data: T[], total: number, query: PaginationQuery): PaginatedResult<T> {
    const normalized = this.normalizeQuery(query);

    return {
      data,
      meta: createPaginationMeta(total, normalized.page, normalized.limit),
    };
  }

  /**
   * Crea metadata de paginación
   */
  static createMeta(total: number, page: number, limit: number): PaginationMeta {
    return createPaginationMeta(total, page, limit);
  }
}

// Re-export del DTO desde su nueva ubicación para compatibilidad
export {
  PaginationQueryDto,
  PaginationWithSortDto,
  SearchPaginationDto,
} from '../dto/pagination.dto';
