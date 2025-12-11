import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }
    async getStats() {
        const [totalOrdenes, ordenesPorEstado, totalUsuarios, ordenesRecientes] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.groupBy({ by: ['estado'], _count: { id: true } }),
            this.prisma.user.count({ where: { active: true } }),
            this.prisma.order.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
        ]);
        return { totalOrdenes, totalUsuarios, ordenesRecientes, porEstado: ordenesPorEstado.reduce((acc, item) => { acc[item.estado] = item._count.id; return acc; }, {} as Record<string, number>) };
    }
    async getOrdenesRecientes() { const ordenes = await this.prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, numero: true, cliente: true, estado: true, prioridad: true, createdAt: true } }); return { data: ordenes }; }

    async getMetricas() {
        const [totalOrders, completedOrders, pendingOrders, techniciansActive] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { estado: 'completada' } }),
            this.prisma.order.count({ where: { estado: { in: ['planeacion', 'ejecucion', 'pausada'] } } }),
            this.prisma.user.count({ where: { role: 'tecnico', active: true } })
        ]);

        return {
            totalOrders,
            completedOrders,
            pendingOrders,
            techniciansActive
        };
    }
}
