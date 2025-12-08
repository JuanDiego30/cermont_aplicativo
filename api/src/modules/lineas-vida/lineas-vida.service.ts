// ============================================
// INSPECCIÓN LÍNEAS DE VIDA SERVICE - Cermont FSM
// Formato OPE-006 - Inspección de líneas de vida verticales
// ============================================

import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/AppError.js';
import { 
    EstadoInspeccion,
    type CreateInspeccionLineaVidaDTO, 
    type UpdateInspeccionLineaVidaDTO, 
    type InspeccionLineaVidaFilters,
    type InspeccionLineaVidaConRelaciones,
    TEMPLATE_INSPECCION,
} from './lineas-vida.types.js';
import { Prisma } from '@prisma/client';

// Includes comunes
const inspeccionIncludes = {
    inspector: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    },
    componentes: {
        include: {
            condiciones: true,
        },
        orderBy: {
            nombre: 'asc' as const,
        }
    }
} as const;

export class LineasVidaService {
    
    /**
     * Crear nueva inspección de línea de vida
     */
    async create(inspectorId: string, data: CreateInspeccionLineaVidaDTO): Promise<InspeccionLineaVidaConRelaciones> {
        logger.info(`Creando inspección de línea de vida: ${data.numeroLinea}`);

        // Verificar si ya existe una línea con ese número
        const existingLine = await prisma.inspeccionLineaVida.findUnique({
            where: { numeroLinea: data.numeroLinea },
        });

        if (existingLine) {
            throw new AppError(`Ya existe una línea de vida con el número ${data.numeroLinea}`, 409);
        }

        // Determinar estado general basado en componentes
        const estadoGeneral = this.calcularEstadoGeneral(data.componentes);

        try {
            const inspeccion = await prisma.$transaction(async (tx) => {
                // Crear la inspección
                const newInspeccion = await tx.inspeccionLineaVida.create({
                    data: {
                        numeroLinea: data.numeroLinea,
                        fabricante: data.fabricante,
                        diametroCable: data.diametroCable,
                        tipoCable: data.tipoCable,
                        ubicacion: data.ubicacion,
                        especificaciones: data.especificaciones || Prisma.JsonNull,
                        fechaInstalacion: data.fechaInstalacion,
                        fechaUltimoMantenimiento: data.fechaUltimoMantenimiento,
                        inspectorId,
                        estado: estadoGeneral,
                        accionesCorrectivas: data.accionesCorrectivas,
                        observaciones: data.observaciones,
                        fotosEvidencia: data.fotosEvidencia || [],
                    },
                });

                // Crear componentes con sus condiciones
                for (const componente of data.componentes) {
                    const newComponente = await tx.componenteLineaVida.create({
                        data: {
                            inspeccionId: newInspeccion.id,
                            nombre: componente.nombre,
                            hallazgos: componente.hallazgos,
                            estado: componente.estado,
                            accionCorrectiva: componente.accionCorrectiva,
                        },
                    });

                    // Crear condiciones del componente
                    if (componente.condiciones && componente.condiciones.length > 0) {
                        await tx.condicionComponente.createMany({
                            data: componente.condiciones.map(cond => ({
                                componenteId: newComponente.id,
                                tipoAfeccion: cond.tipoAfeccion,
                                descripcion: cond.descripcion,
                                estado: cond.estado,
                            })),
                        });
                    }
                }

                // Retornar con relaciones
                return tx.inspeccionLineaVida.findUnique({
                    where: { id: newInspeccion.id },
                    include: inspeccionIncludes,
                });
            });

            logger.info(`Inspección de línea de vida creada: ${inspeccion!.id}`);
            return inspeccion as unknown as InspeccionLineaVidaConRelaciones;
        } catch (error) {
            logger.error('Error al crear inspección de línea de vida:', error);
            throw error;
        }
    }

    /**
     * Obtener inspección por ID
     */
    async findById(id: string): Promise<InspeccionLineaVidaConRelaciones> {
        const inspeccion = await prisma.inspeccionLineaVida.findUnique({
            where: { id },
            include: inspeccionIncludes,
        });

        if (!inspeccion) {
            throw new AppError('Inspección no encontrada', 404);
        }

        return inspeccion as unknown as InspeccionLineaVidaConRelaciones;
    }

