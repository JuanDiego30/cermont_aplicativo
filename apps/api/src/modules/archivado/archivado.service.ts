import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

@Injectable()
export class ArchivadoService {
    private readonly logger = new Logger(ArchivadoService.name);
    private readonly uploadsPath = path.join(process.cwd(), 'uploads');
    private readonly archivosPath = path.join(process.cwd(), 'archivos');

    constructor(private readonly prisma: PrismaService) {
        // Crear directorio de archivos si no existe
        if (!fs.existsSync(this.archivosPath)) {
            fs.mkdirSync(this.archivosPath, { recursive: true });
        }
    }

    // =====================================================
    // ARCHIVADO AUTOMÁTICO MENSUAL
    // Ejecutar el último día del mes a las 23:00
    // =====================================================

    @Cron('0 23 28-31 * *') // Últimos días del mes a las 23:00
    async archivarOrdenesCompletadas() {
        this.logger.log('Iniciando proceso de archivado automático mensual...');

        try {
            // Calcular fecha límite (órdenes con más de 30 días de completadas)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);

            // Buscar órdenes completadas y facturadas
            const ordenesParaArchivar = await this.prisma.order.findMany({
                where: {
                    estado: 'completada',
                    updatedAt: { lt: fechaLimite },
                    // Verificar que tenga cierre administrativo completo
                    cierreAdministrativo: {
                        estaCompleto: true,
                    },
                },
                include: {
                    planeacion: true,
                    ejecucion: {
                        include: {
                            checklists: true,
                            tareas: true,
                            evidenciasEjecucion: true,
                        },
                    },
                    costos: true,
                    acta: true,
                    ses: true,
                    factura: true,
                    cierreAdministrativo: true,
                },
            });

            if (ordenesParaArchivar.length === 0) {
                this.logger.log('No hay órdenes para archivar');
                return { message: 'No hay órdenes para archivar', archivadas: 0 };
            }

            // Obtener mes y año actual para el nombre del archivo
            const ahora = new Date();
            const mes = ahora.getMonth() + 1;
            const anio = ahora.getFullYear();

            // Crear archivo histórico
            const archivoHistorico = await this.crearArchivoHistorico(
                ordenesParaArchivar,
                mes,
                anio,
            );

            this.logger.log(
                `Archivado completado: ${ordenesParaArchivar.length} órdenes archivadas`,
            );

            return {
                message: 'Archivado completado',
                archivadas: ordenesParaArchivar.length,
                archivo: archivoHistorico,
            };
        } catch (error) {
            this.logger.error('Error en archivado automático:', error);
            throw error;
        }
    }

    // Crear archivo histórico manualmente (para un mes específico)
    async archivarMes(mes: number, anio: number) {
        this.logger.log(`Archivando órdenes de ${mes}/${anio}...`);

        const inicioMes = new Date(anio, mes - 1, 1);
        const finMes = new Date(anio, mes, 0, 23, 59, 59);

        const ordenesDelMes = await this.prisma.order.findMany({
            where: {
                estado: { in: ['completada'] },
                updatedAt: {
                    gte: inicioMes,
                    lte: finMes,
                },
            },
            include: {
                planeacion: true,
                ejecucion: {
                    include: {
                        checklists: true,
                        tareas: true,
                        evidenciasEjecucion: true,
                    },
                },
                costos: true,
                acta: true,
                ses: true,
                factura: true,
                cierreAdministrativo: true,
            },
        });

        if (ordenesDelMes.length === 0) {
            return { message: `No hay órdenes completadas en ${mes}/${anio}`, archivadas: 0 };
        }

        const archivo = await this.crearArchivoHistorico(ordenesDelMes, mes, anio);

        return {
            message: `Órdenes de ${mes}/${anio} archivadas correctamente`,
            archivadas: ordenesDelMes.length,
            archivo,
        };
    }

