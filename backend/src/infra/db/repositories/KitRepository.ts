import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import type { Kit } from '../../../domain/entities/Kit.js';
import { KitCategory } from '../../../domain/entities/Kit.js';
import type { 
  IKitRepository, 
  KitFilters, 
  PaginationParams, 
  SortingParams 
} from '../../../domain/repositories/IKitRepository.js';

export class KitRepository implements IKitRepository {

  private toEntity(kit: any): Kit {
    return {
      ...kit,
      tools: this.parseCollection(kit.tools),
      equipment: this.parseCollection(kit.equipment),
      documents: this.parseCollection(kit.documents),
      category: kit.category as KitCategory,
    };
  }

  private parseCollection(field: string | null | undefined): any[] {
    if (!field) return [];
    try {
      const parsed = typeof field === 'string' ? JSON.parse(field) : field;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private serializeCollection(items?: any[]): string {
    return items && items.length > 0 ? JSON.stringify(items) : '[]';
  }

  async create(kit: Omit<Kit, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Kit> {
    const created = await prisma.kit.create({
      data: {
        name: kit.name,
        description: kit.description,
        category: kit.category,
        activityType: kit.activityType,
        active: kit.active ?? true,
        createdBy: kit.createdBy,
        tools: this.serializeCollection(kit.tools),
        equipment: this.serializeCollection(kit.equipment),
        documents: this.serializeCollection(kit.documents),
      },
    });
    return this.toEntity(created);
  }

  async update(id: string, updates: Partial<Kit>): Promise<Kit> {
    const data: any = { ...updates };
    
    if (updates.tools) data.tools = this.serializeCollection(updates.tools);
    if (updates.equipment) data.equipment = this.serializeCollection(updates.equipment);
    if (updates.documents) data.documents = this.serializeCollection(updates.documents);

    const updated = await prisma.kit.update({
      where: { id },
      data,
    });
    return this.toEntity(updated);
  }

  async findById(id: string): Promise<Kit | null> {
    const found = await prisma.kit.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findAll(
    filters: KitFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Kit[]> {
    const where: Prisma.KitWhereInput = {};

    if (filters.category) where.category = filters.category;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } }, // mode: 'insensitive' si es Postgres
        { description: { contains: filters.search } },
      ];
    }

    const items = await prisma.kit.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting 
        ? { [sorting.field]: sorting.order }
        : { createdAt: 'desc' },
    });

    return items.map(k => this.toEntity(k));
  }

  async count(filters: KitFilters): Promise<number> {
    const where: Prisma.KitWhereInput = {};
    if (filters.category) where.category = filters.category;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
    }
    return prisma.kit.count({ where });
  }

  async delete(id: string): Promise<void> {
    // Soft delete: just set active to false
    await prisma.kit.update({
      where: { id },
      data: { 
        active: false
      },
    });
  }

  async findByNameAndCategory(name: string, category: KitCategory): Promise<Kit | null> {
    const found = await prisma.kit.findFirst({
      where: { name, category },
    });
    return found ? this.toEntity(found) : null;
  }

  async findAllWithFilters(
    filters: KitFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Kit[]> {
    return this.findAll(filters, pagination, sorting);
  }

  async getStats(): Promise<{ total: number; active: number; byCategory: Record<string, number> }> {
    const [total, active, grouped] = await Promise.all([
      prisma.kit.count(),
      prisma.kit.count({ where: { active: true } }),
      prisma.kit.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ]);

    const byCategory: Record<string, number> = {};
    grouped.forEach(g => {
      byCategory[g.category] = g._count.category;
    });

    return { total, active, byCategory };
  }
}

// Singleton instance for dependency injection
export const kitRepository = new KitRepository();

