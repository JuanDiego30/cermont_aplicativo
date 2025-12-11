import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MantenimientosService {
    constructor(private readonly prisma: PrismaService) { }
    async findAll(estado?: string) { const where = estado ? { estado: estado as any } : {}; const m = await this.prisma.mantenimiento.findMany({ where, include: { equipo: true, tecnicoAsignado: { select: { id: true, name: true } } }, orderBy: { fechaProgramada: 'asc' } }); return { data: m }; }
    async findOne(id: string) { const m = await this.prisma.mantenimiento.findUnique({ where: { id }, include: { equipo: true, tecnicoAsignado: true, creadoPor: true } }); if (!m) throw new NotFoundException('Mantenimiento no encontrado'); return m; }
    async create(dto: any, userId: string) { const m = await this.prisma.mantenimiento.create({ data: { equipoId: dto.equipoId, tipo: dto.tipo, titulo: dto.titulo, descripcion: dto.descripcion, fechaProgramada: new Date(dto.fechaProgramada), prioridad: dto.prioridad || 'MEDIA', tecnicoAsignadoId: dto.tecnicoId, creadoPorId: userId } }); return { message: 'Mantenimiento creado', data: m }; }
    async update(id: string, dto: any) { const m = await this.prisma.mantenimiento.update({ where: { id }, data: dto }); return { message: 'Mantenimiento actualizado', data: m }; }
}
