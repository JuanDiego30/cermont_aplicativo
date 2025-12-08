// ============================================
// CHECKLISTS SERVICE - Cermont FSM
// Digital Checklists for Execution Verification
// ============================================

import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import { z } from 'zod';

// ============================================
// SCHEMAS
// ============================================

export const crearChecklistTemplateSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido'),
    descripcion: z.string().optional(),
    tipoTrabajo: z.string(), // instalacion, mantenimiento, inspeccion
    items: z.array(z.object({
        orden: z.number().int().nonnegative(),
        descripcion: z.string().min(1),
        obligatorio: z.boolean().default(true),
        tipo: z.enum(['verificacion', 'medicion', 'foto', 'texto']).default('verificacion'),
    })),
});

export const ejecutarChecklistSchema = z.object({
    templateId: z.string().uuid().optional(),
    ordenId: z.string().uuid(),
    ejecucionId: z.string().uuid().optional(),
    items: z.array(z.object({
        itemId: z.string().optional(),
        descripcion: z.string(),
        completado: z.boolean(),
        valor: z.string().optional(), // Para mediciones o texto
        fotoUrl: z.string().optional(),
        observaciones: z.string().optional(),
    })),
    firmaDigital: z.string().optional(), // Base64 de la firma
    observacionesGenerales: z.string().optional(),
});

// ============================================
// TYPES
// ============================================

export type CrearChecklistTemplateDTO = z.infer<typeof crearChecklistTemplateSchema>;
export type EjecutarChecklistDTO = z.infer<typeof ejecutarChecklistSchema>;

export interface ChecklistTemplate {
    id: string;
    nombre: string;
    descripcion?: string;
    tipoTrabajo: string;
    items: ChecklistItemTemplate[];
    activo: boolean;
    createdAt: Date;
}

export interface ChecklistItemTemplate {
    id: string;
    orden: number;
    descripcion: string;
    obligatorio: boolean;
    tipo: string;
}

export interface ChecklistEjecucion {
    id: string;
    ordenId: string;
    ejecucionId?: string;
    templateId?: string;
    tecnicoId: string;
    estado: 'en_progreso' | 'completado' | 'rechazado';
    items: ChecklistItemEjecucion[];
    firmaDigital?: string;
    observaciones?: string;
    completadoEn?: Date;
    createdAt: Date;
}

export interface ChecklistItemEjecucion {
    id: string;
    descripcion: string;
    completado: boolean;
    valor?: string;
    fotoUrl?: string;
    observaciones?: string;
}

// ============================================
// SERVICE
// ============================================

export class ChecklistsService {
    /**
     * Crear plantilla de checklist
     */
    async crearTemplate(data: CrearChecklistTemplateDTO, userId: string): Promise<ChecklistTemplate> {
        logger.info(`Usuario ${userId} creando template de checklist: ${data.nombre}`);

        // Simular creación - en producción usaría Prisma con modelo ChecklistTemplate
        const template: ChecklistTemplate = {
            id: crypto.randomUUID(),
            nombre: data.nombre,
            descripcion: data.descripcion,
            tipoTrabajo: data.tipoTrabajo,
            items: data.items.map((item, idx) => ({
                id: crypto.randomUUID(),
                orden: item.orden ?? idx,
                descripcion: item.descripcion,
                obligatorio: item.obligatorio,
                tipo: item.tipo,
            })),
            activo: true,
            createdAt: new Date(),
        };

        logger.info(`Template creado: ${template.id}`);
        return template;
    }

