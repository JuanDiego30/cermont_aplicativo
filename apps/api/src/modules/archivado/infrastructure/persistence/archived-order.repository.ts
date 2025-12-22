/**
 * @repository ArchivedOrderRepository
 * 
 * Implementación Prisma del repositorio de órdenes archivadas.
 * Implementa IArchivedOrderRepository (DIP).
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    IArchivedOrderRepository,
    ArchivedOrderQueryFilters,
    PaginatedResult,
    ArchivedOrderEntity,
    ArchivedOrderId,
} from '../../domain';

@Injectable()
export class ArchivedOrderRepository implements IArchivedOrderRepository {
    private readonly logger = new Logger(ArchivedOrderRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async save(archivedOrder: ArchivedOrderEntity): Promise<ArchivedOrderEntity> {
        const data = archivedOrder.toPersistence();

        await this.prisma.archivoHistorico.upsert({
            where: { id: data.id },
            create: {
                id: data.id,
                tipo: 'orden_archivada' as any,
                mes: new Date().getMonth() + 1,
                anio: new Date().getFullYear(),
                nombreArchivo: data.orderNumber,
                rutaArchivo: '',
                tamanioBytes: BigInt(0),
                cantidadOrdenes: 1,
                cantidadEvidencias: 0,
                descripcion: JSON.stringify({
                    orderId: data.orderId,
                    orderNumber: data.orderNumber,
                    clientId: data.clientId,
                    clientName: data.clientName,
                    metadata: data.metadata,
                    archivedData: data.archivedData,
                    unarchivedAt: data.unarchivedAt,
                    unarchivedBy: data.unarchivedBy,
                }),
                disponible: true,
            },
            update: {
                descripcion: JSON.stringify({
                    orderId: data.orderId,
                    orderNumber: data.orderNumber,
                    clientId: data.clientId,
                    clientName: data.clientName,
                    metadata: data.metadata,
                    archivedData: data.archivedData,
                    unarchivedAt: data.unarchivedAt,
                    unarchivedBy: data.unarchivedBy,
                }),
            },
        });

        return archivedOrder;
    }

    async findById(id: ArchivedOrderId): Promise<ArchivedOrderEntity | null> {
        const record = await this.prisma.archivoHistorico.findUnique({
            where: { id: id.getValue() },
        });

        if (!record) return null;

        return this.toDomain(record);
    }

    async findByOrderId(orderId: string): Promise<ArchivedOrderEntity | null> {
        const records = await this.prisma.archivoHistorico.findMany({
            where: {
                tipo: 'orden_archivada' as any,
                descripcion: { contains: orderId },
            },
            take: 1,
        });

        if (records.length === 0) return null;

        return this.toDomain(records[0]);
    }

    async findMany(
        filters: ArchivedOrderQueryFilters,
        page: number,
        pageSize: number,
    ): Promise<PaginatedResult<ArchivedOrderEntity>> {
        const skip = (page - 1) * pageSize;

        const where: any = {
            tipo: 'orden_archivada' as any,
        };

        if (filters.dateFrom) {
            where.fechaArchivado = { gte: filters.dateFrom };
        }

        if (filters.dateTo) {
            where.fechaArchivado = { ...where.fechaArchivado, lte: filters.dateTo };
        }

        const [records, total] = await Promise.all([
            this.prisma.archivoHistorico.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { fechaArchivado: 'desc' },
            }),
            this.prisma.archivoHistorico.count({ where }),
        ]);

        return {
            data: records.map(r => this.toDomain(r)),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async count(filters: ArchivedOrderQueryFilters): Promise<number> {
        return this.prisma.archivoHistorico.count({
            where: {
                tipo: 'orden_archivada' as any,
            },
        });
    }

    async delete(id: ArchivedOrderId): Promise<void> {
        await this.prisma.archivoHistorico.delete({
            where: { id: id.getValue() },
        });
    }

    async existsByOrderId(orderId: string): Promise<boolean> {
        const count = await this.prisma.archivoHistorico.count({
            where: {
                tipo: 'orden_archivada' as any,
                descripcion: { contains: orderId },
            },
        });
        return count > 0;
    }

    async getStats(): Promise<{
        totalArchived: number;
        byReason: Record<string, number>;
        byMonth: Record<string, number>;
    }> {
        const total = await this.prisma.archivoHistorico.count({
            where: { tipo: 'orden_archivada' as any },
        });

        return {
            totalArchived: total,
            byReason: {},
            byMonth: {},
        };
    }

    private toDomain(record: any): ArchivedOrderEntity {
        const data = JSON.parse(record.descripcion || '{}');

        return ArchivedOrderEntity.fromPersistence({
            id: record.id,
            orderId: data.orderId || '',
            orderNumber: data.orderNumber || record.nombreArchivo,
            clientId: data.clientId || '',
            clientName: data.clientName || '',
            metadata: data.metadata || {
                archivedAt: record.fechaArchivado,
                archivedBy: 'system',
                reason: 'AUTO_ARCHIVE',
            },
            archivedData: data.archivedData || {},
            createdAt: record.fechaArchivado,
            unarchivedAt: data.unarchivedAt,
            unarchivedBy: data.unarchivedBy,
        });
    }
}
