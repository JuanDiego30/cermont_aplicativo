import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KpiFiltersDto, TecnicosKpiDto } from '../dto';

@Injectable()
export class GetTecnicosKpisUseCase {
    private readonly logger = new Logger(GetTecnicosKpisUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(filters: KpiFiltersDto): Promise<TecnicosKpiDto> {
        try {
            this.logger.log('Calculando KPIs de técnicos', { filters });

            const [totalActivos, ordenesStats] = await Promise.all([
                this.contarTecnicosActivos(),
                this.obtenerEstadisticasOrdenes(filters),
            ]);

            const disponibles = Math.floor(totalActivos * 0.6); // Placeholder
            const ocupados = totalActivos - disponibles;

            const promedioOrdenesPorTecnico =
                totalActivos > 0 ? ordenesStats.total / totalActivos : 0;
            const eficienciaPromedio = this.calcularEficiencia(ordenesStats);

            return {
                totalActivos,
                disponibles,
                ocupados,
                promedioOrdenesPorTecnico: Math.round(promedioOrdenesPorTecnico * 100) / 100,
                eficienciaPromedio: Math.round(eficienciaPromedio * 100) / 100,
            };
        } catch (error) {
            this.logger.error('Error calculando KPIs de técnicos', error);
            throw error;
        }
    }

    private async contarTecnicosActivos(): Promise<number> {
        return this.prisma.user.count({
            where: {
                role: 'tecnico' as any,
                active: true,
            },
        });
    }

    private async obtenerEstadisticasOrdenes(filters: KpiFiltersDto) {
        const fechaInicio = this.calcularFechaInicio(filters);
        const fechaFin = new Date();

        const [total, completadas] = await Promise.all([
            this.prisma.order.count({
                where: {
                    createdAt: {
                        gte: fechaInicio,
                        lte: fechaFin,
                    },
                    asignadoId: { not: null },
                },
            }),
            this.prisma.order.count({
                where: {
                    estado: 'completada' as any,
                    createdAt: {
                        gte: fechaInicio,
                        lte: fechaFin,
                    },
                    asignadoId: { not: null },
                },
            }),
        ]);

        return { total, completadas };
    }

    private calcularFechaInicio(filters: KpiFiltersDto): Date {
        if (filters.fechaInicio) {
            return new Date(filters.fechaInicio);
        }

        const ahora = new Date();
        switch (filters.periodo) {
            case 'HOY':
                return new Date(ahora.setHours(0, 0, 0, 0));
            case 'SEMANA':
                return new Date(ahora.setDate(ahora.getDate() - 7));
            case 'MES':
            default:
                return new Date(ahora.setMonth(ahora.getMonth() - 1));
        }
    }

    private calcularEficiencia(stats: { total: number; completadas: number }): number {
        if (stats.total === 0) return 0;
        return (stats.completadas / stats.total) * 100;
    }
}