    /**
     * Obtener inspección por número de línea
     */
    async findByNumeroLinea(numeroLinea: string): Promise<InspeccionLineaVidaConRelaciones> {
        const inspeccion = await prisma.inspeccionLineaVida.findUnique({
            where: { numeroLinea },
            include: inspeccionIncludes,
        });

        if (!inspeccion) {
            throw new AppError('Línea de vida no encontrada', 404);
        }

        return inspeccion as unknown as InspeccionLineaVidaConRelaciones;
    }

    /**
     * Listar inspecciones con filtros
     */
    async findAll(filters: InspeccionLineaVidaFilters) {
        const where: Prisma.InspeccionLineaVidaWhereInput = {};

        if (filters.estado) where.estado = filters.estado;
        if (filters.ubicacion) where.ubicacion = { contains: filters.ubicacion, mode: 'insensitive' };
        if (filters.inspectorId) where.inspectorId = filters.inspectorId;
        if (filters.fechaDesde || filters.fechaHasta) {
            where.fechaInspeccion = {
                ...(filters.fechaDesde && { gte: filters.fechaDesde }),
                ...(filters.fechaHasta && { lte: filters.fechaHasta }),
            };
        }

        const [data, total] = await Promise.all([
            prisma.inspeccionLineaVida.findMany({
                where,
                include: inspeccionIncludes,
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
                orderBy: { fechaInspeccion: 'desc' },
            }),
            prisma.inspeccionLineaVida.count({ where }),
        ]);

        return {
            data: data as unknown as InspeccionLineaVidaConRelaciones[],
            total,
            pages: Math.ceil(total / filters.limit),
        };
    }

