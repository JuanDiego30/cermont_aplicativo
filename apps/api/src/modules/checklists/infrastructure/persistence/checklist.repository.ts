/**
 * @repository ChecklistRepository
 * Usa los modelos ChecklistTemplate y ChecklistEjecucion de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateChecklistDto,
  ChecklistData,
  IChecklistRepository,
  ToggleItemDto,
  ItemResponseData,
} from '../../application/dto';

@Injectable()
export class ChecklistRepository implements IChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ChecklistData[]> {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: { activo: true },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return templates.map(this.mapToChecklistData);
  }

  async findById(id: string): Promise<ChecklistData | null> {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return template ? this.mapToChecklistData(template) : null;
  }

  async findByTipo(tipo: string): Promise<ChecklistData[]> {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: { tipo, activo: true },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return templates.map(this.mapToChecklistData);
  }

  async create(data: CreateChecklistDto): Promise<ChecklistData> {
    const template = await this.prisma.checklistTemplate.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        activo: true,
        items: {
          create: data.items.map((item, index) => ({
            nombre: item.descripcion,
            tipo: 'item',
            orden: item.orden ?? index,
            requereCertificacion: item.requerido,
          })),
        },
      },
      include: { items: { orderBy: { orden: 'asc' } } },
    });

    return this.mapToChecklistData(template);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklistTemplate.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findByEjecucion(ejecucionId: string): Promise<any[]> {
    return this.prisma.checklistEjecucion.findMany({
      where: { ejecucionId },
      include: { items: true },
    });
  }

  async createForEjecucion(ejecucionId: string, templateId: string): Promise<any> {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true },
    });

    if (!template) {
      throw new Error('Template no encontrado');
    }

    return this.prisma.checklistEjecucion.create({
      data: {
        ejecucionId,
        templateId,
        nombre: template.nombre,
        descripcion: template.descripcion,
        items: {
          create: template.items.map((item) => ({
            templateItemId: item.id,
            nombre: item.nombre,
            estado: 'pendiente',
            completado: false,
          })),
        },
      },
      include: { items: true },
    });
  }

  async toggleItem(
    checklistId: string,
    itemId: string,
    data: ToggleItemDto,
  ): Promise<ItemResponseData> {
    const item = await this.prisma.checklistItemEjecucion.update({
      where: { id: itemId },
      data: {
        completado: data.completado,
        observaciones: data.observaciones,
        estado: data.completado ? 'completado' : 'pendiente',
        completadoEn: data.completado ? new Date() : null,
      },
    });

    return {
      itemId: item.id,
      completado: item.completado,
      observaciones: item.observaciones ?? undefined,
    };
  }

  private mapToChecklistData(template: any): ChecklistData {
    return {
      id: template.id,
      nombre: template.nombre,
      descripcion: template.descripcion,
      tipo: template.tipo,
      activo: template.activo,
      items: template.items.map((item: any) => ({
        id: item.id,
        descripcion: item.nombre,
        requerido: item.requereCertificacion,
        orden: item.orden,
      })),
    };
  }
}
