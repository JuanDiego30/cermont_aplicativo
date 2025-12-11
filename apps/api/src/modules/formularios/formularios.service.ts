import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormulariosService {
    constructor(private readonly prisma: PrismaService) { }
    async findTemplates() { const t = await this.prisma.formularioTemplate.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }); return { data: t }; }
    async findTemplate(id: string) { return this.prisma.formularioTemplate.findUnique({ where: { id } }); }
    async createTemplate(dto: any, userId: string) { const t = await this.prisma.formularioTemplate.create({ data: { nombre: dto.nombre, descripcion: dto.descripcion, schema: JSON.stringify(dto.schema), creadoPorId: userId } }); return { message: 'Template creado', data: t }; }
    async submitResponse(dto: any, userId: string) { const r = await this.prisma.formularioRespuesta.create({ data: { templateId: dto.templateId, ordenId: dto.ordenId, respuestas: JSON.stringify(dto.respuestas), completadoPorId: userId } }); return { message: 'Respuesta guardada', data: r }; }
}
