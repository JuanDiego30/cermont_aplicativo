/**
 * @class BaseService
 * @description Abstract base service with common business operations
 * @layer Application
 *
 * NestJS Expert Skill Compliant:
 * - Uses @Injectable() for dependency injection
 * - Implements error handling with HTTP exceptions
 * - Provides logging with LoggerService
 * - Supports generics for type safety
 * - Includes lifecycle hooks for extensibility
 *
 * Eliminates ~400 lines of duplicate service code across modules.
 */
import { LoggerService } from '@/shared/logging/logger.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository, FindAllOptions } from './base.repository';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function buildPaginatedResult<T>(props: {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}): PaginatedResult<T> {
  return {
    ...props,
    totalPages: Math.ceil(props.total / props.pageSize),
  };
}

export interface ServiceOptions {
  throwOnNotFound?: boolean;
  logOperations?: boolean;
}

@Injectable()
export abstract class BaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  protected readonly logger: LoggerService;
  protected readonly entityName: string;

  constructor(
    protected readonly repository: BaseRepository<T>,
    entityName: string
  ) {
    this.entityName = entityName;
    this.logger = new LoggerService(`${entityName}Service`);
  }

  /**
   * Find all records with optional filters
   * @param options Query options including where, orderBy, include, skip, take
   * @returns Array of entities
   */
  async findAll(options?: FindAllOptions): Promise<T[]> {
    this.logger.debug(`Finding all ${this.entityName}s`);
    return await this.repository.findAll(options);
  }

  /**
   * Find all with pagination
   * @param page Page number (default: 1)
   * @param pageSize Items per page (default: 10)
   * @param options Query options (excluding skip and take)
   * @returns Paginated result with metadata
   */
  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    options?: Omit<FindAllOptions, 'skip' | 'take'>
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.repository.findAll({ ...options, skip, take: pageSize }),
      this.repository.count(options?.where),
    ]);

    return buildPaginatedResult({ data, total, page, pageSize });
  }

  /**
   * Find by ID
   * @param id Entity ID
   * @param options Service options including throwOnNotFound
   * @returns Entity or null
   */
  async findById(id: string, options?: ServiceOptions): Promise<T | null> {
    this.logger.debug(`Finding ${this.entityName} by ID: ${id}`);

    const entity = await this.repository.findById(id);

    if (!entity && options?.throwOnNotFound) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }

    return entity;
  }

  /**
   * Find by ID or throw NotFoundException
   * @param id Entity ID
   * @returns Entity
   * @throws NotFoundException if entity not found
   */
  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findById(id, { throwOnNotFound: true });
    return entity!;
  }

  /**
   * Create a new entity
   * @param data Entity data to create
   * @returns Created entity
   */
  async create(data: TCreate): Promise<T> {
    this.logger.log(`Creating new ${this.entityName}`, undefined, { data });

    try {
      // Hook for pre-create validation
      await this.beforeCreate(data);

      const entity = await this.repository.create(data as Partial<T>);

      // Hook for post-create actions
      await this.afterCreate(entity);

      this.logger.log(`Created ${this.entityName} successfully`);
      return entity;
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, `Failed to create ${this.entityName}`, {
        errorMessage: (error as Error).message,
        errorName: (error as Error).name,
      });
      throw error;
    }
  }

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param data Partial entity data to update
   * @returns Updated entity
   * @throws NotFoundException if entity not found
   */
  async update(id: string, data: TUpdate): Promise<T> {
    this.logger.log(`Updating ${this.entityName}: ${id}`, undefined, { data });

    try {
      // Ensure entity exists
      await this.findByIdOrFail(id);

      // Hook for pre-update validation
      await this.beforeUpdate(id, data);

      const entity = await this.repository.update(id, data as Partial<T>);

      // Hook for post-update actions
      await this.afterUpdate(entity);

      this.logger.log(`Updated ${this.entityName} successfully`);
      return entity;
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, `Failed to update ${this.entityName}: ${id}`, {
        errorMessage: (error as Error).message,
        errorName: (error as Error).name,
      });
      throw error;
    }
  }

  /**
   * Delete an entity
   * @param id Entity ID
   * @throws NotFoundException if entity not found
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting ${this.entityName}: ${id}`);

    try {
      // Ensure entity exists
      await this.findByIdOrFail(id);

      // Hook for pre-delete validation
      await this.beforeDelete(id);

      await this.repository.delete(id);

      // Hook for post-delete actions
      await this.afterDelete(id);

      this.logger.log(`Deleted ${this.entityName} successfully`);
    } catch (error) {
      this.logger.logErrorWithStack(error as Error, `Failed to delete ${this.entityName}: ${id}`, {
        errorMessage: (error as Error).message,
        errorName: (error as Error).name,
      });
      throw error;
    }
  }

  /**
   * Soft delete an entity (sets active = false)
   * @param id Entity ID
   * @returns Updated entity with active = false
   * @throws NotFoundException if entity not found
   */
  async softDelete(id: string): Promise<T> {
    this.logger.log(`Soft deleting ${this.entityName}: ${id}`);

    try {
      await this.findByIdOrFail(id);

      const repo = this.repository as any;
      if (typeof repo.softDelete !== 'function') {
        throw new BadRequestException(`Soft delete not supported for ${this.entityName}`);
      }

      const entity = await repo.softDelete(id);

      this.logger.log(`Soft deleted ${this.entityName} successfully`);
      return entity;
    } catch (error) {
      this.logger.logErrorWithStack(
        error as Error,
        `Failed to soft delete ${this.entityName}: ${id}`,
        {
          errorMessage: (error as Error).message,
          errorName: (error as Error).name,
        }
      );
      throw error;
    }
  }

  /**
   * Count entities
   * @param where Optional where clause
   * @returns Count of entities
   */
  async count(where?: Record<string, any>): Promise<number> {
    this.logger.debug(`Counting ${this.entityName}s`);
    return await this.repository.count(where);
  }

  /**
   * Check if entity exists
   * @param where Where clause
   * @returns True if entity exists, false otherwise
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    this.logger.debug(`Checking if ${this.entityName} exists`);
    return await this.repository.exists(where);
  }

  // ==========================================
  // Lifecycle Hooks (Override in child classes)
  // ==========================================

  /**
   * Hook called before creating an entity
   * Override to add pre-create validation or logic
   */
  protected async beforeCreate(data: TCreate): Promise<void> {
    // Override in child class
  }

  /**
   * Hook called after creating an entity
   * Override to add post-create actions (e.g., emit events, send notifications)
   */
  protected async afterCreate(entity: T): Promise<void> {
    // Override in child class
  }

  /**
   * Hook called before updating an entity
   * Override to add pre-update validation or logic
   */
  protected async beforeUpdate(id: string, data: TUpdate): Promise<void> {
    // Override in child class
  }

  /**
   * Hook called after updating an entity
   * Override to add post-update actions
   */
  protected async afterUpdate(entity: T): Promise<void> {
    // Override in child class
  }

  /**
   * Hook called before deleting an entity
   * Override to add pre-delete validation or logic
   */
  protected async beforeDelete(id: string): Promise<void> {
    // Override in child class
  }

  /**
   * Hook called after deleting an entity
   * Override to add post-delete actions (e.g., cleanup, notifications)
   */
  protected async afterDelete(id: string): Promise<void> {
    // Override in child class
  }
}
