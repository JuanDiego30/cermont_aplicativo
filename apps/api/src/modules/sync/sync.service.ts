import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PendingSync {
    id: string;
    tipo: 'EJECUCION' | 'CHECKLIST' | 'EVIDENCIA' | 'TAREA' | 'COSTO';
    operacion: 'CREATE' | 'UPDATE' | 'DELETE';
    datos: any;
    timestamp: string;
    ordenId?: string;
    ejecucionId?: string;
}

export interface SyncResult {
    success: boolean;
    id: string;
    tipo: string;
    mensaje: string;
    nuevoId?: string;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(private readonly prisma: PrismaService) { }

    // =====================================================
    // SINCRONIZACIÓN DE DATOS OFFLINE
    // =====================================================

    async syncPendingData(userId: string, pendingItems: PendingSync[]): Promise<SyncResult[]> {
        this.logger.log(`Iniciando sincronización de ${pendingItems.length} items para usuario ${userId}`);

        const resultados: SyncResult[] = [];

        // Ordenar por timestamp para procesar en orden cronológico
        const sortedItems = [...pendingItems].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        for (const item of sortedItems) {
            try {
                const resultado = await this.procesarItem(item, userId);
                resultados.push(resultado);
            } catch (error) {
                this.logger.error(`Error sincronizando item ${item.id}:`, error);
                resultados.push({
                    success: false,
                    id: item.id,
                    tipo: item.tipo,
                    mensaje: error instanceof Error ? error.message : 'Error desconocido',
                });
            }
        }

        this.logger.log(`Sincronización completada: ${resultados.filter(r => r.success).length}/${resultados.length} exitosos`);

        return resultados;
    }

    private async procesarItem(item: PendingSync, userId: string): Promise<SyncResult> {
        switch (item.tipo) {
            case 'EJECUCION':
                return this.syncEjecucion(item, userId);
            case 'CHECKLIST':
                return this.syncChecklist(item, userId);
            case 'EVIDENCIA':
                return this.syncEvidencia(item, userId);
            case 'TAREA':
                return this.syncTarea(item, userId);
            case 'COSTO':
                return this.syncCosto(item, userId);
            default:
                throw new BadRequestException(`Tipo de sincronización desconocido: ${item.tipo}`);
        }
    }

