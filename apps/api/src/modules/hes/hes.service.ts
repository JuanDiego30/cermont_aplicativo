import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HesService {
    constructor(private readonly prisma: PrismaService) { }
    async findAllEquipos() { const equipos = await this.prisma.equipoHES.findMany({ orderBy: { numero: 'asc' } }); return { data: equipos }; }
    async findEquipo(id: string) { return this.prisma.equipoHES.findUnique({ where: { id }, include: { inspecciones: true } }); }
    async createInspeccion(dto: any, inspectorId: string) {
        const inspeccion = await this.prisma.inspeccionHES.create({ data: { equipoId: dto.equipoId, inspectorId, estado: dto.estado || 'OK', observaciones: dto.observaciones, fotosEvidencia: dto.fotos || [], ordenId: dto.ordenId } });
        await this.prisma.equipoHES.update({ where: { id: dto.equipoId }, data: { ultimaInspeccion: new Date() } });
        return { message: 'Inspeccion creada', data: inspeccion };
    }
    async findInspeccionesByEquipo(equipoId: string) { const inspecciones = await this.prisma.inspeccionHES.findMany({ where: { equipoId }, orderBy: { fechaInspeccion: 'desc' } }); return { data: inspecciones }; }
}
