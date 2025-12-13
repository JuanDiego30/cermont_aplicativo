/**
 * @repository ChecklistRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IChecklistRepository,
  ChecklistData,
  CreateChecklistInput,
  ChecklistOrdenData,
  ChecklistOrdenItemData,
} from '../../domain/repositories';

@Injectable()
export class ChecklistRepository implements IChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ChecklistData[]> {
    const checklists = await this.prisma.checklist.findMany({
      include: { items: { orderBy: { orden: 'asc' } } },
    });
    return checklists.map(this.toDomain);
  }

  async findById(id: string): Promise<ChecklistData | null> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: { items: { orderBy: { orden: 'asc' } } },
    });
    return checklist ? this.toDomain(checklist) : null;
  }

  async findByTipo(tipo: string): Promise<ChecklistData[]> {
    const checklists = await this.prisma.checklist.findMany({
      where: { tipo },
      include: { items: { orderBy: { orden: 'asc' } } },
    });
    return checklists.map(this.toDomain);
  }

  async create(data: CreateChecklistInput): Promise<ChecklistData> {
    const checklist = await this.prisma.checklist.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        items: {
          create: data.items.map((item) => ({
            descripcion: item.descripcion,
            requerido: item.requerido,
            orden: item.orden,
          })),
        },
      },
      include: { items: { orderBy: { orden: 'asc' } } },
    });
    return this.toDomain(checklist);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklist.delete({ where: { id } });
  }

  async findByOrden(ordenId: string): Promise<ChecklistOrdenData[]> {
    const checklistsOrden = await this.prisma.checklistOrden.findMany({
      where: { ordenId },
      include: {
        checklist: { include: { items: true } },
        items: true,
      },
    });

    return checklistsOrden.map((co) => ({
      id: co.id,
      checklistId: co.checklistId,
      ordenId: co.ordenId,
      completado: co.completado,
      items: co.items.map((i) => ({
        itemId: i.itemId,
        completado: i.completado,
        observaciones: i.observaciones ?? undefined,
      })),
    }));
  }

  async assignToOrden(ordenId: string, checklistId: string): Promise<ChecklistOrdenData> {
    const assignment = await this.prisma.checklistOrden.create({
      data: {
        ordenId,
        checklistId,
        completado: false,
      },
      include: { items: true },
    });

    return {
      id: assignment.id,
      checklistId: assignment.checklistId,
      ordenId: assignment.ordenId,
      completado: assignment.completado,
      items: [],
    };
  }

  async toggleItem(
    ordenId: string,
    checklistId: string,
    itemId: string,
    completado: boolean,
    observaciones?: string,
  ): Promise<ChecklistOrdenItemData> {
    const checklistOrden = await this.prisma.checklistOrden.findFirst({
      where: { ordenId, checklistId },
    });

    if (!checklistOrden) {
      throw new Error('Checklist no asignado a esta orden');
    }

    const item = await this.prisma.checklistOrdenItem.upsert({
      where: {
        checklistOrdenId_itemId: {
          checklistOrdenId: checklistOrden.id,
          itemId,
        },
      },
      create: {
        checklistOrdenId: checklistOrden.id,
        itemId,
        completado,
        observaciones,
      },
      update: {
        completado,
        observaciones,
      },
    });

    return {
      itemId: item.itemId,
      completado: item.completado,
      observaciones: item.observaciones ?? undefined,
    };
  }

  private toDomain(raw: any): ChecklistData {
    return {
      id: raw.id,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      tipo: raw.tipo,
      items: raw.items.map((i: any) => ({
        id: i.id,
        descripcion: i.descripcion,
        requerido: i.requerido,
        orden: i.orden,
      })),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
