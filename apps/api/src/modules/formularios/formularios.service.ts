/**
 * @service FormulariosService
 * @description Servicio para gestión de formularios dinámicos
 * 
 * Permite crear templates de formularios y registrar respuestas
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

interface FormularioSchema {
  campos: Array<{
    nombre: string;
    tipo: 'texto' | 'numero' | 'fecha' | 'seleccion' | 'checkbox';
    requerido: boolean;
    opciones?: string[];
  }>;
}

interface CreateTemplateDto {
  nombre: string;
  descripcion?: string;
  schema: FormularioSchema;
}

interface SubmitResponseDto {
  templateId: string;
  ordenId?: string;
  respuestas: Record<string, unknown>;
}

export interface FormularioResponse<T> {
  message?: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class FormulariosService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lista todos los templates de formularios activos
   */
  async findTemplates(): Promise<FormularioResponse<unknown[]>> {
    const templates = await this.prisma.formularioTemplate.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return { data: templates };
  }

  /**
   * Obtiene un template por ID
   */
  async findTemplate(id: string) {
    const template = await this.prisma.formularioTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template con ID ${id} no encontrado`);
    }

    return template;
  }

  /**
   * Crea un nuevo template de formulario
   */
  async createTemplate(
    dto: CreateTemplateDto,
    userId: string,
  ): Promise<FormularioResponse<unknown>> {
    const template = await this.prisma.formularioTemplate.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        schema: JSON.stringify(dto.schema),
        creadoPorId: userId,
      },
    });

    return {
      message: 'Template creado exitosamente',
      data: template,
    };
  }

  /**
   * Guarda respuestas de un formulario
   */
  async submitResponse(
    dto: SubmitResponseDto,
    userId: string,
  ): Promise<FormularioResponse<unknown>> {
    const respuesta = await this.prisma.formularioRespuesta.create({
      data: {
        templateId: dto.templateId,
        ordenId: dto.ordenId,
        respuestas: JSON.stringify(dto.respuestas),
        completadoPorId: userId,
      },
    });

    return {
      message: 'Respuesta guardada exitosamente',
      data: respuesta,
    };
  }
}
