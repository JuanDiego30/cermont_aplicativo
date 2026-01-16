import { BadRequestException } from '@nestjs/common';

export interface IBaseRepository<T> {
  findMany(skip?: number, take?: number, where?: any, include?: any): Promise<T[]>;
  findById(id: string, include?: any): Promise<T | null>;
  create(data: any, include?: any): Promise<T>;
  update(id: string, data: any, include?: any): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: any): Promise<number>;
}

export interface FindAllOptions {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
  orderBy?: any;
}

export type WhereClause = Record<string, unknown>;
export type OrderByClause = Record<string, 'asc' | 'desc'>;

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected abstract modelName: string;

  abstract findMany(skip?: number, take?: number, where?: any, include?: any): Promise<T[]>;
  abstract findById(id: string, include?: any): Promise<T | null>;
  abstract create(data: any, include?: any): Promise<T>;
  abstract update(id: string, data: any, include?: any): Promise<T>;
  abstract delete(id: string): Promise<T>;
  abstract count(where?: any): Promise<number>;

  // Adapter for BaseService
  async findAll(options?: FindAllOptions): Promise<T[]> {
    return this.findMany(options?.skip, options?.take, options?.where, options?.include);
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // Soft Delete (Optional implementation)
  async softDelete(id: string): Promise<T> {
    throw new BadRequestException(`Soft delete not supported for ${this.modelName}`);
  }

  protected validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID is required');
    }
  }

  protected validateData(data: any): void {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Data cannot be empty');
    }
  }
}
