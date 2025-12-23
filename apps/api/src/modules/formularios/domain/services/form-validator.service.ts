/**
 * Domain Service: FormValidatorService
 * 
 * Servicio de dominio para validar submissions contra templates
 */

import { FormTemplate } from '../entities/form-template.entity';
import { FormField } from '../entities/form-field.entity';
import { FieldValue } from '../value-objects/field-value.vo';
import { ValidationFailedException } from '../exceptions/validation-failed.exception';
import { ValidationError } from '../../../../common/domain/exceptions';

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

    // Validar campos requeridos
    const requiredFields = template.getRequiredFields();
    for (const field of requiredFields) {
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

      const validationResult = field.validateValue(value.getValue());
      if (!validationResult.isValid) {
        errors.push({
          fieldId,
          message: validationResult.error || 'Invalid value',
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
      errors.push('Template must have at least one field');
    }

    for (const field of template.getFields()) {
      if (!field.isValid()) {
        errors.push(`Field "${field.getLabel()}" is invalid`);
      }
    }

    return errors;
  }
}

