import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChecklistsService {
    constructor(private readonly prisma: PrismaService) { }
    async findByEjecucion(ejecucionId: string) { const checklists = await this.prisma.checklistEjecucion.findMany({ where: { ejecucionId }, orderBy: { createdAt: 'asc' } }); return { data: checklists }; }
    async completar(id: string, userId: string) { const checklist = await this.prisma.checklistEjecucion.update({ where: { id }, data: { completada: true, completadoPor: userId, completadoEn: new Date() } }); return { message: 'Item completado', data: checklist }; }
}
