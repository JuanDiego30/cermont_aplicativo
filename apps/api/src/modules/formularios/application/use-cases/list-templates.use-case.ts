/**
 * Use Case: ListTemplatesUseCase
 *
 * Lista templates con filtros opcionales
 */

import { Injectable, Inject } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import {
  IFormTemplateRepository,
  FORM_TEMPLATE_REPOSITORY,
} from "../../domain/repositories";
import { ListTemplatesQueryDto } from "../dto/list-templates-query.dto";

@Injectable()
export class ListTemplatesUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository,
  ) {}

  async execute(query: ListTemplatesQueryDto): Promise<FormTemplate[]> {
    // Si se especifica contexto, filtrar por contexto
    if (query.contextType) {
      return this.templateRepository.findByContext(query.contextType);
    }

    // Si se especifica solo publicados
    if (query.publishedOnly) {
      return this.templateRepository.findPublished();
    }

    // Si se especifica solo activos
    if (query.activeOnly) {
      return this.templateRepository.findAllActive();
    }

    // Por defecto, todos los activos
    return this.templateRepository.findAllActive();
  }
}
