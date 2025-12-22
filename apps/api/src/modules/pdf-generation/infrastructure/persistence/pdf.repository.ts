/**
 * @repository PrismaPDFRepository
 * Prisma implementation for PDF data retrieval
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IPDFRepository } from '../../application/dto';

@Injectable()
export class PrismaPDFRepository implements IPDFRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getOrdenData(ordenId: string): Promise<Record<string, unknown>> {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                asignado: { select: { name: true, email: true } },
                planeacion: true,
                ejecucion: true,
                costos: true,
                evidencias: true,
            },
        });

        if (!orden) return {};

        const o = orden as any;
        return {
            orden: {
                ...orden,
                cliente: orden.cliente,
                direccion: o.direccion || 'Sin dirección',
                fechaProgramada: orden.fechaInicio?.toLocaleDateString('es-CO'),
            },
        };
    }

    async getHESData(hesId: string): Promise<Record<string, unknown>> {
        const hes = await this.prisma.hES.findUnique({
            where: { id: hesId },
        });

        if (!hes) return {};

        return { hes };
    }

    async getLineaVidaData(lineaVidaId: string): Promise<Record<string, unknown>> {
        const lineaVida = await this.prisma.inspeccionLineaVida.findUnique({
            where: { id: lineaVidaId },
            include: { componentes: true },
        });

        if (!lineaVida) return {};

        return { lineaVida };
    }

    async getChecklistData(checklistId: string): Promise<Record<string, unknown>> {
        const checklist = await this.prisma.checklistEjecucion.findUnique({
            where: { id: checklistId },
            include: { items: true },
        });

        if (!checklist) return {};

        return { checklist };
    }

    async getReporteData(
        tipo: string,
        fechaInicio: string,
        fechaFin: string,
        filtros?: Record<string, unknown>,
    ): Promise<Record<string, unknown>> {
        const where: any = {
            createdAt: {
                gte: new Date(fechaInicio),
                lte: new Date(fechaFin),
            },
        };

        if (tipo === 'ordenes') {
            const ordenes = await this.prisma.order.findMany({
                where,
                include: { asignado: { select: { name: true } } },
            });

            const resumen = {
                total: ordenes.length,
                completadas: ordenes.filter(o => o.estado === 'completada').length,
                enProgreso: ordenes.filter(o => o.estado === 'ejecucion').length,
                pendientes: ordenes.filter(o => o.estado === 'planeacion').length,
            };

            return {
                fechaInicio,
                fechaFin,
                resumen,
                ordenes: ordenes.map(o => ({
                    numero: o.numero,
                    cliente: 'Cliente',
                    fecha: o.createdAt.toLocaleDateString('es-CO'),
                    estado: o.estado,
                })),
            };
        }

        return { fechaInicio, fechaFin, tipo };
    }

    async savePDFRecord(
        filename: string,
        path: string,
        entityType: string,
        entityId: string,
        userId: string,
    ): Promise<any> {
        // Store in evidence table or a dedicated PDF records table
        return this.prisma.evidence.create({
            data: {
                orderId: entityId,
                tipo: 'documento',
                url: path,
                descripcion: `PDF generado: ${entityType}`,
            },
        });
    }
}
