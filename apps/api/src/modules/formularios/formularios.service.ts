import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormTemplateDto, UpdateFormTemplateDto } from './application/dto/form-template.dto';
import { SubmitFormDto } from './application/dto/submit-form.dto';
import { FormParserService } from './infrastructure/services/form-parser.service';
import { Prisma } from '.prisma/client';
import type { TipoFormulario } from '.prisma/client';

@Injectable()
export class FormulariosService {
    private readonly logger = new Logger(FormulariosService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly formParser: FormParserService,
    ) { }

    // ========================================
    // TEMPLATES CRUD
    // ========================================

    async createTemplate(dto: CreateFormTemplateDto) {
        this.logger.log('Creando nuevo template de formulario', { nombre: dto.nombre });

        // Verificar nombre único
        const existing = await this.prisma.formTemplate.findUnique({
            where: { nombre: dto.nombre },
        });

        if (existing) {
            throw new ConflictException(`Ya existe un template con nombre: ${dto.nombre}`);
        }

        const template = await this.prisma.formTemplate.create({
            data: {
                nombre: dto.nombre,
                tipo: dto.tipo as any,
                categoria: dto.categoria,
                version: dto.version || '1.0',
                schema: dto.schema as unknown as Prisma.InputJsonValue,
                uiSchema: (dto.uiSchema || Prisma.JsonNull) as unknown as Prisma.InputJsonValue,
                descripcion: dto.descripcion,
                tags: dto.tags || [],
                activo: dto.activo ?? true,
            },
        });

        this.logger.log('Template creado exitosamente', { id: template.id });
        return template;
    }

    async findAllTemplates(filters?: { tipo?: TipoFormulario; categoria?: string; activo?: boolean }) {
        const where: Prisma.FormTemplateWhereInput = {};

        if (filters?.tipo) where.tipo = filters.tipo;
        if (filters?.categoria) where.categoria = filters.categoria;
        if (filters?.activo !== undefined) where.activo = filters.activo;

        return this.prisma.formTemplate.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { instancias: true } },
            },
        });
    }

    async findTemplateById(id: string) {
        const template = await this.prisma.formTemplate.findUnique({
            where: { id },
            include: {
                _count: { select: { instancias: true } },
            },
        });

        if (!template) {
            throw new NotFoundException(`Template no encontrado: ${id}`);
        }

        return template;
    }

    async updateTemplate(id: string, dto: UpdateFormTemplateDto) {
        await this.findTemplateById(id);

        // Si cambia el nombre, verificar unicidad
        if (dto.nombre) {
            const existing = await this.prisma.formTemplate.findFirst({
                where: { nombre: dto.nombre, NOT: { id } },
            });
            if (existing) {
                throw new ConflictException(`Ya existe un template con nombre: ${dto.nombre}`);
            }
        }

        const data: Prisma.FormTemplateUpdateInput = {
            nombre: dto.nombre,
            tipo: dto.tipo as any,
            categoria: dto.categoria,
            version: dto.version,
            descripcion: dto.descripcion,
            tags: dto.tags,
            activo: dto.activo,
            schema: dto.schema ? (dto.schema as unknown as Prisma.InputJsonValue) : undefined,
            uiSchema: dto.uiSchema ? (dto.uiSchema as unknown as Prisma.InputJsonValue) : undefined,
        };

        return this.prisma.formTemplate.update({
            where: { id },
            data,
        });
    }

    async deleteTemplate(id: string) {
        await this.findTemplateById(id);

        // Soft delete - solo desactivar
        return this.prisma.formTemplate.update({
            where: { id },
            data: { activo: false },
        });
    }

    // ========================================
    // FORMULARIO INSTANCIAS
    // ========================================

    async submitForm(dto: SubmitFormDto, userId: string) {
        this.logger.log('Guardando instancia de formulario', { templateId: dto.templateId, userId });

        // Verificar template existe
        await this.findTemplateById(dto.templateId);

        // Verificar orden si se proporciona
        if (dto.ordenId) {
            const orden = await this.prisma.order.findUnique({ where: { id: dto.ordenId } });
            if (!orden) {
                throw new NotFoundException(`Orden no encontrada: ${dto.ordenId}`);
            }
        }

        const instancia = await this.prisma.formularioInstancia.create({
            data: {
                templateId: dto.templateId,
                ordenId: dto.ordenId || null,
                data: dto.data as unknown as Prisma.InputJsonValue,
                completadoPorId: userId,
                completadoEn: dto.estado === 'completado' ? new Date() : null,
                estado: (dto.estado || 'borrador') as any,
            },
            include: {
                template: { select: { nombre: true, tipo: true } },
                orden: { select: { numero: true } },
            },
        });

        this.logger.log('Formulario guardado exitosamente', { id: instancia.id });
        return instancia;
    }

    async findAllInstances(filters?: { templateId?: string; ordenId?: string; estado?: string }) {
        const where: Prisma.FormularioInstanciaWhereInput = {};

        if (filters?.templateId) where.templateId = filters.templateId;
        if (filters?.ordenId) where.ordenId = filters.ordenId;
        if (filters?.estado) where.estado = filters.estado as any;

        return this.prisma.formularioInstancia.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                template: { select: { nombre: true, tipo: true, categoria: true } },
                orden: { select: { numero: true, cliente: true } },
                completadoPor: { select: { name: true, email: true } },
            },
        });
    }

    async findInstanceById(id: string) {
        const instancia = await this.prisma.formularioInstancia.findUnique({
            where: { id },
            include: {
                template: true,
                orden: { select: { numero: true, cliente: true } },
                completadoPor: { select: { name: true, email: true } },
            },
        });

        if (!instancia) {
            throw new NotFoundException(`Formulario no encontrado: ${id}`);
        }

        return instancia;
    }

    async updateInstance(id: string, dto: Partial<SubmitFormDto>, userId: string) {
        await this.findInstanceById(id);

        const data: Prisma.FormularioInstanciaUpdateInput = {
            data: dto.data ? (dto.data as unknown as Prisma.InputJsonValue) : undefined,
            completadoPor: { connect: { id: userId } },
            completadoEn: dto.estado === 'completado' ? new Date() : undefined,
            estado: dto.estado as any,
        };

        return this.prisma.formularioInstancia.update({
            where: { id },
            data,
        });
    }

    async deleteInstance(id: string) {
        await this.findInstanceById(id);

        return this.prisma.formularioInstancia.delete({
            where: { id },
        });
    }

    // ========================================
    // PARSING (PDF/EXCEL → TEMPLATE)
    // ========================================

    async parseAndCreateTemplate(file: { buffer: Buffer; originalname: string; mimetype: string }) {
        this.logger.log('Parseando archivo para crear template', {
            filename: file.originalname,
            mimetype: file.mimetype,
        });

        let parsed;

        if (file.mimetype === 'application/pdf') {
            parsed = await this.formParser.parseFromPDF(file.buffer, file.originalname);
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            parsed = await this.formParser.parseFromExcel(file.buffer, file.originalname);
        } else {
            throw new ConflictException('Tipo de archivo no soportado. Use PDF o Excel.');
        }

        // Crear template con datos parseados
        return this.createTemplate({
            nombre: parsed.nombre,
            tipo: parsed.tipo as CreateFormTemplateDto['tipo'],
            categoria: 'Auto-generado',
            schema: { sections: parsed.sections },
            descripcion: `Generado automáticamente desde: ${file.originalname}`,
            tags: ['auto-generado'],
        });
    }
}
