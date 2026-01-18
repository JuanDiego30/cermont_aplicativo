import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormInstanceDto, CreateFormTemplateDto, UpdateFormInstanceDto } from './forms.dto';

/**
 * Simple FormsService - Direct Prisma access
 * Manages form templates and instances
 */
@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===== TEMPLATES =====

  async findAllTemplates(filters?: { tipo?: string; activo?: boolean }) {
    const where: Record<string, unknown> = {};
    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.activo !== undefined) where.activo = filters.activo;

    return this.prisma.formTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async createTemplate(dto: CreateFormTemplateDto, userId: string) {
    return this.prisma.formTemplate.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        categoria: dto.categoria,
        descripcion: dto.descripcion,
        schema: dto.schema,
        uiSchema: dto.uiSchema,
        creadoPorId: userId,
      },
    });
  }

  // ===== INSTANCES =====

  async findAllInstances(filters?: { templateId?: string; ordenId?: string; estado?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.templateId) where.templateId = filters.templateId;
    if (filters?.ordenId) where.ordenId = filters.ordenId;
    if (filters?.estado) where.estado = filters.estado;

    return this.prisma.formularioInstancia.findMany({
      where,
      include: { template: { select: { nombre: true, tipo: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findInstanceById(id: string) {
    const instance = await this.prisma.formularioInstancia.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!instance) throw new NotFoundException(`Form instance ${id} not found`);
    return instance;
  }

  async createInstance(dto: CreateFormInstanceDto, userId: string) {
    return this.prisma.formularioInstancia.create({
      data: {
        templateId: dto.templateId,
        ordenId: dto.ordenId,
        ejecucionId: dto.ejecucionId,
        data: dto.data,
        estado: 'borrador',
        completadoPorId: userId,
      },
    });
  }

  async updateInstance(id: string, dto: UpdateFormInstanceDto) {
    await this.findInstanceById(id);

    return this.prisma.formularioInstancia.update({
      where: { id },
      data: {
        data: dto.data,
        estado: dto.estado,
      },
    });
  }

  async completeInstance(id: string, userId: string) {
    await this.findInstanceById(id);

    return this.prisma.formularioInstancia.update({
      where: { id },
      data: {
        estado: 'completado',
        completadoPorId: userId,
        completadoEn: new Date(),
      },
    });
  }

  async deleteInstance(id: string) {
    await this.findInstanceById(id);
    return this.prisma.formularioInstancia.delete({ where: { id } });
  }
}
