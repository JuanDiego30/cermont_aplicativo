import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
    constructor(private readonly prisma: PrismaService) { }
    async reporteOrdenes(desde?: string, hasta?: string) {
        const where: any = {};
        if (desde) where.createdAt = { gte: new Date(desde) };
        if (hasta) where.createdAt = { ...where.createdAt, lte: new Date(hasta) };
        const ordenes = await this.prisma.order.findMany({ where, include: { costos: true, evidencias: true } });
        const resumen = { total: ordenes.length, completadas: ordenes.filter(o => o.estado === 'completada').length, enProgreso: ordenes.filter(o => o.estado === 'ejecucion').length, costoTotal: ordenes.reduce((sum, o) => sum + o.costos.reduce((s, c) => s + c.monto, 0), 0) };
        return { ordenes, resumen };
    }
    async reporteOrden(id: string) { return this.prisma.order.findUnique({ where: { id }, include: { creador: true, asignado: true, items: true, evidencias: true, costos: true, planeacion: { include: { items: true } }, ejecucion: { include: { tareas: true, checklists: true } } } }); }
}
