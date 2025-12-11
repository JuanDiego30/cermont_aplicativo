import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CostosService {
    constructor(private readonly prisma: PrismaService) { }
    async findByOrden(ordenId: string) { const costos = await this.prisma.cost.findMany({ where: { orderId: ordenId }, orderBy: { createdAt: 'desc' } }); const total = costos.reduce((sum, c) => sum + c.monto, 0); return { data: costos, total }; }
    async create(dto: any) { const costo = await this.prisma.cost.create({ data: { orderId: dto.ordenId, concepto: dto.concepto, monto: dto.monto, tipo: dto.tipo, descripcion: dto.descripcion } }); return { message: 'Costo agregado', data: costo }; }
    async update(id: string, dto: any) { const costo = await this.prisma.cost.update({ where: { id }, data: dto }); return { message: 'Costo actualizado', data: costo }; }
    async remove(id: string) { await this.prisma.cost.delete({ where: { id } }); return { message: 'Costo eliminado' }; }
}
