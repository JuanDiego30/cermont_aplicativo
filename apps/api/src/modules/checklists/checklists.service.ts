import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ChecklistItemInput {
    nombre: string;
    descripcion?: string;
    tipo?: string;
}

@Injectable()
export class ChecklistsService {
    constructor(private readonly prisma: PrismaService) { }

    async findByEjecucion(ejecucionId: string) {
        const checklists = await this.prisma.checklistEjecucion.findMany({
            where: { ejecucionId },
            include: { items: true, template: true },
            orderBy: { createdAt: 'asc' },
        });

        return checklists.map(checklist => ({
            ...checklist,
            totalItems: checklist.items.length,
            completados: checklist.items.filter((i) => i.completado).length,
        }));
    }

    async findOne(id: string) {
        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id },
            include: { items: true, template: true },
        });

        if (!checklist) {
            throw new NotFoundException('Checklist no encontrado');
        }

        return {
            ...checklist,
            totalItems: checklist.items.length,
            completados: checklist.items.filter((i) => i.completado).length,
        };
    }

    // Alias for controller compatibility
    async findChecklistById(id: string) {
        return this.findOne(id);
    }

    async create(ejecucionId: string, nombre: string, templateId?: string) {
        const checklist = await this.prisma.checklistEjecucion.create({
            data: {
                ejecucionId,
                nombre,
                templateId: templateId ?? undefined,
                descripcion: '',
            },
            include: { items: true },
        });

        if (templateId) {
            const templateItems = await this.prisma.checklistTemplateItem.findMany({
                where: { templateId },
                orderBy: { orden: 'asc' },
            });

            if (templateItems.length > 0) {
                await this.prisma.checklistItemEjecucion.createMany({
                    data: templateItems.map((item) => ({
                        checklistId: checklist.id,
                        templateItemId: item.id,
                        nombre: item.nombre,
                        estado: 'pendiente',
                        completado: false,
                    })),
                });
            }
        }

        return this.findOne(checklist.id);
    }

    async createFromTemplate(dto: { ejecucionId: string; tipo: string }, userId: string) {
        // Find template by tipo (name)
        const template = await this.prisma.checklistTemplate.findFirst({
            where: { OR: [{ tipo: dto.tipo }, { nombre: dto.tipo }], activo: true },
            include: { items: true },
        });

        const checklist = await this.prisma.checklistEjecucion.create({
            data: {
                ejecucionId: dto.ejecucionId,
                nombre: template?.nombre || dto.tipo,
                templateId: template?.id,
                descripcion: template?.descripcion || '',
                completadoPorId: userId,
            },
        });

        if (template && template.items.length > 0) {
            await this.prisma.checklistItemEjecucion.createMany({
                data: template.items.map((item) => ({
                    checklistId: checklist.id,
                    templateItemId: item.id,
                    nombre: item.nombre,
                    estado: 'pendiente',
                    completado: false,
                })),
            });
        }

        return { message: 'Checklist creado', data: await this.findOne(checklist.id) };
    }

    async addItems(checklistId: string, items: ChecklistItemInput[]) {
        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id: checklistId },
        });

        if (!checklist) {
            throw new NotFoundException('Checklist no encontrado');
        }

        await this.prisma.checklistItemEjecucion.createMany({
            data: items.map((item) => ({
                checklistId,
                nombre: item.nombre,
                estado: 'pendiente',
                completado: false,
            })),
        });

        return this.findOne(checklistId);
    }

    async toggleItem(itemId: string, userId?: string) {
        const item = await this.prisma.checklistItemEjecucion.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new NotFoundException('Item no encontrado');
        }

        const updated = await this.prisma.checklistItemEjecucion.update({
            where: { id: itemId },
            data: {
                completado: !item.completado,
                completadoPorId: !item.completado ? userId : undefined,
                completadoEn: !item.completado ? new Date() : undefined,
            },
        });

        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id: item.checklistId },
            include: { items: true },
        });

        if (checklist) {
            const allCompleted = checklist.items.every((i) => i.completado);
            if (allCompleted !== checklist.completada) {
                await this.prisma.checklistEjecucion.update({
                    where: { id: checklist.id },
                    data: {
                        completada: allCompleted,
                        completadoEn: allCompleted ? new Date() : undefined,
                    },
                });
            }
        }

        return updated;
    }

    async updateItem(itemId: string, data: { observaciones?: string; estado?: string }) {
        const item = await this.prisma.checklistItemEjecucion.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new NotFoundException('Item no encontrado');
        }

        return this.prisma.checklistItemEjecucion.update({
            where: { id: itemId },
            data,
        });
    }

    async updateChecklistItem(itemId: string, updateDto: any, userId: string) {
        const item = await this.prisma.checklistItemEjecucion.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            throw new NotFoundException('Item no encontrado');
        }

        const updated = await this.prisma.checklistItemEjecucion.update({
            where: { id: itemId },
            data: {
                estado: updateDto.estado ?? item.estado,
                observaciones: updateDto.observaciones ?? item.observaciones,
                completado: updateDto.completado ?? item.completado,
                completadoPorId: updateDto.completado ? userId : item.completadoPorId,
                completadoEn: updateDto.completado ? new Date() : item.completadoEn,
            },
        });

        return { message: 'Item actualizado', data: updated };
    }

    async completar(id: string, userId: string) {
        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id },
        });

        if (!checklist) {
            throw new NotFoundException('Checklist no encontrado');
        }

        const updated = await this.prisma.checklistEjecucion.update({
            where: { id },
            data: {
                completada: true,
                completadoPorId: userId,
                completadoEn: new Date(),
            },
        });

        return { message: 'Checklist completado', data: updated };
    }

    async delete(id: string) {
        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id },
        });

        if (!checklist) {
            throw new NotFoundException('Checklist no encontrado');
        }

        await this.prisma.checklistEjecucion.delete({ where: { id } });
        return { message: 'Checklist eliminado correctamente' };
    }

    async getStatistics(ejecucionId: string) {
        const checklists = await this.prisma.checklistEjecucion.findMany({
            where: { ejecucionId },
            include: { items: true },
        });

        const totalChecklists = checklists.length;
        const completedChecklists = checklists.filter((c) => c.completada).length;
        const totalItems = checklists.reduce((sum, c) => sum + c.items.length, 0);
        const completedItems = checklists.reduce(
            (sum, c) => sum + c.items.filter((i) => i.completado).length,
            0
        );

        return {
            totalChecklists,
            completedChecklists,
            pendingChecklists: totalChecklists - completedChecklists,
            totalItems,
            completedItems,
            pendingItems: totalItems - completedItems,
            completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        };
    }

    async getResumenConformidades(ejecucionId: string) {
        const checklists = await this.prisma.checklistEjecucion.findMany({
            where: { ejecucionId },
            include: { items: true },
        });

        const items = checklists.flatMap((c) => c.items);
        const conformes = items.filter((i) => i.estado === 'conforme' || i.completado).length;
        const noConformes = items.filter((i) => i.estado === 'no_conforme').length;
        const pendientes = items.filter((i) => i.estado === 'pendiente' && !i.completado).length;

        return {
            totalChecklists: checklists.length,
            checklistsCompletos: checklists.filter((c) => c.completada).length,
            totalItems: items.length,
            conformes,
            noConformes,
            pendientes,
            porcentajeConformidad: items.length > 0 ? Math.round((conformes / items.length) * 100) : 0,
        };
    }

    async findAllTemplates() {
        return this.prisma.checklistTemplate.findMany({
            where: { activo: true },
            include: { items: true },
            orderBy: { nombre: 'asc' },
        });
    }

    async getTemplatesByTipo(tipo: string) {
        const templates = await this.prisma.checklistTemplate.findMany({
            where: { tipo, activo: true },
            include: { items: { orderBy: { orden: 'asc' } } },
            orderBy: { nombre: 'asc' },
        });
        return { data: templates };
    }

    async createTemplate(nombre: string, tipo: string, descripcion?: string, items?: ChecklistItemInput[]) {
        const template = await this.prisma.checklistTemplate.create({
            data: { nombre, tipo, descripcion },
        });

        if (items && items.length > 0) {
            await this.prisma.checklistTemplateItem.createMany({
                data: items.map((item, index) => ({
                    templateId: template.id,
                    nombre: item.nombre,
                    descripcion: item.descripcion,
                    tipo: item.tipo || 'verificacion',
                    orden: index,
                })),
            });
        }

        return this.prisma.checklistTemplate.findUnique({
            where: { id: template.id },
            include: { items: true },
        });
    }

    async syncOfflineData(ejecucionId: string) {
        // Mark all checklists for this ejecucion as synced
        await this.prisma.checklistEjecucion.updateMany({
            where: { ejecucionId },
            data: { updatedAt: new Date() },
        });

        const checklists = await this.findByEjecucion(ejecucionId);
        return { message: 'Datos sincronizados', data: checklists };
    }
}

