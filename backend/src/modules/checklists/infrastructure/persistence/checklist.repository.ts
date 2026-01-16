/**
 * @repository ChecklistRepository
 *
 * Implementación del repositorio de checklists usando Prisma
 * Maneja tanto ChecklistTemplate como ChecklistEjecucion
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IChecklistRepository,
  ChecklistFilters,
  PaginationQuery,
  PaginatedResult,
} from '../../domain/repositories';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistPrismaMapper } from './checklist.prisma.mapper';
import { ChecklistStatusEnum } from '../../domain/value-objects/checklist-status.vo';

@Injectable()
export class ChecklistRepository implements IChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(checklist: Checklist): Promise<Checklist> {
    const persistence = checklist.toPersistence();

    // Determinar si es template o instancia
    if (checklist.isTemplate()) {
      return this.saveTemplate(checklist);
    } else {
      return this.saveEjecucion(checklist);
    }
  }

  private async saveTemplate(checklist: Checklist): Promise<Checklist> {
    const persistence = ChecklistPrismaMapper.toTemplatePersistence(checklist);

    const result = await this.prisma.checklistTemplate.upsert({
      where: { id: persistence.id },
      create: {
        id: persistence.id,
        nombre: persistence.nombre,
        descripcion: persistence.descripcion,
        tipo: persistence.tipo || 'general',
        categoria: persistence.categoria,
        activo: persistence.activo,
        items: {
          create: persistence.items.map((item: any) => ({
            nombre: item.nombre,
            descripcion: item.nombre,
            tipo: 'item',
            orden: item.orden,
            requereCertificacion: item.requereCertificacion,
          })),
        },
      },
      update: {
        nombre: persistence.nombre,
        descripcion: persistence.descripcion,
        tipo: persistence.tipo,
        categoria: persistence.categoria,
        activo: persistence.activo,
        updatedAt: persistence.updatedAt,
      },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return ChecklistPrismaMapper.templateToDomain(result);
  }

  private async saveEjecucion(checklist: Checklist): Promise<Checklist> {
    const persistence = checklist.toPersistence();

    // Obtener template para mapear items
    const template = persistence.templateId
      ? await this.prisma.checklistTemplate.findUnique({
          where: { id: persistence.templateId },
          include: { items: true },
        })
      : null;

    const result = await this.prisma.checklistEjecucion.upsert({
      where: { id: persistence.id },
      create: {
        id: persistence.id,
        ejecucionId: persistence.ejecucionId!,
        templateId: persistence.templateId,
        nombre: persistence.name,
        descripcion: persistence.description,
        completada: persistence.completada,
        completadoPorId: persistence.completadoPorId,
        completadoEn: persistence.completadoEn,
        items: {
          create: persistence.items.map((item, index) => {
            // Buscar templateItem correspondiente
            const templateItem = template?.items.find(
              (ti: any) => ti.nombre === item.label || ti.orden === item.orden
            );

            return {
              nombre: item.label,
              estado: item.isChecked ? 'completado' : 'pendiente',
              completado: item.isChecked,
              completadoEn: item.checkedAt,
              observaciones: item.observaciones,
              templateItemId: templateItem?.id,
            };
          }),
        },
      },
      update: {
        nombre: persistence.name,
        descripcion: persistence.description,
        completada: persistence.completada,
        completadoPorId: persistence.completadoPorId,
        completadoEn: persistence.completadoEn,
        updatedAt: persistence.updatedAt,
        // Actualizar items existentes
        items: {
          updateMany: persistence.items.map(item => ({
            where: { id: item.id },
            data: {
              nombre: item.label,
              estado: item.isChecked ? 'completado' : 'pendiente',
              completado: item.isChecked,
              completadoEn: item.checkedAt,
              observaciones: item.observaciones,
            },
          })),
        },
      },
      include: {
        items: {
          include: { templateItem: true },
          orderBy: { createdAt: 'asc' },
        },
        template: true,
      },
    });

    return ChecklistPrismaMapper.ejecucionToDomain(result);
  }

  async findById(id: string): Promise<Checklist | null> {
    // Intentar como template primero
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    if (template) {
      return ChecklistPrismaMapper.templateToDomain(template);
    }

    // Si no es template, buscar como ejecución
    const ejecucion = await this.prisma.checklistEjecucion.findUnique({
      where: { id },
      include: {
        items: {
          include: { templateItem: true },
          orderBy: { createdAt: 'asc' },
        },
        template: true,
      },
    });

    if (ejecucion) {
      return ChecklistPrismaMapper.ejecucionToDomain(ejecucion);
    }

    return null;
  }

  async findTemplateById(id: string): Promise<Checklist | null> {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    if (!template) {
      return null;
    }

    return ChecklistPrismaMapper.templateToDomain(template);
  }

  async findInstanceById(id: string): Promise<Checklist | null> {
    const ejecucion = await this.prisma.checklistEjecucion.findUnique({
      where: { id },
      include: {
        items: {
          include: { templateItem: true },
          orderBy: { createdAt: 'asc' },
        },
        template: true,
      },
    });

    if (!ejecucion) {
      return null;
    }

    return ChecklistPrismaMapper.ejecucionToDomain(ejecucion);
  }

  async list(
    filters: ChecklistFilters,
    pagination: PaginationQuery
  ): Promise<PaginatedResult<Checklist>> {
    const skip = (pagination.page - 1) * pagination.limit;

    // Construir where para templates
    const templateWhere: any = {};
    if (filters.tipo) {
      templateWhere.tipo = filters.tipo;
    }
    if (filters.categoria) {
      templateWhere.categoria = filters.categoria;
    }
    if (filters.activo !== undefined) {
      templateWhere.activo = filters.activo;
    }
    if (filters.search) {
      templateWhere.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Si hay filtro de orden/ejecución, buscar instancias
    if (filters.ordenId || filters.ejecucionId) {
      let ejecucionWhere: any = {};

      if (filters.ejecucionId) {
        ejecucionWhere.ejecucionId = filters.ejecucionId;
      } else if (filters.ordenId) {
        // Buscar ejecuciones de la orden primero
        const ejecuciones = await this.prisma.ejecucion.findMany({
          where: { ordenId: filters.ordenId },
          select: { id: true },
        });

        if (ejecuciones.length === 0) {
          return { items: [], total: 0 };
        }

        const ejecucionIds = ejecuciones.map(e => e.id);
        ejecucionWhere.ejecucionId = { in: ejecucionIds };
      }

      const [items, total] = await Promise.all([
        this.prisma.checklistEjecucion.findMany({
          where: ejecucionWhere,
          include: {
            items: {
              include: { templateItem: true },
              orderBy: { createdAt: 'asc' },
            },
            template: true,
          },
          skip,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.checklistEjecucion.count({ where: ejecucionWhere }),
      ]);

      return {
        items: items.map(item => ChecklistPrismaMapper.ejecucionToDomain(item)),
        total,
      };
    }

    // Buscar templates
    const [items, total] = await Promise.all([
      this.prisma.checklistTemplate.findMany({
        where: templateWhere,
        include: { items: { orderBy: { orden: 'asc' } } },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checklistTemplate.count({ where: templateWhere }),
    ]);

    return {
      items: items.map(item => ChecklistPrismaMapper.templateToDomain(item)),
      total,
    };
  }

  async findAllTemplates(filters?: ChecklistFilters): Promise<Checklist[]> {
    const where: any = {};
    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }
    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }
    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    const templates = await this.prisma.checklistTemplate.findMany({
      where,
      include: { items: { orderBy: { orden: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(t => ChecklistPrismaMapper.templateToDomain(t));
  }

  async findByTipo(tipo: string): Promise<Checklist[]> {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: { tipo, activo: true },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return templates.map(t => ChecklistPrismaMapper.templateToDomain(t));
  }

  async findByOrden(ordenId: string): Promise<Checklist[]> {
    // Buscar checklists de ejecuciones asociadas a la orden
    const ejecuciones = await this.prisma.ejecucion.findMany({
      where: { ordenId },
      select: { id: true },
    });

    if (ejecuciones.length === 0) {
      return [];
    }

    const ejecucionIds = ejecuciones.map(e => e.id);

    const checklists = await this.prisma.checklistEjecucion.findMany({
      where: {
        ejecucionId: { in: ejecucionIds },
      },
      include: {
        items: {
          include: { templateItem: true },
          orderBy: { createdAt: 'asc' },
        },
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return checklists.map(c => ChecklistPrismaMapper.ejecucionToDomain(c));
  }

  async findByEjecucion(ejecucionId: string): Promise<Checklist[]> {
    const checklists = await this.prisma.checklistEjecucion.findMany({
      where: { ejecucionId },
      include: {
        items: {
          include: { templateItem: true },
          orderBy: { createdAt: 'asc' },
        },
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return checklists.map(c => ChecklistPrismaMapper.ejecucionToDomain(c));
  }

  async existsAssigned(
    templateId: string,
    ordenId?: string,
    ejecucionId?: string
  ): Promise<boolean> {
    if (ejecucionId) {
      const exists = await this.prisma.checklistEjecucion.findFirst({
        where: {
          templateId,
          ejecucionId,
        },
      });
      return !!exists;
    }

    if (ordenId) {
      // Buscar a través de ejecuciones de la orden
      const ejecuciones = await this.prisma.ejecucion.findMany({
        where: { ordenId },
        select: { id: true },
      });

      const ejecucionIds = ejecuciones.map(e => e.id);

      const exists = await this.prisma.checklistEjecucion.findFirst({
        where: {
          templateId,
          ejecucionId: { in: ejecucionIds },
        },
      });

      return !!exists;
    }

    return false;
  }

  async delete(id: string): Promise<void> {
    // Intentar eliminar como template
    try {
      await this.prisma.checklistTemplate.delete({
        where: { id },
      });
      return;
    } catch (error) {
      // Si no es template, intentar como ejecución
    }

    // Eliminar como ejecución
    await this.prisma.checklistEjecucion.delete({
      where: { id },
    });
  }
}
