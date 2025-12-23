/**
 * Mapper: FormTemplateMapper
 * 
 * Mapea entre Domain Entities y DTOs/Prisma
 */

import { FormTemplate } from '../../domain/entities/form-template.entity';
import { FormField } from '../../domain/entities/form-field.entity';
import { FormTemplateResponseDto } from '../dto/form-template-response.dto';

export class FormTemplateMapper {
  /**
   * Mapear Entity a Response DTO
   */
  static toResponseDto(template: FormTemplate): FormTemplateResponseDto {
    return {
      id: template.getId().getValue(),
      name: template.getName(),
      description: template.getDescription(),
      version: template.getVersion().toString(),
      status: template.getStatus().getValue(),
      contextType: template.getContextType(),
      fields: template.getFields().map((field) => ({
        id: field.getId(),
        type: field.getType().getValue(),
        label: field.getLabel(),
        placeholder: field.getPlaceholder(),
        helpText: field.getHelpText(),
        isRequired: field.isRequired(),
        order: field.getOrder(),
        options: field.getOptions(),
      })),
      schema: template.getSchema(),
      createdAt: template.getCreatedAt(),
      updatedAt: template.getUpdatedAt(),
      publishedAt: template.getPublishedAt(),
      createdBy: template.getCreatedBy(),
    };
  }

  /**
   * Mapear Entity a Prisma (para persistencia)
   */
  static toPrisma(template: FormTemplate): any {
    return {
      id: template.getId().getValue(),
      nombre: template.getName(),
      descripcion: template.getDescription(),
      version: template.getVersion().toString(),
      tipo: template.getContextType(),
      categoria: template.getContextType(), // Mapear contexto a categoría
      schema: template.getSchema(),
      activo: !template.isArchived(),
      creadoPorId: template.getCreatedBy(),
      createdAt: template.getCreatedAt(),
      updatedAt: template.getUpdatedAt(),
      // Campos se guardan en schema como JSON
    };
  }

  /**
   * Mapear Prisma a Entity (desde persistencia)
   */
  static fromPrisma(prismaData: any): FormTemplate {
    // Reconstruir campos desde schema
    const fields: FormField[] = [];
    if (prismaData.schema?.properties) {
      for (const [fieldId, fieldSchema] of Object.entries(prismaData.schema.properties as any)) {
        // Reconstruir field desde schema
        // Esto es simplificado - en producción necesitarías más información
      }
    }

    return FormTemplate.fromPersistence({
      id: prismaData.id,
      name: prismaData.nombre,
      description: prismaData.descripcion,
      version: prismaData.version,
      status: prismaData.activo ? 'PUBLISHED' : 'DRAFT', // Simplificado
      fields: fields,
      schema: prismaData.schema,
      contextType: prismaData.tipo || prismaData.categoria,
      createdBy: prismaData.creadoPorId || '',
      createdAt: prismaData.createdAt,
      updatedBy: prismaData.updatedBy,
      updatedAt: prismaData.updatedAt,
      publishedAt: prismaData.publishedAt,
      archivedAt: prismaData.archivedAt,
    });
  }
}

