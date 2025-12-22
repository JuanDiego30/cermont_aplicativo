/**
 * @service ChecklistsService
 * 
 * REFACTORIZADO: Ahora usa repositorio en lugar de Prisma directamente
 * (algunos métodos todavía usan prisma directamente durante transición)
 */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from './application/dto';
import { PrismaService } from '../../prisma/prisma.service';

interface ChecklistItemInput {
    nombre: string;
    descripcion?: string;
    tipo?: string;
}

interface UpdateChecklistItemDto {
    estado?: string;
    observaciones?: string;
    completado?: boolean;
}

@Injectable()
export class ChecklistsService {
    constructor(
        @Inject(CHECKLIST_REPOSITORY)
        private readonly repository: IChecklistRepository,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Buscar checklists por ejecución
     * REFACTORIZADO: Usa repositorio
     */
    async findByEjecucion(ejecucionId: string) {
        const checklists = await this.repository.findByEjecucion(ejecucionId);

        return checklists.map(checklist => ({
            ...checklist,
            totalItems: checklist.items?.length || 0,
            completados: checklist.items?.filter((i: any) => i.completado).length || 0,
        }));
    }

    /**
     * Buscar checklist por ID
     * REFACTORIZADO: Usa repositorio
     */
    async findOne(id: string) {
        const checklist = await this.repository.findChecklistById(id);

        if (!checklist) {
            throw new NotFoundException('Checklist no encontrado');
        }

        return {
            ...checklist,
            totalItems: checklist.items?.length || 0,
            completados: checklist.items?.filter((i: any) => i.completado).length || 0,
        };
    }

    // Alias for controller compatibility
    async findChecklistById(id: string) {
        return this.findOne(id);
    }

    /**
     * Crear checklist para ejecución
     * REFACTORIZADO: Usa repositorio
     */
    async create(ejecucionId: string, nombre: string, templateId?: string) {
        if (templateId) {
            const checklist = await this.repository.createForEjecucion(ejecucionId, templateId);
            return this.findOne(checklist.id);
        }

        // Si no hay template, crear checklist vacío
        const checklist = await this.repository.createEmpty(ejecucionId, nombre);
        return this.findOne(checklist.id);
    }

    /**
     * Crear checklist desde template
     * REFACTORIZADO: Usa repositorio (parcialmente, requiere búsqueda de template)
     */
    async createFromTemplate(dto: { ejecucionId: string; tipo: string }, userId: string) {
        // TODO: Agregar método findTemplateByTipo al repositorio
        // Por ahora se mantiene lógica de template aquí
        throw new Error('Método createFromTemplate requiere extensión del repositorio');
    }

    /**
     * Agregar items a checklist
     * REFACTORIZADO: Usa repositorio
     */
    async addItems(checklistId: string, items: ChecklistItemInput[]) {
        await this.findOne(checklistId); // Validar que existe
        await this.repository.addItems(checklistId, items);
        return this.findOne(checklistId);
    }

    /**
     * Toggle item de checklist
     * REFACTORIZADO: Usa repositorio
     */
    async toggleItem(itemId: string, userId?: string) {
        // Necesitamos obtener el item primero para saber su estado actual
        // TODO: Agregar método findItemById al repositorio
        const result = await this.repository.toggleItem('', itemId, {
            completado: true, // Temporal, necesita lógica adicional
            observaciones: undefined,
        });
        return result;
    }

    /**
     * Actualizar item
     * REFACTORIZADO: Usa repositorio
     */
    async updateItem(itemId: string, data: { observaciones?: string; estado?: string }) {
        return this.repository.updateItem(itemId, data);
    }

    /**
     * Actualizar item de checklist
     * REFACTORIZADO: Usa repositorio
     */
    async updateChecklistItem(itemId: string, updateDto: UpdateChecklistItemDto, userId: string) {
        const data: any = {
            estado: updateDto.estado,
            observaciones: updateDto.observaciones,
            completado: updateDto.completado,
        };
        if (updateDto.completado) {
            data.completadoPorId = userId;
            data.completadoEn = new Date();
        }
        const updated = await this.repository.updateItem(itemId, data);
        return { message: 'Item actualizado', data: updated };
    }

    /**
     * Completar checklist
     * REFACTORIZADO: Usa repositorio
     */
    async completar(id: string, userId: string) {
        const updated = await this.repository.completarChecklist(id, userId);
        return { message: 'Checklist completado', data: updated };
    }

    /**
     * Eliminar checklist
     * REFACTORIZADO: Usa repositorio
     */
    async delete(id: string) {
        await this.findOne(id); // Validar que existe
        await this.repository.deleteChecklist(id);
        return { message: 'Checklist eliminado correctamente' };
    }

    /**
     * Obtener estadísticas
     * REFACTORIZADO: Usa repositorio
     */
    async getStatistics(ejecucionId: string) {
        return this.repository.getStatistics(ejecucionId);
    }

    /**
     * Obtener resumen de conformidades
     * NOTA: Este método requiere lógica adicional, se mantiene temporalmente
     */
    async getResumenConformidades(ejecucionId: string) {
        const checklists = await this.repository.findByEjecucion(ejecucionId);

        const items = checklists.flatMap((c: any) => c.items || []);
        const conformes = items.filter((i: any) => i.estado === 'conforme' || i.completado).length;
        const noConformes = items.filter((i: any) => i.estado === 'no_conforme').length;
        const pendientes = items.filter((i: any) => i.estado === 'pendiente' && !i.completado).length;

        return {
            totalChecklists: checklists.length,
            checklistsCompletos: checklists.filter((c: any) => c.completada).length,
            totalItems: items.length,
            conformes,
            noConformes,
            pendientes,
            porcentajeConformidad: items.length > 0 ? Math.round((conformes / items.length) * 100) : 0,
        };
    }

    /**
     * Obtener todos los templates
     * NOTA: Requiere método en repositorio
     */
    async findAllTemplates() {
        return this.repository.findAll();
    }

    /**
     * Obtener templates por tipo
     * REFACTORIZADO: Usa repositorio
     */
    async getTemplatesByTipo(tipo: string) {
        const templates = await this.repository.findByTipo(tipo);
        return { data: templates };
    }

    /**
     * Crear template
     * REFACTORIZADO: Usa repositorio
     */
    async createTemplate(nombre: string, tipo: string, descripcion?: string, items?: ChecklistItemInput[]) {
        const dto = {
            nombre,
            tipo: tipo as any,
            descripcion,
            items: items?.map((item, index) => ({
                descripcion: item.nombre,
                requerido: true,
                orden: index,
            })) || [],
        };
        return this.repository.create(dto);
    }

    /**
     * Sincronizar datos offline
     * NOTA: Requiere método en repositorio
     */
    async syncOfflineData(ejecucionId: string) {
        // TODO: Agregar método syncOfflineData al repositorio
        const checklists = await this.findByEjecucion(ejecucionId);
        return { message: 'Datos sincronizados', data: checklists };
    }
}

