/**
 * @file repository.interface.ts
 * @description Interfaces base para repositorios (Clean Architecture)
 */

import type { PaginatedResponse } from "../types/api-response.types";

/**
 * Interface base para repositorios CRUD
 *
 * Uso:
 * ```ts
 * interface IUserRepository extends IRepository<User, CreateUserDto, UpdateUserDto> {
 *   findByEmail(email: string): Promise<User | null>;
 * }
 * ```
 */
export interface IRepository<TEntity, TCreateDto, TUpdateDto> {
  /**
   * Busca entidad por ID
   */
  findById(id: string | number): Promise<TEntity | null>;

  /**
   * Retorna todas las entidades
   */
  findAll(): Promise<TEntity[]>;

  /**
   * Crea nueva entidad
   */
  create(data: TCreateDto): Promise<TEntity>;

  /**
   * Actualiza entidad existente
   */
  update(id: string | number, data: TUpdateDto): Promise<TEntity>;

  /**
   * Elimina entidad
   */
  delete(id: string | number): Promise<void>;
}

/**
 * Interface para repositorios con soft delete
 */
export interface ISoftDeleteRepository<TEntity> {
  /**
   * Soft delete - marca como eliminado sin borrar
   */
  softDelete(id: string | number): Promise<void>;

  /**
   * Restaura entidad soft-deleted
   */
  restore(id: string | number): Promise<TEntity>;

  /**
   * Busca incluyendo soft-deleted
   */
  findAllWithDeleted(): Promise<TEntity[]>;

  /**
   * Busca solo soft-deleted
   */
  findOnlyDeleted(): Promise<TEntity[]>;
}

/**
 * Interface para repositorios con paginación
 */
export interface IPaginatedRepository<TEntity, TFilterDto> {
  /**
   * Busca con paginación y filtros
   */
  findAllPaginated(
    filter: TFilterDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TEntity>>;

  /**
   * Cuenta registros que coinciden con filtro
   */
  count(filter?: TFilterDto): Promise<number>;
}

/**
 * Interface para repositorios con búsqueda
 */
export interface ISearchableRepository<TEntity> {
  /**
   * Búsqueda por texto
   */
  search(query: string, limit?: number): Promise<TEntity[]>;
}

/**
 * Interface combinada para repositorios completos
 */
export interface IFullRepository<TEntity, TCreateDto, TUpdateDto, TFilterDto>
  extends
    IRepository<TEntity, TCreateDto, TUpdateDto>,
    IPaginatedRepository<TEntity, TFilterDto> {}
