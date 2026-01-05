import { NotFoundException } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import { FormTemplateId } from "../../domain/value-objects/form-template-id.vo";
import { IFormTemplateRepository } from "../../domain/repositories";

export async function getTemplateOrThrow(
  templateRepository: IFormTemplateRepository,
  templateId: string,
): Promise<FormTemplate> {
  const id = FormTemplateId.create(templateId);

  const template = await templateRepository.findById(id);
  if (!template) {
    throw new NotFoundException(`Template not found: ${templateId}`);
  }

  return template;
}