    /**
     * Obtener templates por tipo de trabajo
     */
    async getTemplatesByTipo(tipoTrabajo?: string): Promise<ChecklistTemplate[]> {
        // Templates predefinidos basados en los kits
        const templates: ChecklistTemplate[] = [
            {
                id: 'template-instalacion-electrica',
                nombre: 'Checklist Instalación Eléctrica',
                descripcion: 'Verificaciones para instalaciones eléctricas',
                tipoTrabajo: 'instalacion',
                activo: true,
                createdAt: new Date(),
                items: [
                    { id: '1', orden: 1, descripcion: 'Verificar voltaje de alimentación', obligatorio: true, tipo: 'medicion' },
                    { id: '2', orden: 2, descripcion: 'Comprobar continuidad de cables', obligatorio: true, tipo: 'verificacion' },
                    { id: '3', orden: 3, descripcion: 'Verificar puesta a tierra', obligatorio: true, tipo: 'verificacion' },
                    { id: '4', orden: 4, descripcion: 'Medir resistencia de aislamiento', obligatorio: true, tipo: 'medicion' },
                    { id: '5', orden: 5, descripcion: 'Foto del tablero eléctrico', obligatorio: true, tipo: 'foto' },
                    { id: '6', orden: 6, descripcion: 'Verificar etiquetado de circuitos', obligatorio: false, tipo: 'verificacion' },
                ],
            },
            {
                id: 'template-mantenimiento-preventivo',
                nombre: 'Checklist Mantenimiento Preventivo',
                descripcion: 'Verificaciones para mantenimiento preventivo',
                tipoTrabajo: 'mantenimiento',
                activo: true,
                createdAt: new Date(),
                items: [
                    { id: '1', orden: 1, descripcion: 'Inspección visual del equipo', obligatorio: true, tipo: 'verificacion' },
                    { id: '2', orden: 2, descripcion: 'Limpieza de componentes', obligatorio: true, tipo: 'verificacion' },
                    { id: '3', orden: 3, descripcion: 'Lubricación de partes móviles', obligatorio: true, tipo: 'verificacion' },
                    { id: '4', orden: 4, descripcion: 'Foto antes del mantenimiento', obligatorio: true, tipo: 'foto' },
                    { id: '5', orden: 5, descripcion: 'Foto después del mantenimiento', obligatorio: true, tipo: 'foto' },
                    { id: '6', orden: 6, descripcion: 'Medición de parámetros', obligatorio: false, tipo: 'medicion' },
                ],
            },
            {
                id: 'template-seguridad-hes',
                nombre: 'Checklist Seguridad en Alturas HES',
                descripcion: 'Verificaciones de seguridad antes de trabajo en alturas',
                tipoTrabajo: 'seguridad',
                activo: true,
                createdAt: new Date(),
                items: [
                    { id: '1', orden: 1, descripcion: 'Arnés en buen estado', obligatorio: true, tipo: 'verificacion' },
                    { id: '2', orden: 2, descripcion: 'Línea de vida instalada', obligatorio: true, tipo: 'verificacion' },
                    { id: '3', orden: 3, descripcion: 'Casco de seguridad', obligatorio: true, tipo: 'verificacion' },
                    { id: '4', orden: 4, descripcion: 'Punto de anclaje certificado', obligatorio: true, tipo: 'verificacion' },
                    { id: '5', orden: 5, descripcion: 'Foto de EPP completo', obligatorio: true, tipo: 'foto' },
                    { id: '6', orden: 6, descripcion: 'ATS firmado', obligatorio: true, tipo: 'verificacion' },
                ],
            },
        ];

        if (tipoTrabajo) {
            return templates.filter(t => t.tipoTrabajo === tipoTrabajo);
        }
        return templates;
    }

    /**
     * Ejecutar checklist para una orden
     */
    async ejecutarChecklist(data: EjecutarChecklistDTO, tecnicoId: string): Promise<ChecklistEjecucion> {
        logger.info(`Técnico ${tecnicoId} ejecutando checklist para orden ${data.ordenId}`);

        // Verificar orden
        const orden = await prisma.order.findUnique({ where: { id: data.ordenId } });
        if (!orden) {
            throw AppError.notFound('Orden');
        }

        // Validar items obligatorios
        const itemsIncompletos = data.items.filter(i => !i.completado);
        const todosCompletados = itemsIncompletos.length === 0;

        const ejecucion: ChecklistEjecucion = {
            id: crypto.randomUUID(),
            ordenId: data.ordenId,
            ejecucionId: data.ejecucionId,
            templateId: data.templateId,
            tecnicoId,
            estado: todosCompletados ? 'completado' : 'en_progreso',
            items: data.items.map(item => ({
                id: item.itemId || crypto.randomUUID(),
                descripcion: item.descripcion,
                completado: item.completado,
                valor: item.valor,
                fotoUrl: item.fotoUrl,
                observaciones: item.observaciones,
            })),
            firmaDigital: data.firmaDigital,
            observaciones: data.observacionesGenerales,
            completadoEn: todosCompletados ? new Date() : undefined,
            createdAt: new Date(),
        };

        logger.info(`Checklist ejecutado: ${ejecucion.id} - Estado: ${ejecucion.estado}`);
        return ejecucion;
    }

    /**
     * Obtener checklist del kit asociado a la orden
     */
    async getChecklistFromKit(ordenId: string): Promise<string[]> {
        const orden = await prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                planeacion: {
                    include: { kit: true },
                },
            },
        });

        if (!orden) {
            throw AppError.notFound('Orden');
        }

        const kit = orden.planeacion?.kit;
        if (!kit) {
            return [];
        }

        return kit.checklistItems || [];
    }

    /**
     * Obtener ejecuciones de checklist de una orden
     */
    async getChecklistsByOrden(ordenId: string): Promise<ChecklistEjecucion[]> {
        // En producción, consultaría la tabla de ejecuciones
        // Por ahora retorna array vacío
        return [];
    }

    /**
     * Verificar si todos los checklists obligatorios están completados
     */
    async verificarCompletitud(ordenId: string): Promise<{ completo: boolean; pendientes: string[] }> {
        const checklists = await this.getChecklistsByOrden(ordenId);

        const pendientes = checklists
            .filter(c => c.estado !== 'completado')
            .map(c => c.id);

        return {
            completo: pendientes.length === 0,
            pendientes,
        };
    }
}

export const checklistsService = new ChecklistsService();