    // Sincronizar ejecución
    private async syncEjecucion(item: PendingSync, userId: string): Promise<SyncResult> {
        const { operacion, datos, ordenId } = item;

        if (operacion === 'UPDATE' && datos.ejecucionId) {
            await this.prisma.ejecucion.update({
                where: { id: datos.ejecucionId },
                data: {
                    avancePercentaje: datos.avance,
                    horasActuales: datos.horasActuales,
                    observaciones: datos.observaciones,
                    ubicacionGPS: datos.ubicacionGPS,
                    updatedAt: new Date(),
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Ejecución actualizada',
                nuevoId: datos.ejecucionId,
            };
        }

        if (operacion === 'CREATE' && ordenId) {
            const planeacion = await this.prisma.planeacion.findUnique({
                where: { ordenId },
            });

            if (!planeacion) {
                throw new BadRequestException('Orden no tiene planeación aprobada');
            }

            const ejecucion = await this.prisma.ejecucion.create({
                data: {
                    ordenId,
                    planeacionId: planeacion.id,
                    estado: 'EN_PROGRESO',
                    fechaInicio: new Date(datos.fechaInicio || Date.now()),
                    horasEstimadas: datos.horasEstimadas || 8,
                    observacionesInicio: datos.observaciones,
                    ubicacionGPS: datos.ubicacionGPS,
                },
            });

            await this.prisma.order.update({
                where: { id: ordenId },
                data: { estado: 'ejecucion', fechaInicio: new Date() },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Ejecución creada',
                nuevoId: ejecucion.id,
            };
        }

        throw new BadRequestException('Operación de ejecución no válida');
    }

    // Sincronizar checklist
    private async syncChecklist(item: PendingSync, userId: string): Promise<SyncResult> {
        const { operacion, datos } = item;

        if (operacion === 'UPDATE' && datos.checklistId) {
            await this.prisma.checklistEjecucion.update({
                where: { id: datos.checklistId },
                data: {
                    completada: datos.completada,
                    completadoPorId: datos.completada ? userId : null,
                    completadoEn: datos.completada ? new Date() : null,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Checklist actualizado',
                nuevoId: datos.checklistId,
            };
        }

        if (operacion === 'CREATE' && datos.ejecucionId) {
            const checklist = await this.prisma.checklistEjecucion.create({
                data: {
                    ejecucionId: datos.ejecucionId,
                    nombre: datos.nombre || datos.item || 'Checklist sin nombre',
                    completada: datos.completada || false,
                    completadoPorId: datos.completada ? userId : null,
                    completadoEn: datos.completada ? new Date() : null,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Checklist creado',
                nuevoId: checklist.id,
            };
        }

        throw new BadRequestException('Operación de checklist no válida');
    }

    // Sincronizar evidencia
    private async syncEvidencia(item: PendingSync, userId: string): Promise<SyncResult> {
        const { operacion, datos } = item;

        if (operacion === 'CREATE' && datos.ejecucionId && datos.ordenId) {
            // La evidencia ya debe haber sido subida como archivo
            // Aquí solo registramos los metadatos
            const evidencia = await this.prisma.evidenciaEjecucion.create({
                data: {
                    ejecucionId: datos.ejecucionId,
                    ordenId: datos.ordenId,
                    tipo: datos.tipo || 'FOTO',
                    nombreArchivo: datos.nombreArchivo,
                    rutaArchivo: datos.rutaArchivo,
                    tamano: datos.tamano || 0,
                    mimeType: datos.mimeType || 'image/jpeg',
                    descripcion: datos.descripcion || '',
                    ubicacionGPS: datos.ubicacionGPS,
                    tags: datos.tags || [],
                    subidoPor: userId,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Evidencia registrada',
                nuevoId: evidencia.id,
            };
        }

        throw new BadRequestException('Operación de evidencia no válida');
    }

    // Sincronizar tarea
    private async syncTarea(item: PendingSync, userId: string): Promise<SyncResult> {
        const { operacion, datos } = item;

        if (operacion === 'UPDATE' && datos.tareaId) {
            await this.prisma.tareaEjecucion.update({
                where: { id: datos.tareaId },
                data: {
                    completada: datos.completada,
                    horasReales: datos.horasReales,
                    observaciones: datos.observaciones,
                    completadaEn: datos.completada ? new Date() : null,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Tarea actualizada',
                nuevoId: datos.tareaId,
            };
        }

        if (operacion === 'CREATE' && datos.ejecucionId) {
            const tarea = await this.prisma.tareaEjecucion.create({
                data: {
                    ejecucionId: datos.ejecucionId,
                    descripcion: datos.descripcion,
                    horasEstimadas: datos.horasEstimadas || 1,
                    completada: datos.completada || false,
                    horasReales: datos.horasReales,
                    observaciones: datos.observaciones,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Tarea creada',
                nuevoId: tarea.id,
            };
        }

        throw new BadRequestException('Operación de tarea no válida');
    }

    // Sincronizar costo
    private async syncCosto(item: PendingSync, userId: string): Promise<SyncResult> {
        const { operacion, datos } = item;

        if (operacion === 'CREATE' && datos.ordenId) {
            const costo = await this.prisma.cost.create({
                data: {
                    orderId: datos.ordenId,
                    concepto: datos.concepto,
                    monto: datos.monto,
                    tipo: datos.tipo,
                    descripcion: datos.descripcion,
                },
            });

            return {
                success: true,
                id: item.id,
                tipo: item.tipo,
                mensaje: 'Costo registrado',
                nuevoId: costo.id,
            };
        }

        throw new BadRequestException('Operación de costo no válida');
    }

    // =====================================================
    // VERIFICACIÓN DE ESTADO DE SYNC
    // =====================================================

    async getLastSyncStatus(userId: string) {
        // Obtener las últimas modificaciones del usuario
        const ultimaEjecucion = await this.prisma.ejecucion.findFirst({
            where: { orden: { asignadoId: userId } },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, updatedAt: true },
        });

        const ultimaEvidencia = await this.prisma.evidenciaEjecucion.findFirst({
            where: { subidoPor: userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, createdAt: true },
        });

        return {
            ultimaSincronizacion: new Date(),
            ultimaEjecucion: ultimaEjecucion?.updatedAt,
            ultimaEvidencia: ultimaEvidencia?.createdAt,
            mensaje: 'Datos sincronizados correctamente',
        };
    }

    // Obtener órdenes para trabajo offline
    async getOrdenesParaOffline(userId: string) {
        const ordenes = await this.prisma.order.findMany({
            where: {
                asignadoId: userId,
                estado: { in: ['planeacion', 'ejecucion'] },
            },
            include: {
                planeacion: {
                    include: {
                        items: true,
                        kit: true,
                    },
                },
                ejecucion: {
                    include: {
                        checklists: true,
                        tareas: true,
                    },
                },
            },
        });

        return {
            fechaDescarga: new Date().toISOString(),
            ordenes: ordenes.map((o) => ({
                id: o.id,
                numero: o.numero,
                cliente: o.cliente,
                descripcion: o.descripcion,
                estado: o.estado,
                prioridad: o.prioridad,
                planeacion: o.planeacion,
                ejecucion: o.ejecucion,
            })),
        };
    }
}
