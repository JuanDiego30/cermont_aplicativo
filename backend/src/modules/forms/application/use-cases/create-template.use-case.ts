/**
 * Use Case: CreateTemplateUseCase
 *
 * Crea un nuevo template de formulario
 */

import { Injectable, Inject } from '@nestjs/common';
import { FormTemplate } from '../../domain/entities/form-template.entity';
import { FormField } from '../../domain/entities/form-field.entity';
import { FieldType } from '../../domain/value-objects/field-type.vo';
import { IFormTemplateRepository, FORM_TEMPLATE_REPOSITORY } from '../../domain/repositories';
import { TemplateNotPublishableException } from '../../domain/exceptions';
import { CreateFormTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class CreateTemplateUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository
  ) {}

  async execute(dto: CreateFormTemplateDto, createdBy: string): Promise<FormTemplate> {
    // Verificar que no exista template con mismo nombre
    const exists = await this.templateRepository.exists(dto.name);
    if (exists) {
      throw new Error(`Template with name "${dto.name}" already exists`);
    }

    // Convertir DTO a Entities
    const fields = (dto.fields || []).map(fieldDto =>
      FormField.create({
        id: fieldDto.id,
        type: FieldType.fromString(fieldDto.type),
        label: fieldDto.label,
        placeholder: fieldDto.placeholder,
        helpText: fieldDto.helpText,
        defaultValue: fieldDto.defaultValue,
        isRequired: fieldDto.isRequired || false,
        order: fieldDto.order || 0,
        options: fieldDto.options,
      })
    );

    // Crear template
    const template = FormTemplate.create({
      name: dto.name,
      description: dto.description,
      contextType: dto.contextType,
      createdBy,
      fields,
    });

    // Guardar
    const saved = await this.templateRepository.save(template);

    // Publicar eventos de dominio
    // (se manejan en el módulo)

    return saved;
  }
}
