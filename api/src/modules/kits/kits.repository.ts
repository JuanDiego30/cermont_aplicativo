// ============================================
// KITS TÍPICOS REPOSITORY - Cermont FSM
// ============================================

import { prisma } from '../../config/database.js';
import type { CreateKitInput, UpdateKitInput, KitFilters } from './kits.types.js';

export class KitsRepository {
    
    /**
     * Buscar todos los kits con filtros y paginación
     */
    async findAll(filters: KitFilters) {
        const { search, activo, page, limit } = filters;
        const skip = (page - 1) * limit;

        const where = {
            ...(activo !== undefined && { activo }),
            ...(search && {
                OR: [
                    { nombre: { contains: search, mode: 'insensitive' as const } },
                    { descripcion: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            prisma.kitTipico.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nombre: 'asc' },
                include: {
                    _count: {
                        select: { planeaciones: true },
                    },
                },
            }),
            prisma.kitTipico.count({ where }),
        ]);

        return {
            data,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    /**
     * Buscar kit por ID
     */
    async findById(id: string) {
        return prisma.kitTipico.findUnique({
            where: { id },
            include: {
                planeaciones: {
                    select: {
                        id: true,
                        estado: true,
                        orden: {
                            select: {
                                id: true,
                                numero: true,
                                descripcion: true,
                            },
                        },
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { planeaciones: true },
                },
            },
        });
    }

    /**
     * Buscar kit por nombre
     */
    async findByNombre(nombre: string) {
        return prisma.kitTipico.findUnique({
            where: { nombre },
        });
    }

    /**
     * Crear nuevo kit
     */
    async create(data: CreateKitInput) {
        return prisma.kitTipico.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                herramientas: data.herramientas,
                equipos: data.equipos,
                documentos: data.documentos,
                checklistItems: data.checklistItems,
                duracionEstimadaHoras: data.duracionEstimadaHoras,
                costoEstimado: data.costoEstimado,
            },
        });
    }

    /**
     * Actualizar kit
     */
    async update(id: string, data: UpdateKitInput) {
        return prisma.kitTipico.update({
            where: { id },
            data,
        });
    }

    /**
     * Eliminar kit (soft delete - desactivar)
     */
    async deactivate(id: string) {
        return prisma.kitTipico.update({
            where: { id },
            data: { activo: false },
        });
    }

    /**
     * Eliminar kit permanentemente
     */
    async delete(id: string) {
        return prisma.kitTipico.delete({
            where: { id },
        });
    }

    /**
     * Verificar si kit tiene planeaciones asociadas
     */
    async hasPlaneaciones(id: string): Promise<boolean> {
        const count = await prisma.planeacion.count({
            where: { kitId: id },
        });
        return count > 0;
    }

    /**
     * Obtener kits activos (para selects/dropdowns)
     */
    async findAllActive() {
        return prisma.kitTipico.findMany({
            where: { activo: true },
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                duracionEstimadaHoras: true,
                costoEstimado: true,
            },
            orderBy: { nombre: 'asc' },
        });
    }
}

export const kitsRepository = new KitsRepository();
