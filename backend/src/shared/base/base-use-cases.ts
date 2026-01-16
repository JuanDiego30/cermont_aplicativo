/**
 * @file base-use-cases.ts
 * @description Abstract base classes for common use case patterns
 *
 * Reduces ~300+ lines of duplicate code across modules by providing
 * reusable implementations for GetById, Delete, and List operations.
 */
import { NotFoundException, Logger } from "@nestjs/common";
import { IUseCase } from "../interfaces/use-case.interface";
import { buildPaginatedResult, PaginatedResult } from "./base.service";

/**
 * Base interface for entities with an ID
 */
export interface IEntity {
  id: string;
}

/**
 * Base interface for repositories with findById method
 */
export interface IFindableRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
}

/**
 * Base interface for repositories with delete method
 */
export interface IDeletableRepository<TId = string> {
  delete(id: TId): Promise<void>;
}

/**
 * Base interface for ID Value Objects
 */
export interface IValueObjectId<T> {
  value: T;
}

/**
 * Factory function type for creating ID Value Objects
 */
export type IdFactory<TId> = (rawId: string) => TId;

/**
 * Abstract base class for "Get Entity By ID" use cases
 *
 * Eliminates duplicate code pattern:
 * 1. Create ID value object
 * 2. Find in repository
 * 3. Throw NotFoundException if not found
 * 4. Map to response DTO
 *
 * @example
 * ```ts
 * @Injectable()
 * export class GetKitUseCase extends GetByIdUseCase<Kit, KitId, KitResponseDto> {
 *   constructor(@Inject(KIT_REPOSITORY) repository: IKitRepository) {
 *     super(repository, KitId.create, 'Kit', KitMapper.toResponseDto);
 *   }
 * }
 * ```
 */
export abstract class GetByIdUseCase<
  TEntity extends IEntity,
  TId,
  TResponse = TEntity,
> implements IUseCase<string, TResponse> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: IFindableRepository<TEntity, TId>,
    protected readonly createId: IdFactory<TId>,
    protected readonly entityName: string,
    protected readonly mapToResponse?: (entity: TEntity) => TResponse,
  ) {
    this.logger = new Logger(`${entityName}GetByIdUseCase`);
  }

  async execute(rawId: string): Promise<TResponse> {
    this.logger.debug(`Finding ${this.entityName} by ID: ${rawId}`);

    const id = this.createId(rawId);
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} no encontrado: ${rawId}`);
    }

    // Return mapped response or entity directly
    if (this.mapToResponse) {
      return this.mapToResponse(entity);
    }

    return entity as unknown as TResponse;
  }
}

/**
 * Abstract base class for "Delete Entity By ID" use cases
 *
 * Eliminates duplicate code pattern:
 * 1. Create ID value object
 * 2. Verify entity exists
 * 3. Delete from repository
 * 4. Log operation
 *
 * @example
 * ```ts
 * @Injectable()
 * export class DeleteKitUseCase extends DeleteByIdUseCase<Kit, KitId> {
 *   constructor(@Inject(KIT_REPOSITORY) repository: IKitRepository & IDeletableRepository<KitId>) {
 *     super(repository, KitId.create, 'Kit');
 *   }
 * }
 * ```
 */
export abstract class DeleteByIdUseCase<
  TEntity extends IEntity,
  TId,
> implements IUseCase<string, void> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: IFindableRepository<TEntity, TId> &
      IDeletableRepository<TId>,
    protected readonly createId: IdFactory<TId>,
    protected readonly entityName: string,
  ) {
    this.logger = new Logger(`${entityName}DeleteUseCase`);
  }

  async execute(rawId: string): Promise<void> {
    this.logger.log(`Deleting ${this.entityName}: ${rawId}`);

    const id = this.createId(rawId);
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} no encontrado: ${rawId}`);
    }

    // Hook for custom pre-delete validation
    await this.beforeDelete(entity);

    await this.repository.delete(id);

    // Hook for custom post-delete actions
    await this.afterDelete(rawId);

    this.logger.log(`${this.entityName} deleted: ${rawId}`);
  }

  /**
   * Override to add pre-delete validation (e.g., check dependencies)
   */
  protected async beforeDelete(entity: TEntity): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Override to add post-delete actions (e.g., emit events)
   */
  protected async afterDelete(id: string): Promise<void> {
    // Override in subclass if needed
  }
}

/**
 * Options for list use cases
 */
export interface ListOptions {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
}

/**
 * Base interface for repositories with findMany method
 */
export interface IListableRepository<T> {
  findMany(options?: ListOptions): Promise<T[]>;
  count(where?: Record<string, unknown>): Promise<number>;
}

// Re-export shared pagination types/helpers for convenience
export { PaginatedResult, buildPaginatedResult } from "./base.service";

/**
 * Abstract base class for "List Entities" use cases with pagination
 *
 * @example
 * ```ts
 * @Injectable()
 * export class ListKitsUseCase extends ListEntitiesUseCase<Kit, KitResponseDto> {
 *   constructor(@Inject(KIT_REPOSITORY) repository: IKitRepository) {
 *     super(repository, 'Kit', KitMapper.toResponseDto);
 *   }
 * }
 * ```
 */
export abstract class ListEntitiesUseCase<
  TEntity,
  TResponse = TEntity,
> implements IUseCase<ListOptions, PaginatedResult<TResponse>> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: IListableRepository<TEntity>,
    protected readonly entityName: string,
    protected readonly mapToResponse?: (entity: TEntity) => TResponse,
  ) {
    this.logger = new Logger(`${entityName}ListUseCase`);
  }

  async execute(
    options: ListOptions = {},
  ): Promise<PaginatedResult<TResponse>> {
    const page = options.skip
      ? Math.floor(options.skip / (options.take || 10)) + 1
      : 1;
    const pageSize = options.take || 10;

    this.logger.debug(
      `Listing ${this.entityName}s - page: ${page}, size: ${pageSize}`,
    );

    const [entities, total] = await Promise.all([
      this.repository.findMany(options),
      this.repository.count(options.where),
    ]);

    const data = this.mapToResponse
      ? entities.map(this.mapToResponse)
      : (entities as unknown as TResponse[]);

    return buildPaginatedResult({ data, total, page, pageSize });
  }
}