    // Crear archivo histórico en la base de datos
    private async crearArchivoHistorico(ordenes: any[], mes: number, anio: number) {
        // Verificar si ya existe un archivo para este mes
        const existente = await this.prisma.archivoHistorico.findUnique({
            where: {
                mes_anio_tipo: {
                    mes,
                    anio,
                    tipo: 'ORDENES_CSV',
                },
            },
        });

        if (existente) {
            this.logger.log(`Archivo para ${mes}/${anio} ya existe, actualizando...`);
        }

        // Generar CSV con datos de órdenes
        const csvContent = this.generarCSV(ordenes);
        const nombreArchivo = `ordenes_${anio}_${String(mes).padStart(2, '0')}.csv`;
        const rutaArchivo = path.join(this.archivosPath, nombreArchivo);

        fs.writeFileSync(rutaArchivo, csvContent, 'utf8');

        const stats = fs.statSync(rutaArchivo);

        // Crear o actualizar registro en base de datos
        const archivoHistorico = await this.prisma.archivoHistorico.upsert({
            where: {
                mes_anio_tipo: {
                    mes,
                    anio,
                    tipo: 'ORDENES_CSV',
                },
            },
            create: {
                tipo: 'ORDENES_CSV',
                mes,
                anio,
                nombreArchivo,
                rutaArchivo,
                tamanioBytes: BigInt(stats.size),
                cantidadOrdenes: ordenes.length,
                cantidadEvidencias: ordenes.reduce(
                    (sum, o) => sum + (o.ejecucion?.evidenciasEjecucion?.length || 0),
                    0,
                ),
                descripcion: `Órdenes completadas de ${mes}/${anio}`,
                disponible: true,
            },
            update: {
                nombreArchivo,
                rutaArchivo,
                tamanioBytes: BigInt(stats.size),
                cantidadOrdenes: ordenes.length,
                cantidadEvidencias: ordenes.reduce(
                    (sum, o) => sum + (o.ejecucion?.evidenciasEjecucion?.length || 0),
                    0,
                ),
                disponible: true,
            },
        });

        return {
            id: archivoHistorico.id,
            nombreArchivo,
            cantidadOrdenes: ordenes.length,
            tamanioBytes: Number(archivoHistorico.tamanioBytes),
        };
    }

