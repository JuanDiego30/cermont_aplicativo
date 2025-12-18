/**
 * @class BaseRepository
 * @description Abstract base repository with generic Prisma CRUD operations
 * @layer Infrastructure
 * 
 * Eliminates ~250 lines of duplicate repository code across modules.
 * Each module extends this and only adds domain-specific queries.
 */
import { PrismaService } from '../../prisma/prisma.service';

export interface FindAllOptions {
    where?: Record<string, any>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: Record<string, boolean | object>;
    skip?: number;
    take?: number;
}

export abstract class BaseRepository<T> {
    /**
     * Override in child class to return the Prisma model delegate
     * Example: return this.prisma.orden;
     */
    protected abstract get model(): any;

    constructor(protected readonly prisma: PrismaService) { }

    /**
     * Find all records with optional filters
     */
    async findAll(options: FindAllOptions = {}): Promise<T[]> {
        const { where, orderBy, include, skip, take } = options;

        return await this.model.findMany({
            where: where || {},
            orderBy: orderBy || { createdAt: 'desc' },
            include,
            skip,
            take,
        });
    }

    /**
     * Find a single record by ID
     */
    async findById(id: string, include?: Record<string, boolean | object>): Promise<T | null> {
        return await this.model.findUnique({
            where: { id },
            include,
        });
    }

    /**
     * Find first matching record
     */
    async findFirst(where: Record<string, any>, include?: Record<string, boolean | object>): Promise<T | null> {
        return await this.model.findFirst({
            where,
            include,
        });
    }

    /**
     * Create a new record
     */
    async create(data: Partial<T>, include?: Record<string, boolean | object>): Promise<T> {
        return await this.model.create({
            data,
            include,
        });
    }

    /**
     * Update an existing record
     */
    async update(id: string, data: Partial<T>, include?: Record<string, boolean | object>): Promise<T> {
        return await this.model.update({
            where: { id },
            data,
            include,
        });
    }

    /**
     * Upsert (create or update)
     */
    async upsert(
        where: Record<string, any>,
        create: Partial<T>,
        update: Partial<T>,
    ): Promise<T> {
        return await this.model.upsert({
            where,
            create,
            update,
        });
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
        return await this.model.update({
            where: { id },
            data: { active: false, deletedAt: new Date() },
        });
    }

    /**
     * Count records matching filters
     */
    async count(where?: Record<string, any>): Promise<number> {
        return await this.model.count({ where: where || {} });
    }

    /**
     * Check if record exists
     */
    async exists(where: Record<string, any>): Promise<boolean> {
        const count = await this.model.count({ where });
        return count > 0;
    }

    /**
     * Transaction wrapper
     */
    async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
        return await this.prisma.$transaction(fn);
    }
}
