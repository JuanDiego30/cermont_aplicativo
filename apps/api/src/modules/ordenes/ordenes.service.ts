import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdenesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: { estado?: string; cliente?: string; page?: number; limit?: number }) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (filters.estado) where.estado = filters.estado;
        if (filters.cliente) where.cliente = { contains: filters.cliente, mode: 'insensitive' };
        const [ordenes, total] = await Promise.all([
            this.prisma.order.findMany({ where, skip, take: limit, include: { creador: { select: { id: true, name: true } }, asignado: { select: { id: true, name: true } }, items: true }, orderBy: { createdAt: 'desc' } }),
            this.prisma.order.count({ where }),
        ]);
        return { data: ordenes, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const orden = await this.prisma.order.findUnique({ where: { id }, include: { creador: { select: { id: true, name: true } }, asignado: { select: { id: true, name: true } }, items: true, evidencias: true, costos: true, planeacion: true, ejecucion: true } });
        if (!orden) throw new NotFoundException('Orden no encontrada');
        return orden;
    }

    async create(dto: any, creadorId: string) {
        const count = await this.prisma.order.count();
        const numero = `ORD-${String(count + 1).padStart(6, '0')}`;
        const orden = await this.prisma.order.create({ data: { numero, descripcion: dto.descripcion, cliente: dto.cliente, estado: dto.estado || 'planeacion', prioridad: dto.prioridad || 'media', fechaFinEstimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : null, presupuestoEstimado: dto.presupuestoEstimado, creadorId, asignadoId: dto.asignadoId } });
        return { message: 'Orden creada exitosamente', data: orden };
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        const orden = await this.prisma.order.update({ where: { id }, data: { descripcion: dto.descripcion, cliente: dto.cliente, prioridad: dto.prioridad, fechaFinEstimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : undefined, presupuestoEstimado: dto.presupuestoEstimado, asignadoId: dto.asignadoId } });
        return { message: 'Orden actualizada exitosamente', data: orden };
    }

    async updateEstado(id: string, estado: string) {
        await this.findOne(id);
        const updateData: any = { estado };
        if (estado === 'ejecucion') updateData.fechaInicio = new Date();
        else if (estado === 'completada') updateData.fechaFin = new Date();
        const orden = await this.prisma.order.update({ where: { id }, data: updateData });
        return { message: 'Estado actualizado', data: orden };
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.order.delete({ where: { id } });
        return { message: 'Orden eliminada exitosamente' };
    }
}
