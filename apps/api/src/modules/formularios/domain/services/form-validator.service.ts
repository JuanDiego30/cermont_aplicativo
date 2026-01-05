/**
 * Domain Service: FormValidatorService
 *
 * Servicio de dominio para validar submissions contra templates
 */

import { FormTemplate } from "../entities/form-template.entity";
import { FieldValue } from "../value-objects/field-value.vo";
import { isFieldVisible } from "./field-visibility";

export interface ValidationErrorItem {
  fieldId: string;
  message: string;
}

export class FormValidatorService {
  /**
   * Validar respuestas contra template
   */
  validate(
    answers: Map<string, FieldValue>,
    template: FormTemplate,
  ): ValidationErrorItem[] {
    const errors: ValidationErrorItem[] = [];

    const formData: Record<string, any> = {};
    for (const [key, value] of answers.entries()) {
      formData[key] = value.getValue();
    }

    // Validar campos requeridos
    const requiredFields = template.getRequiredFields();
    for (const field of requiredFields) {
      // Campos ocultos por lógica condicional no deben exigirse
      if (!isFieldVisible(field, formData)) {
        continue;
      }

      // Campos calculados se rellenan automáticamente
      if (field.isCalculated()) {
        continue;
      }

      if (!answers.has(field.getId())) {
        errors.push({
          fieldId: field.getId(),
          message: `Field "${field.getLabel()}" is required`,
        });
      }
    }

    // Validar tipo y reglas de cada respuesta
    for (const [fieldId, value] of answers.entries()) {
      const field = template.getField(fieldId);
      if (!field) {
        errors.push({
          fieldId,
          message: `Field "${fieldId}" does not exist in template`,
        });
        continue;
      }

      // Campos ocultos por lógica condicional se ignoran
      if (!isFieldVisible(field, formData)) {
        continue;
      }

      // Campos calculados se ignoran (se recalculan en submit)
      if (field.isCalculated()) {
        continue;
      }

      const validationResult = field.validateValue(value.getValue());
      if (!validationResult.isValid) {
        errors.push({
          fieldId,
          message: validationResult.error || "Invalid value",
        });
      }
    }

    return errors;
  }

  /**
   * Validar estructura de template
   */
  validateTemplateStructure(template: FormTemplate): string[] {
    const errors: string[] = [];

    if (template.getFields().length === 0) {
      errors.push("Template must have at least one field");
    }

    for (const field of template.getFields()) {
      if (!field.isValid()) {
        errors.push(`Field "${field.getLabel()}" is invalid`);
      }
    }

    return errors;
  }
}
