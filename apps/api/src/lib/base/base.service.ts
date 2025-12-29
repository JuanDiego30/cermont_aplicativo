import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { LoggerService } from '@/lib/logging/logger.service';

export interface IPaginationQuery {
    skip?: number;
    take?: number;
}

export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
}

@Injectable()
export abstract class BaseService<T> {
    protected readonly logger: LoggerService;
    protected abstract repository: BaseRepository<T>;

    constructor() {
        this.logger = new LoggerService();
    }

    async findAll(
        query?: IPaginationQuery,
        where?: any,
        include?: any,
    ): Promise<IPaginatedResponse<T>> {
        const skip = query?.skip || 0;
        const take = query?.take || 10;

        try {
            const [data, total] = await Promise.all([
                this.repository.findMany(skip, take, where, include),
                this.repository.count(where),
            ]);

            return {
                data,
                total,
                skip,
                take,
                hasMore: skip + take < total,
            };
        } catch (error) {
            this.logger.error(`Error finding all ${this.constructor.name}`, error as any);
            throw error;
        }
    }

    async findOne(id: string, include?: any): Promise<T> {
        if (!id) {
            throw new BadRequestException('ID is required');
        }

        try {
            const item = await this.repository.findById(id, include);
            if (!item) {
                throw new NotFoundException(`${this.constructor.name} not found`);
            }
            return item;
        } catch (error) {
            this.logger.error(`Error finding ${this.constructor.name} by id`, error as any);
            throw error;
        }
    }

    async create(data: any, include?: any): Promise<T> {
        if (!data) {
            throw new BadRequestException('Data is required');
        }

        try {
            const created = await this.repository.create(data, include);
            this.logger.log(`${this.constructor.name} created successfully`);
            return created;
        } catch (error) {
            this.logger.error(`Error creating ${this.constructor.name}`, error as any);
            throw error;
        }
    }

    async update(id: string, data: any, include?: any): Promise<T> {
        if (!id) {
            throw new BadRequestException('ID is required');
        }
        if (!data || Object.keys(data).length === 0) {
            throw new BadRequestException('Data cannot be empty');
        }

        try {
            // Verify exists first
            await this.findOne(id);
            const updated = await this.repository.update(id, data, include);
            this.logger.log(`${this.constructor.name} updated successfully`);
            return updated;
        } catch (error) {
            this.logger.error(`Error updating ${this.constructor.name}`, error as any);
            throw error;
        }
    }

    async delete(id: string): Promise<T> {
        if (!id) {
            throw new BadRequestException('ID is required');
        }

        try {
            // Verify exists first
            await this.findOne(id);
            const deleted = await this.repository.delete(id);
            this.logger.log(`${this.constructor.name} deleted successfully`);
            return deleted;
        } catch (error) {
            this.logger.error(`Error deleting ${this.constructor.name}`, error as any);
            throw error;
        }
    }
}
