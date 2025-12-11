import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlaneacionService {
    constructor(private readonly prisma: PrismaService) { }

    async findByOrden(ordenId: string) { return this.prisma.planeacion.findUnique({ where: { ordenId }, include: { items: true, kit: true, orden: true } }); }

    async createOrUpdate(ordenId: string, dto: any) {
        const existing = await this.prisma.planeacion.findUnique({ where: { ordenId } });
        if (existing) return this.prisma.planeacion.update({ where: { ordenId }, data: { ...dto, cronograma: dto.cronograma || {}, manoDeObra: dto.manoDeObra || {} } });
        return this.prisma.planeacion.create({ data: { ordenId, estado: 'borrador', cronograma: dto.cronograma || {}, manoDeObra: dto.manoDeObra || {}, ...dto } });
    }

    async aprobar(id: string, aprobadorId: string) {
        const planeacion = await this.prisma.planeacion.update({ where: { id }, data: { estado: 'aprobada', aprobadoPorId: aprobadorId, fechaAprobacion: new Date() } });
        return { message: 'Planeacion aprobada', data: planeacion };
    }

    async rechazar(id: string, motivo: string) {
        const planeacion = await this.prisma.planeacion.update({ where: { id }, data: { estado: 'cancelada', observaciones: motivo } });
        return { message: 'Planeacion rechazada', data: planeacion };
    }
}