    /**
     * Actualizar inspección
     */
    async update(id: string, data: UpdateInspeccionLineaVidaDTO): Promise<InspeccionLineaVidaConRelaciones> {
        logger.info(`Actualizando inspección de línea de vida: ${id}`);

        // Verificar que existe
        await this.findById(id);

        try {
            const inspeccion = await prisma.$transaction(async (tx) => {
                const updateData: Prisma.InspeccionLineaVidaUpdateInput = {};

                if (data.fabricante !== undefined) updateData.fabricante = data.fabricante;
                if (data.diametroCable !== undefined) updateData.diametroCable = data.diametroCable;
                if (data.tipoCable !== undefined) updateData.tipoCable = data.tipoCable;
                if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
                if (data.especificaciones !== undefined) updateData.especificaciones = data.especificaciones || Prisma.JsonNull;
                if (data.fechaInstalacion !== undefined) updateData.fechaInstalacion = data.fechaInstalacion;
                if (data.fechaUltimoMantenimiento !== undefined) updateData.fechaUltimoMantenimiento = data.fechaUltimoMantenimiento;
                if (data.accionesCorrectivas !== undefined) updateData.accionesCorrectivas = data.accionesCorrectivas;
                if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
                if (data.fotosEvidencia !== undefined) updateData.fotosEvidencia = data.fotosEvidencia;

                // Si hay componentes, recalcular estado y reemplazar
                if (data.componentes) {
                    updateData.estado = this.calcularEstadoGeneral(data.componentes);

                    // Eliminar componentes existentes (cascade eliminará condiciones)
                    await tx.componenteLineaVida.deleteMany({
                        where: { inspeccionId: id },
                    });

                    // Crear nuevos componentes
                    for (const componente of data.componentes) {
                        const newComponente = await tx.componenteLineaVida.create({
                            data: {
                                inspeccionId: id,
                                nombre: componente.nombre,
                                hallazgos: componente.hallazgos,
                                estado: componente.estado,
                                accionCorrectiva: componente.accionCorrectiva,
                            },
                        });

                        if (componente.condiciones && componente.condiciones.length > 0) {
                            await tx.condicionComponente.createMany({
                                data: componente.condiciones.map(cond => ({
                                    componenteId: newComponente.id,
                                    tipoAfeccion: cond.tipoAfeccion,
                                    descripcion: cond.descripcion,
                                    estado: cond.estado,
                                })),
                            });
                        }
                    }
                } else if (data.estado !== undefined) {
                    updateData.estado = data.estado;
                }

                // Actualizar
                await tx.inspeccionLineaVida.update({
                    where: { id },
                    data: updateData,
                });

                return tx.inspeccionLineaVida.findUnique({
                    where: { id },
                    include: inspeccionIncludes,
                });
            });

            logger.info(`Inspección de línea de vida actualizada: ${id}`);
            return inspeccion as unknown as InspeccionLineaVidaConRelaciones;
        } catch (error) {
            logger.error(`Error al actualizar inspección ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar inspección
     */
    async delete(id: string): Promise<void> {
        logger.info(`Eliminando inspección de línea de vida: ${id}`);

        // Verificar que existe
        await this.findById(id);

        // Los componentes y condiciones se eliminan en cascada
        await prisma.inspeccionLineaVida.delete({ where: { id } });

        logger.info(`Inspección de línea de vida eliminada: ${id}`);
    }

    /**
     * Obtener template de inspección vacío
     */
    getTemplate() {
        return TEMPLATE_INSPECCION;
    }

    /**
     * Generar reporte de inspección
     */
    async generateReport(id: string) {
        const inspeccion = await this.findById(id);

        // Contar componentes por estado
        const conformes = inspeccion.componentes.filter(c => c.estado === 'C').length;
        const noConformes = inspeccion.componentes.filter(c => c.estado === 'NC').length;

        // Extraer hallazgos importantes
        const hallazgosImportantes = inspeccion.componentes
            .filter(c => c.hallazgos && c.hallazgos.trim() !== '')
            .map(c => ({
                componente: c.nombre,
                hallazgo: c.hallazgos,
                accionCorrectiva: c.accionCorrectiva,
            }));

        // Condiciones no conformes
        const condicionesNC = inspeccion.componentes.flatMap(comp => 
            comp.condiciones
                .filter(cond => cond.estado === 'NC')
                .map(cond => ({
                    componente: comp.nombre,
                    condicion: cond.tipoAfeccion,
                    descripcion: cond.descripcion,
                }))
        );

        return {
            inspeccion: {
                id: inspeccion.id,
                numeroLinea: inspeccion.numeroLinea,
                fabricante: inspeccion.fabricante,
                ubicacion: inspeccion.ubicacion,
                fechaInspeccion: inspeccion.fechaInspeccion,
                inspector: inspeccion.inspector,
                estadoGeneral: inspeccion.estado,
            },
            resumen: {
                totalComponentes: inspeccion.componentes.length,
                conformes,
                noConformes,
                porcentajeConformidad: Math.round((conformes / inspeccion.componentes.length) * 100),
            },
            hallazgos: hallazgosImportantes,
            condicionesNoConformes: condicionesNC,
            accionesCorrectivas: inspeccion.accionesCorrectivas,
            observaciones: inspeccion.observaciones,
            fotosEvidencia: inspeccion.fotosEvidencia,
        };
    }

    /**
     * Obtener estadísticas de líneas de vida
     */
    async getEstadisticas() {
        const [total, conformes, noConformes, pendientes] = await Promise.all([
            prisma.inspeccionLineaVida.count(),
            prisma.inspeccionLineaVida.count({ where: { estado: EstadoInspeccion.CONFORME } }),
            prisma.inspeccionLineaVida.count({ where: { estado: EstadoInspeccion.NO_CONFORME } }),
            prisma.inspeccionLineaVida.count({ where: { estado: EstadoInspeccion.PENDIENTE } }),
        ]);

        // Inspecciones recientes (últimos 30 días)
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        const recientes = await prisma.inspeccionLineaVida.count({
            where: { fechaInspeccion: { gte: hace30Dias } },
        });

        return {
            total,
            porEstado: { conformes, noConformes, pendientes },
            inspeccionesUltimos30Dias: recientes,
            porcentajeConformidad: total > 0 ? Math.round((conformes / total) * 100) : 0,
        };
    }

    /**
     * Calcular estado general basado en componentes
     */
    private calcularEstadoGeneral(componentes: { estado: 'C' | 'NC' }[]): EstadoInspeccion {
        if (componentes.length === 0) return EstadoInspeccion.PENDIENTE;
        
        const tieneNC = componentes.some(c => c.estado === 'NC');
        return tieneNC ? EstadoInspeccion.NO_CONFORME : EstadoInspeccion.CONFORME;
    }
}

export const lineasVidaService = new LineasVidaService();
