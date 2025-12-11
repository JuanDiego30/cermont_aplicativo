import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KitsService {
    constructor(private readonly prisma: PrismaService) { }
    async findAll() { const kits = await this.prisma.kitTipico.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }); return { data: kits }; }
    async findOne(id: string) { const kit = await this.prisma.kitTipico.findUnique({ where: { id } }); if (!kit) throw new NotFoundException('Kit no encontrado'); return kit; }
    async create(dto: any) { const kit = await this.prisma.kitTipico.create({ data: dto }); return { message: 'Kit creado', data: kit }; }
    async update(id: string, dto: any) { await this.findOne(id); const kit = await this.prisma.kitTipico.update({ where: { id }, data: dto }); return { message: 'Kit actualizado', data: kit }; }
    async remove(id: string) { await this.findOne(id); await this.prisma.kitTipico.update({ where: { id }, data: { activo: false } }); return { message: 'Kit desactivado' }; }
}
