/**
 * Mapper: FormTemplateMapper
 *
 * Mapea entre Domain Entities y DTOs/Prisma
 */

import { FormTemplate } from '../../domain/entities/form-template.entity';
import { FormField } from '../../domain/entities/form-field.entity';
import { FormTemplateResponseDto } from '../dto/form-template-response.dto';
import { FieldType } from '../../domain/value-objects/field-type.vo';
import { ValidationRule } from '../../domain/value-objects/validation-rule.vo';

type CermontTemplateMeta = {
  status?: string;
  fields?: any[];
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  archivedAt?: string;
};

const CERMONT_SCHEMA_META_KEY = 'x-cermont';

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
      fields: template.getFields().map(field => ({
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
    const baseSchema = template.getSchema();
    const meta: CermontTemplateMeta = {
      status: template.getStatus().getValue(),
      fields: template.getFields().map(f => f.toPersistence()),
      createdBy: template.getCreatedBy(),
      updatedBy: template.getUpdatedBy(),
      publishedAt: template.getPublishedAt()?.toISOString(),
      archivedAt: template.getArchivedAt()?.toISOString(),
    };

    return {
      id: template.getId().getValue(),
      nombre: template.getName(),
      descripcion: template.getDescription(),
      version: template.getVersion().toString(),
      tipo: template.getContextType(),
      categoria: template.getContextType(), // Mapear contexto a categoría
      schema: {
        ...baseSchema,
        [CERMONT_SCHEMA_META_KEY]: meta,
      },
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
    const schema: Record<string, any> = prismaData.schema || {};
    const meta: CermontTemplateMeta | undefined = schema?.[CERMONT_SCHEMA_META_KEY];

    // 1) Preferir metadata rica (round-trip sin pérdida)
    let fields: FormField[] = [];
    if (Array.isArray(meta?.fields)) {
      fields = meta!.fields.map(f => FormField.fromPersistence(f));
    } else {
      // 2) Fallback best-effort desde JSON Schema (legacy)
      const requiredSet = new Set<string>(Array.isArray(schema.required) ? schema.required : []);
      const properties: Record<string, any> = schema.properties || {};

      const toFieldType = (propertySchema: any): FieldType => {
        if (Array.isArray(propertySchema?.enum)) {
          return FieldType.select();
        }

        switch (propertySchema?.type) {
          case 'number':
            return FieldType.number();
          case 'boolean':
            return FieldType.checkbox();
          case 'array':
            return FieldType.multiselect();
          default:
            return FieldType.text();
        }
      };

      const toValidations = (propertySchema: any): ValidationRule[] => {
        const rules: ValidationRule[] = [];
        if (typeof propertySchema?.minLength === 'number') {
          rules.push(ValidationRule.minLength(propertySchema.minLength));
        }
        if (typeof propertySchema?.maxLength === 'number') {
          rules.push(ValidationRule.maxLength(propertySchema.maxLength));
        }
        if (typeof propertySchema?.minimum === 'number') {
          rules.push(ValidationRule.minValue(propertySchema.minimum));
        }
        if (typeof propertySchema?.maximum === 'number') {
          rules.push(ValidationRule.maxValue(propertySchema.maximum));
        }
        if (typeof propertySchema?.pattern === 'string' && propertySchema.pattern.length > 0) {
          rules.push(ValidationRule.pattern(new RegExp(propertySchema.pattern)));
        }
        if (propertySchema?.format === 'email') {
          rules.push(ValidationRule.email());
        }
        if (propertySchema?.format === 'uri') {
          rules.push(ValidationRule.url());
        }
        return rules;
      };

      fields = Object.entries(properties).map(([fieldId, propertySchema], index) => {
        const label = propertySchema?.title || fieldId;
        return FormField.create({
          id: fieldId,
          type: toFieldType(propertySchema),
          label,
          helpText: propertySchema?.description,
          options: Array.isArray(propertySchema?.enum) ? propertySchema.enum : undefined,
          order: index,
          isRequired: requiredSet.has(fieldId),
          validations: toValidations(propertySchema),
        });
      });
    }

    const statusFromMeta = typeof meta?.status === 'string' ? meta!.status : undefined;
    const status = statusFromMeta ? statusFromMeta : prismaData.activo ? 'PUBLISHED' : 'ARCHIVED';

    return FormTemplate.fromPersistence({
      id: prismaData.id,
      name: prismaData.nombre,
      description: prismaData.descripcion,
      version: prismaData.version,
      status,
      fields,
      schema,
      contextType: prismaData.tipo || prismaData.categoria,
      createdBy: prismaData.creadoPorId || meta?.createdBy || '',
      createdAt: prismaData.createdAt,
      updatedBy: meta?.updatedBy,
      updatedAt: prismaData.updatedAt,
      publishedAt: meta?.publishedAt ? new Date(meta.publishedAt) : undefined,
      archivedAt: meta?.archivedAt ? new Date(meta.archivedAt) : undefined,
    });
  }
}