    // Generar contenido CSV
    private generarCSV(ordenes: any[]): string {
        const headers = [
            'Numero',
            'Cliente',
            'Estado',
            'Prioridad',
            'FechaCreacion',
            'FechaInicio',
            'FechaFin',
            'CostoTotal',
            'ActaNumero',
            'ActaEstado',
            'SESNumero',
            'SESEstado',
            'FacturaNumero',
            'FacturaEstado',
            'CierreCompleto',
        ];

        const rows = ordenes.map((o) => [
            o.numero,
            o.cliente,
            o.estado,
            o.prioridad,
            o.createdAt?.toISOString() || '',
            o.fechaInicio?.toISOString() || '',
            o.fechaFin?.toISOString() || '',
            o.costos?.reduce((sum: number, c: any) => sum + c.monto, 0) || 0,
            o.acta?.numero || '',
            o.acta?.estado || '',
            o.ses?.numeroSES || '',
            o.ses?.estado || '',
            o.factura?.numeroFactura || '',
            o.factura?.estado || '',
            o.cierreAdministrativo?.estaCompleto ? 'SI' : 'NO',
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // =====================================================
    // PORTAL DE DESCARGA DE HISTÓRICOS
    // =====================================================

    // Obtener lista de archivos históricos
    async getArchivosHistoricos(anio?: number) {
        const where = anio ? { anio, disponible: true } : { disponible: true };

        const archivos = await this.prisma.archivoHistorico.findMany({
            where,
            orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
        });

        return {
            data: archivos.map((a) => ({
                id: a.id,
                tipo: a.tipo,
                mes: a.mes,
                anio: a.anio,
                nombreArchivo: a.nombreArchivo,
                tamanioBytes: Number(a.tamanioBytes),
                tamanioMB: (Number(a.tamanioBytes) / 1024 / 1024).toFixed(2),
                cantidadOrdenes: a.cantidadOrdenes,
                cantidadEvidencias: a.cantidadEvidencias,
                descripcion: a.descripcion,
                fechaArchivado: a.fechaArchivado,
            })),
        };
    }

    // Obtener archivo para descarga
    async getArchivoParaDescarga(id: string) {
        const archivo = await this.prisma.archivoHistorico.findUnique({
            where: { id },
        });

        if (!archivo) {
            throw new NotFoundException('Archivo no encontrado');
        }

        if (!fs.existsSync(archivo.rutaArchivo)) {
            throw new NotFoundException('El archivo físico no existe en el servidor');
        }

        // Marcar como descargado
        await this.prisma.archivoHistorico.update({
            where: { id },
            data: {
                descargado: true,
                fechaDescarga: new Date(),
            },
        });

        return {
            filePath: archivo.rutaArchivo,
            fileName: archivo.nombreArchivo,
            mimeType: 'text/csv',
        };
    }

    // Generar paquete ZIP con evidencias
    async generarZipEvidencias(mes: number, anio: number) {
        const inicioMes = new Date(anio, mes - 1, 1);
        const finMes = new Date(anio, mes, 0, 23, 59, 59);

        const evidencias = await this.prisma.evidenciaEjecucion.findMany({
            where: {
                createdAt: {
                    gte: inicioMes,
                    lte: finMes,
                },
            },
            include: {
                orden: {
                    select: { numero: true },
                },
            },
        });

        if (evidencias.length === 0) {
            return { message: 'No hay evidencias para este período', archivo: null };
        }

        const nombreZip = `evidencias_${anio}_${String(mes).padStart(2, '0')}.zip`;
        const rutaZip = path.join(this.archivosPath, nombreZip);

        // Crear archivo ZIP
        const output = fs.createWriteStream(rutaZip);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        // Agregar cada evidencia al ZIP
        for (const evidencia of evidencias) {
            const rutaCompleta = path.join(this.uploadsPath, evidencia.rutaArchivo);
            if (fs.existsSync(rutaCompleta)) {
                const nombreEnZip = `${evidencia.orden.numero}/${evidencia.nombreArchivo}`;
                archive.file(rutaCompleta, { name: nombreEnZip });
            }
        }

        await archive.finalize();

        // Guardar referencia en base de datos
        const stats = fs.statSync(rutaZip);

        const archivoHistorico = await this.prisma.archivoHistorico.upsert({
            where: {
                mes_anio_tipo: {
                    mes,
                    anio,
                    tipo: 'EVIDENCIAS_ZIP',
                },
            },
            create: {
                tipo: 'EVIDENCIAS_ZIP',
                mes,
                anio,
                nombreArchivo: nombreZip,
                rutaArchivo: rutaZip,
                tamanioBytes: BigInt(stats.size),
                cantidadOrdenes: 0,
                cantidadEvidencias: evidencias.length,
                descripcion: `Evidencias fotográficas de ${mes}/${anio}`,
                disponible: true,
            },
            update: {
                nombreArchivo: nombreZip,
                rutaArchivo: rutaZip,
                tamanioBytes: BigInt(stats.size),
                cantidadEvidencias: evidencias.length,
                disponible: true,
            },
        });

        return {
            message: 'ZIP de evidencias generado',
            archivo: {
                id: archivoHistorico.id,
                nombreArchivo: nombreZip,
                cantidadEvidencias: evidencias.length,
                tamanioMB: (Number(stats.size) / 1024 / 1024).toFixed(2),
            },
        };
    }

    // Obtener estadísticas de archivado
    async getEstadisticasArchivado() {
        const archivos = await this.prisma.archivoHistorico.findMany({
            where: { disponible: true },
        });

        const totalBytes = archivos.reduce((sum, a) => sum + Number(a.tamanioBytes), 0);
        const totalOrdenes = archivos.reduce((sum, a) => sum + a.cantidadOrdenes, 0);
        const totalEvidencias = archivos.reduce((sum, a) => sum + a.cantidadEvidencias, 0);

        // Agrupar por año
        const porAnio = archivos.reduce((acc: any, a) => {
            if (!acc[a.anio]) acc[a.anio] = { ordenes: 0, evidencias: 0, archivos: 0 };
            acc[a.anio].ordenes += a.cantidadOrdenes;
            acc[a.anio].evidencias += a.cantidadEvidencias;
            acc[a.anio].archivos += 1;
            return acc;
        }, {});

        return {
            totalArchivos: archivos.length,
            totalOrdenes,
            totalEvidencias,
            espacioUsado: {
                bytes: totalBytes,
                mb: (totalBytes / 1024 / 1024).toFixed(2),
                gb: (totalBytes / 1024 / 1024 / 1024).toFixed(2),
            },
            porAnio,
        };
    }
}
