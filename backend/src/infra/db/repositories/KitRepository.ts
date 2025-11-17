import prisma from '../prisma.js';
import type { Kit } from '@/domain/entities/Kit.js';
import { KitCategory } from '@/domain/entities/Kit.js';
import type {
  IKitRepository,
  KitFilters,
  KitPaginationOptions,
} from '@/domain/repositories/IKitRepository.js';

export class KitRepository implements IKitRepository {
  private readonly defaultLimit = 20;
  async findById(id: string): Promise<Kit | null> {
    const kit = await prisma.kit.findUnique({
      where: { id },
    });

    return kit ? this.toEntity(kit) : null;
  }

  async findByName(name: string): Promise<Kit | null> {
    const kit = await prisma.kit.findFirst({
      where: { name },
    });

    return kit ? this.toEntity(kit) : null;
  }

  async create(data: Omit<Kit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kit> {
    const kit = await prisma.kit.create({
      data: {
        ...data,
        tools: this.serializeCollection(data.tools),
        equipment: this.serializeCollection(data.equipment),
        documents: this.serializeCollection(data.documents),
      },
    });

    return this.toEntity(kit);
  }

  async update(
    id: string,
    data: Partial<Omit<Kit, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Kit> {
    const updateData: any = { ...data };

    if (data.tools) updateData.tools = this.serializeCollection(data.tools);
    if (data.equipment) updateData.equipment = this.serializeCollection(data.equipment);
    if (data.documents) updateData.documents = this.serializeCollection(data.documents);

    try {
      const kit = await prisma.kit.update({
        where: { id },
        data: updateData,
      });
      return this.toEntity(kit);
    } catch {
      throw new Error('Kit not found');
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.kit.delete({ where: { id } });
  }

  async findAll(
    filters: KitFilters = {},
    options: KitPaginationOptions = {}
  ): Promise<{ kits: Kit[]; total: number; page: number; totalPages: number }> {
    const where = this.buildWhere(filters);
    const limit = options.limit ?? 20;
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (options as any).skip ?? (page - 1) * limit;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [kits, total] = await Promise.all([
      prisma.kit.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
      }),
      prisma.kit.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      kits: kits.map((kit) => this.toEntity(kit)),
      total,
      page,
      totalPages,
    };
  }

  async find(
    filters: { category?: string; active?: boolean; limit?: number; skip?: number } = {}
  ): Promise<Kit[]> {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.active !== undefined) where.active = filters.active;

    const prismaKits = await prisma.kit.findMany({
      where,
      take: filters.limit || 20,
      skip: filters.skip || 0,
      orderBy: { createdAt: 'desc' },
    });

    return prismaKits.map((kit) => this.toEntity(kit));
  }

  async findByCategory(category: KitCategory): Promise<Kit[]> {
    const kits = await prisma.kit.findMany({
      where: { category, active: true },
      orderBy: { name: 'asc' },
    });

    return kits.map((kit) => this.toEntity(kit));
  }

  async duplicate(id: string, createdBy: string): Promise<Kit> {
    const original = await this.findById(id);
    
    if (!original) {
      throw new Error('Kit not found');
    }

    return this.create({
      name: `${original.name} (Copia)`,
      description: original.description,
      category: original.category,
      tools: original.tools,
      equipment: original.equipment,
      documents: original.documents,
      active: true,
      createdBy,
    });
  }

  async countByCategory(category: string): Promise<number> {
    return prisma.kit.count({ where: { category } });
  }

  async countAllByCategory(): Promise<Record<KitCategory, number>> {
    const counts = Object.values(KitCategory).reduce(
      (acc, category) => ({ ...acc, [category]: 0 }),
      {} as Record<KitCategory, number>
    );

    const grouped = await prisma.kit.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    grouped.forEach((entry) => {
      const category = entry.category as KitCategory;
      if (counts[category] !== undefined) {
        counts[category] = entry._count.category;
      }
    });

    return counts;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<KitCategory, number>;
    totalTools: number;
    totalEquipment: number;
    totalDocuments: number;
  }> {
    const [total, active, inactive, grouped, kitsForCollections] = await Promise.all([
      prisma.kit.count(),
      prisma.kit.count({ where: { active: true } }),
      prisma.kit.count({ where: { active: false } }),
      prisma.kit.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      prisma.kit.findMany({
        select: {
          tools: true,
          equipment: true,
          documents: true,
        },
      }),
    ]);

    const byCategory = Object.values(KitCategory).reduce(
      (acc, category) => ({ ...acc, [category]: 0 }),
      {} as Record<KitCategory, number>
    );

    grouped.forEach((entry) => {
      const category = entry.category as KitCategory;
      if (byCategory[category] !== undefined) {
        byCategory[category] = entry._count.category;
      }
    });

    const totalTools = kitsForCollections.reduce(
      (sum, kit) => sum + this.parseCollection(kit.tools).length,
      0
    );

    const totalEquipment = kitsForCollections.reduce(
      (sum, kit) => sum + this.parseCollection(kit.equipment).length,
      0
    );

    const totalDocuments = kitsForCollections.reduce(
      (sum, kit) => sum + this.parseCollection(kit.documents).length,
      0
    );

    return {
      total,
      active,
      inactive,
      byCategory,
      totalTools,
      totalEquipment,
      totalDocuments,
    };
  }

  private buildWhere(filters: KitFilters): any {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.createdBy) where.createdBy = filters.createdBy;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private toEntity(kit: any): Kit {
    return {
      ...kit,
      tools: this.parseCollection(kit.tools),
      equipment: this.parseCollection(kit.equipment),
      documents: this.parseCollection(kit.documents),
    };
  }

  private parseCollection(field: string | null | undefined): string[] {
    if (!field) return [];

    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private serializeCollection(items?: string[]): string {
    return items && items.length ? JSON.stringify(items) : '[]';
  }
}

export const kitRepository = new KitRepository();
