import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LineasVidaService {
    constructor(private readonly prisma: PrismaService) { }
    async findAll() { const lineas = await this.prisma.inspeccionLineaVida.findMany({ include: { componentes: true }, orderBy: { fechaInspeccion: 'desc' } }); return { data: lineas }; }
    async findOne(id: string) { return this.prisma.inspeccionLineaVida.findUnique({ where: { id }, include: { componentes: { include: { condiciones: true } } } }); }
    async create(dto: any, inspectorId: string) { const inspeccion = await this.prisma.inspeccionLineaVida.create({ data: { numeroLinea: dto.numeroLinea, fabricante: dto.fabricante, ubicacion: dto.ubicacion, inspectorId, estado: dto.estado || 'PENDIENTE', observaciones: dto.observaciones } }); return { message: 'Inspeccion creada', data: inspeccion }; }
}
