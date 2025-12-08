import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { cacheManager } from '../../config/redis.js';

interface InspeccionItemInput {
    rubro: string;
    descripcion?: string;
    estado: 'OK' | 'RECHAZADO';
    notas?: string;
}

export class HESService {
    /**
     * Crear equipo HES
     */
    async createEquipo(data: {
        numero: string;
        marca: string;
        tipo: string;
        especificaciones?: any;
    }) {
        try {
            const equipo = await prisma.equipoHES.create({
                data: {
                    ...data,
                    ultimaInspeccion: new Date(),
                    proximaInspeccion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
                },
            });

            logger.info(`Equipo HES creado: ${equipo.id}`, { numero: data.numero });
            return equipo;
        } catch (error) {
            logger.error('Error creating HES equipment:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los equipos
     */
    async getAllEquipos(filters?: { tipo?: string; estado?: string }) {
        try {
            const where: any = {};
            if (filters?.tipo) where.tipo = filters.tipo;
            if (filters?.estado) where.estado = filters.estado;

            const equipos = await prisma.equipoHES.findMany({
                where,
                include: {
                    inspecciones: {
                        orderBy: { fechaInspeccion: 'desc' },
                        take: 1,
                    },
                },
            });

            return equipos;
        } catch (error) {
            logger.error('Error fetching HES equipment:', error);
            throw error;
        }
    }

    /**
     * Crear inspección HES
     */
    async createInspeccion(data: {
        equipoId: string;
        inspectorId: string;
        ordenId?: string;
        items: InspeccionItemInput[];
        fotosEvidencia?: string[];
    }) {
        try {
            // Validar equipo
            const equipo = await prisma.equipoHES.findUnique({
                where: { id: data.equipoId },
            });

            if (!equipo) {
                throw new Error('Equipo HES no encontrado');
            }

            // Crear inspección
            const inspeccion = await prisma.inspeccionHES.create({
                data: {
                    equipoId: data.equipoId,
                    inspectorId: data.inspectorId,
                    ordenId: data.ordenId,
                    fotosEvidencia: data.fotosEvidencia || [],
                    items: {
                        create: data.items,
                    },
                    estado: data.items.every((item) => item.estado === 'OK')
                        ? 'OK'
                        : 'RECHAZADO',
                    observaciones: this.generateObservaciones(data.items),
                },
                include: {
                    items: true,
                    equipo: true,
                },
            });

            // Actualizar estado del equipo
            const nuevoEstado = inspeccion.estado === 'OK' ? 'DISPONIBLE' : 'EN_MANTENIMIENTO';
            await prisma.equipoHES.update({
                where: { id: data.equipoId },
                data: {
                    estado: nuevoEstado,
                    ultimaInspeccion: new Date(),
                    proximaInspeccion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });

            // Invalidar cache
            await cacheManager.deletePattern('hes:*');

            logger.info(`Inspección HES creada: ${inspeccion.id}`, {
                equipoId: data.equipoId,
                estado: inspeccion.estado,
            });

            return inspeccion;
        } catch (error) {
            logger.error('Error creating HES inspection:', error);
            throw error;
        }
    }

    /**
     * Obtener inspecciones de un equipo
     */
    async getInspeccionesByEquipo(equipoId: string) {
        try {
            const cacheKey = `hes:inspecciones:${equipoId}`;

            const cached = await cacheManager.get(cacheKey);
            if (cached) return cached;

            const inspecciones = await prisma.inspeccionHES.findMany({
                where: { equipoId },
                include: {
                    items: true,
                    inspector: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { fechaInspeccion: 'desc' },
            });

            await cacheManager.set(cacheKey, inspecciones, 60 * 60);

            return inspecciones;
        } catch (error) {
            logger.error('Error fetching inspections:', error);
            throw error;
        }
    }

    /**
     * Generar reporte de estado
     */
    async generateStatusReport() {
        try {
            const cacheKey = 'hes:status-report';

            const cached = await cacheManager.get(cacheKey);
            if (cached) return cached;

            const [totalEquipos, disponibles, enMantenimiento, rechazados] =
                await Promise.all([
                    prisma.equipoHES.count(),
                    prisma.equipoHES.count({ where: { estado: 'DISPONIBLE' } }),
                    prisma.equipoHES.count({ where: { estado: 'EN_MANTENIMIENTO' } }),
                    prisma.equipoHES.count({ where: { estado: 'RECHAZADO' } }),
                ]);

            // Equipos sin inspeccionar en últimos 30 días
            const treintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const sinInspeccionar = await prisma.equipoHES.count({
                where: {
                    ultimaInspeccion: {
                        lt: treintaDiasAtras,
                    },
                },
            });

            const report = {
                totalEquipos,
                disponibles,
                enMantenimiento,
                rechazados,
                sinInspeccionar,
                tasaDisponibilidad: totalEquipos > 0 ? ((disponibles / totalEquipos) * 100).toFixed(2) : "0",
                ultimaActualizacion: new Date(),
            };

            await cacheManager.set(cacheKey, report, 60 * 60);

            return report;
        } catch (error) {
            logger.error('Error generating status report:', error);
            throw error;
        }
    }

    /**
     * Asignar equipos a orden
     */
    async assignEquiposToOrden(
        ordenId: string,
        equipos: { equipoId: string; cantidad: number }[]
    ) {
        try {
            // Validar que todos los equipos estén disponibles
            for (const equipo of equipos) {
                const eq = await prisma.equipoHES.findUnique({
                    where: { id: equipo.equipoId },
                });

                if (eq?.estado !== 'DISPONIBLE') {
                    throw new Error(
                        `Equipo ${eq?.numero} no está disponible (${eq?.estado})`
                    );
                }
            }

            // Crear asignaciones
            const asignaciones = await Promise.all(
                equipos.map((e) =>
                    prisma.ordenEquipoHES.create({
                        data: {
                            ordenId,
                            equipoId: e.equipoId,
                            cantidad: e.cantidad,
                        },
                    })
                )
            );

            // Marcar orden como cumpliendo HES
            await prisma.order.update({
                where: { id: ordenId },
                data: { cumplimientoHES: true },
            });

            logger.info(`Equipos HES asignados a orden: ${ordenId}`, {
                cantidad: asignaciones.length,
            });

            return asignaciones;
        } catch (error) {
            logger.error('Error assigning HES equipment:', error);
            throw error;
        }
    }

    /**
     * Devolución de equipos
     */
    async returnEquipos(ordenId: string, equipos: { equipoId: string; estado: string }[]) {
        try {
            for (const equipo of equipos) {
                await prisma.ordenEquipoHES.update({
                    where: {
                        ordenId_equipoId: {
                            ordenId,
                            equipoId: equipo.equipoId,
                        },
                    },
                    data: {
                        estado: equipo.estado, // DEVUELTO, DAÑADO
                    },
                });

                // Si está dañado, cambiar estado del equipo a mantenimiento
                if (equipo.estado === 'DAÑADO') {
                    await prisma.equipoHES.update({
                        where: { id: equipo.equipoId },
                        data: { estado: 'EN_MANTENIMIENTO' },
                    });
                }
            }

            logger.info(`Equipos HES devueltos: ${ordenId}`);

            await cacheManager.deletePattern('hes:*');

            return { status: 'success', message: 'Equipos devueltos correctamente' };
        } catch (error) {
            logger.error('Error returning equipment:', error);
            throw error;
        }
    }

    /**
     * Generar observaciones automáticas
     */
    private generateObservaciones(items: InspeccionItemInput[]): string {
        const rechazados = items.filter((i) => i.estado === 'RECHAZADO');

        if (rechazados.length === 0) {
            return 'Todos los ítems cumplen con los estándares de seguridad.';
        }

        const rubrosList = rechazados.map((r) => r.rubro).join(', ');
        return `Rechazado en los siguientes rubros: ${rubrosList}. Equipo requiere mantenimiento inmediato.`;
    }

    // ============================================
    // LÍNEAS DE VIDA
    // ============================================

    /**
     * Obtener todas las inspecciones de líneas de vida
     */
    async getLineasVida(filters?: { estado?: string }) {
        try {
            const where: any = {};
            if (filters?.estado) where.estado = filters.estado;

            const inspecciones = await prisma.inspeccionLineaVida.findMany({
                where,
                include: {
                    inspector: {
                        select: { id: true, name: true },
                    },
                    componentes: true,
                },
                orderBy: { fechaInspeccion: 'desc' },
            });

            return inspecciones;
        } catch (error) {
            logger.error('Error fetching lineas de vida:', error);
            throw error;
        }
    }

    /**
     * Obtener una inspección de línea de vida por ID
     */
    async getLineaVidaById(id: string) {
        try {
            const inspeccion = await prisma.inspeccionLineaVida.findUnique({
                where: { id },
                include: {
                    inspector: {
                        select: { id: true, name: true, email: true },
                    },
                    componentes: {
                        include: {
                            condiciones: true,
                        },
                    },
                },
            });

            return inspeccion;
        } catch (error) {
            logger.error('Error fetching linea de vida:', error);
            throw error;
        }
    }

    /**
     * Crear inspección de línea de vida
     */
    async createLineaVida(data: {
        numeroLinea: string;
        fabricante: string;
        ubicacion: string;
        diametroCable?: string;
        tipoCable?: string;
        observaciones?: string;
        estado: 'CONFORME' | 'NO_CONFORME' | 'PENDIENTE';
        inspectorId: string;
        componentes: {
            nombre: string;
            estado: string;
            hallazgos?: string;
            accionCorrectiva?: string;
        }[];
    }) {
        try {
            const inspeccion = await prisma.inspeccionLineaVida.create({
                data: {
                    numeroLinea: data.numeroLinea,
                    fabricante: data.fabricante,
                    ubicacion: data.ubicacion,
                    diametroCable: data.diametroCable || '8mm',
                    tipoCable: data.tipoCable || 'Acero Inoxidable',
                    observaciones: data.observaciones,
                    estado: data.estado,
                    inspectorId: data.inspectorId,
                    componentes: {
                        create: data.componentes.map(c => ({
                            nombre: c.nombre,
                            estado: c.estado,
                            hallazgos: c.hallazgos,
                            accionCorrectiva: c.accionCorrectiva,
                        })),
                    },
                },
                include: {
                    componentes: true,
                    inspector: {
                        select: { id: true, name: true },
                    },
                },
            });

            logger.info(`Inspección línea de vida creada: ${inspeccion.id}`, {
                numeroLinea: data.numeroLinea,
                estado: data.estado,
            });

            return inspeccion;
        } catch (error) {
            logger.error('Error creating linea de vida inspection:', error);
            throw error;
        }
    }
}

export const hesService = new HESService();
