/**
 * @class BaseRepository
 * @description Abstract base repository with generic Prisma CRUD operations
 * @layer Infrastructure
 *
 * Eliminates ~250 lines of duplicate repository code across modules.
 * Each module extends this and only adds domain-specific queries.
 */
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Prisma transaction client type
 * Uses Pick to extract only the model delegates from PrismaService
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransactionClient = any;

/** Type for Prisma where clauses */
export type WhereClause = Record<string, unknown>;

/** Type for Prisma orderBy clauses */
export type OrderByClause = Record<string, "asc" | "desc">;

/** Type for Prisma include clauses */
export type IncludeClause = Record<string, boolean | object>;

/** Options for findAll queries */
export interface FindAllOptions {
  where?: WhereClause;
  orderBy?: OrderByClause;
  include?: IncludeClause;
  skip?: number;
  take?: number;
}

/** Prisma model delegate type for generic operations */
type PrismaModelDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  findFirst: (args?: unknown) => Promise<unknown | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  upsert: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  count: (args?: unknown) => Promise<number>;
};

export abstract class BaseRepository<T> {
  /**
   * Override in child class to return the Prisma model delegate
   * Example: return this.prisma.orden;
   */
  protected abstract get model(): PrismaModelDelegate;

  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Find all records with optional filters
   */
  async findAll(options: FindAllOptions = {}): Promise<T[]> {
    const { where, orderBy, include, skip, take } = options;

    return (await this.model.findMany({
      where: where || {},
      orderBy: orderBy || { createdAt: "desc" },
      include,
      skip,
      take,
    })) as T[];
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, include?: IncludeClause): Promise<T | null> {
    return (await this.model.findUnique({
      where: { id },
      include,
    })) as T | null;
  }

  /**
   * Find first matching record
   */
  async findFirst(
    where: WhereClause,
    include?: IncludeClause,
  ): Promise<T | null> {
    return (await this.model.findFirst({
      where,
      include,
    })) as T | null;
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>, include?: IncludeClause): Promise<T> {
    return (await this.model.create({
      data,
      include,
    })) as T;
  }

  /**
   * Update an existing record
   */
  async update(
    id: string,
    data: Partial<T>,
    include?: IncludeClause,
  ): Promise<T> {
    return (await this.model.update({
      where: { id },
      data,
      include,
    })) as T;
  }

  /**
   * Upsert (create or update)
   */
  async upsert(
    where: WhereClause,
    create: Partial<T>,
    update: Partial<T>,
  ): Promise<T> {
    return (await this.model.upsert({
      where,
      create,
      update,
    })) as T;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  /**
   * Soft delete (set active = false)
   */
  async softDelete(id: string): Promise<T> {
    return (await this.model.update({
      where: { id },
      data: { active: false, deletedAt: new Date() },
    })) as T;
  }

  /**
   * Count records matching filters
   */
  async count(where?: WhereClause): Promise<number> {
    return await this.model.count({ where: where || {} });
  }

  /**
   * Check if record exists
   */
  async exists(where: WhereClause): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Transaction wrapper
   * @param fn Function that receives a Prisma transaction client
   */
  async transaction<R>(fn: (tx: TransactionClient) => Promise<R>): Promise<R> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await this.prisma.$transaction(fn as any)) as R;
  }
}
