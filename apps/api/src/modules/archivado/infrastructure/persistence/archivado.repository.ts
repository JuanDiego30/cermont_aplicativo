/**
 * @repository PrismaArchivadoRepository
 * Prisma implementation for Archivado
 * Note: Uses Order.estado = 'cancelada' as archived status
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IArchivadoRepository, ArchivadoQueryDto } from '../../application/dto';

@Injectable()
export class PrismaArchivadoRepository implements IArchivadoRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: ArchivadoQueryDto): Promise<{ data: any[]; total: number }> {
        const where: any = {
            estado: 'cancelada' as any,
        };

        if (filters.fechaDesde) {
            where.updatedAt = { gte: new Date(filters.fechaDesde) };
        }
        if (filters.fechaHasta) {
            where.updatedAt = { ...where.updatedAt, lte: new Date(filters.fechaHasta) };
        }

        const skip = (filters.page - 1) * filters.limit;

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: filters.limit,
                include: {
                    asignado: { select: { name: true } },
                },
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        // Map to expected format
        const mappedData = data.map((orden: any) => ({
            id: orden.id,
            ordenId: orden.id,
            orden: { numero: orden.numero, titulo: orden.descripcion },
            fechaArchivado: orden.updatedAt,
            archivadoPor: orden.asignado,
            motivo: orden.observaciones || 'Archivada',
        }));

        return { data: mappedData, total };
    }

    async archivar(ordenId: string, userId: string, motivo?: string): Promise<any> {
        return this.prisma.order.update({
            where: { id: ordenId },
            data: {
                estado: 'cancelada' as any,
                observaciones: motivo || 'Archivada',
            } as any, // Type assertion to bypass Prisma type strictness
        });
    }

    async desarchivar(ordenId: string): Promise<void> {
        await this.prisma.order.update({
            where: { id: ordenId },
            data: {
                estado: 'planeacion' as any,
                observaciones: null,
            } as any, // Type assertion to bypass Prisma type strictness
        });
    }

    async isArchivada(ordenId: string): Promise<boolean> {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            select: { estado: true },
        });
        return orden?.estado === ('cancelada' as any);
    }

    async archivarAutomatico(diasAntiguedad: number): Promise<number> {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

        const result = await this.prisma.order.updateMany({
            where: {
                estado: 'completada' as any,
                updatedAt: { lt: fechaLimite },
            },
            data: {
                estado: 'cancelada' as any,
                observaciones: 'Archivado automático por antigüedad',
            } as any,
        });

        return result.count;
    }
}
