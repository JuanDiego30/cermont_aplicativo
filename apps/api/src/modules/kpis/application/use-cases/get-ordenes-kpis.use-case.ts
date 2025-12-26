import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KpiFiltersDto, OrdenesKpiDto } from '../dto';

@Injectable()
export class GetOrdenesKpisUseCase {
    private readonly logger = new Logger(GetOrdenesKpisUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(filters: KpiFiltersDto): Promise<OrdenesKpiDto> {
        try {
            this.logger.log('Calculando KPIs de órdenes', { filters });

            const { fechaInicio, fechaFin } = this.parseFechas(filters);

            // Query para obtener estadísticas
            const [total, completadas, pendientes, enProgreso, canceladas, tiempoPromedio] =
                await Promise.all([
                    this.contarOrdenes(fechaInicio, fechaFin, filters.clienteId),
                    this.contarPorEstado('COMPLETADA', fechaInicio, fechaFin, filters.clienteId),
                    this.contarPorEstado('PENDIENTE', fechaInicio, fechaFin, filters.clienteId),
                    this.contarPorEstado('EN_PROGRESO', fechaInicio, fechaFin, filters.clienteId),
                    this.contarPorEstado('CANCELADA', fechaInicio, fechaFin, filters.clienteId),
                    this.calcularTiempoPromedio(fechaInicio, fechaFin, filters.clienteId),
                ]);

            const tasaCompletitud = total > 0 ? (completadas / total) * 100 : 0;

            return {
                total,
                completadas,
                pendientes,
                enProgreso,
                canceladas,
                tasaCompletitud: Math.round(tasaCompletitud * 100) / 100,
                tiempoPromedioResolucion: Math.round(tiempoPromedio * 100) / 100,
            };
        } catch (error) {
            this.logger.error('Error calculando KPIs de órdenes', error);
            throw error;
        }
    }

    private parseFechas(filters: KpiFiltersDto): { fechaInicio: Date; fechaFin: Date } {
        const ahora = new Date();
        let fechaInicio: Date;
        let fechaFin: Date = ahora;

        if (filters.fechaInicio && filters.fechaFin) {
            fechaInicio = new Date(filters.fechaInicio);
            fechaFin = new Date(filters.fechaFin);
        } else {
            switch (filters.periodo) {
                case 'HOY':
                    fechaInicio = new Date(ahora.setHours(0, 0, 0, 0));
                    break;
                case 'SEMANA':
                    fechaInicio = new Date(ahora.setDate(ahora.getDate() - 7));
                    break;
                case 'TRIMESTRE':
                    fechaInicio = new Date(ahora.setMonth(ahora.getMonth() - 3));
                    break;
                case 'ANO':
                    fechaInicio = new Date(ahora.setFullYear(ahora.getFullYear() - 1));
                    break;
                case 'MES':
                default:
                    fechaInicio = new Date(ahora.setMonth(ahora.getMonth() - 1));
                    break;
            }
        }

        return { fechaInicio, fechaFin };
    }

    private async contarOrdenes(
        fechaInicio: Date,
        fechaFin: Date,
        clienteId?: string,
    ): Promise<number> {
        return this.prisma.order.count({
            where: {
                createdAt: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
                ...(clienteId && { clienteId }),
            },
        });
    }

    private async contarPorEstado(
        estado: string,
        fechaInicio: Date,
        fechaFin: Date,
        clienteId?: string,
    ): Promise<number> {
        return this.prisma.order.count({
            where: {
                estado: estado as any,
                createdAt: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
                ...(clienteId && { clienteId }),
            },
        });
    }

    private async calcularTiempoPromedio(
        fechaInicio: Date,
        fechaFin: Date,
        clienteId?: string,
    ): Promise<number> {
        const ordenes = await this.prisma.order.findMany({
            where: {
                estado: 'completada' as any,
                createdAt: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
                fechaFin: { not: null },
                ...(clienteId && { clienteId }),
            },
            select: {
                createdAt: true,
                fechaFin: true,
            },
        });

        if (ordenes.length === 0) return 0;

        const tiempoTotal = ordenes.reduce((acc: number, orden: { createdAt: Date; fechaFin: Date | null }) => {
            const diff = orden.fechaFin!.getTime() - orden.createdAt.getTime();
            return acc + diff / (1000 * 60 * 60); // Convertir a horas
        }, 0);

        return tiempoTotal / ordenes.length;
    }
}
