import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EjecucionService {
    constructor(private readonly prisma: PrismaService) { }

    async findByOrden(ordenId: string) { return this.prisma.ejecucion.findUnique({ where: { ordenId }, include: { tareas: true, checklists: true, evidenciasEjecucion: true } }); }

    async iniciar(ordenId: string, dto: any) {
        const planeacion = await this.prisma.planeacion.findUnique({ where: { ordenId } });
        if (!planeacion) throw new BadRequestException('Debe existir planeacion aprobada');
        const ejecucion = await this.prisma.ejecucion.create({ data: { ordenId, planeacionId: planeacion.id, estado: 'EN_PROGRESO', fechaInicio: new Date(), horasEstimadas: dto.horasEstimadas || 8, observacionesInicio: dto.observaciones } });
        await this.prisma.order.update({ where: { id: ordenId }, data: { estado: 'ejecucion', fechaInicio: new Date() } });
        return { message: 'Ejecucion iniciada', data: ejecucion };
    }

    async updateAvance(id: string, dto: any) {
        const ejecucion = await this.prisma.ejecucion.update({ where: { id }, data: { avancePercentaje: dto.avance, horasActuales: dto.horasActuales, observaciones: dto.observaciones } });
        return { message: 'Avance actualizado', data: ejecucion };
    }

    async completar(id: string, dto: any) {
        const ejecucion = await this.prisma.ejecucion.update({ where: { id }, data: { estado: 'COMPLETADA', avancePercentaje: 100, fechaTermino: new Date(), horasActuales: dto.horasActuales, observaciones: dto.observaciones } });
        await this.prisma.order.update({ where: { id: ejecucion.ordenId }, data: { estado: 'completada', fechaFin: new Date() } });
        return { message: 'Ejecucion completada', data: ejecucion };
    }
}
