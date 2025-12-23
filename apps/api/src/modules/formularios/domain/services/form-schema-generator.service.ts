/**
 * Domain Service: FormSchemaGeneratorService
 * 
 * Servicio de dominio para generar JSON Schema desde campos
 */

import { FormField } from '../entities/form-field.entity';

export class FormSchemaGeneratorService {
  /**
   * Generar JSON Schema desde campos
   */
  generate(fields: FormField[]): Record<string, any> {
    const schema: Record<string, any> = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {},
      required: [],
    };

    for (const field of fields) {
      const fieldSchema = this.generateFieldSchema(field);
      schema.properties[field.getId()] = fieldSchema;

      if (field.isRequired()) {
        schema.required.push(field.getId());
      }
    }

    return schema;
  }

  /**
   * Generar schema para un campo individual
   */
  private generateFieldSchema(field: FormField): Record<string, any> {
    const schema: Record<string, any> = {
      type: field.getType().getJsonSchemaType(),
      title: field.getLabel(),
    };

    if (field.getHelpText()) {
      schema.description = field.getHelpText();
    }

    // Agregar validaciones
    for (const validation of field.getValidations()) {
      Object.assign(schema, validation.toJsonSchema());
    }

    // Opciones para SELECT, RADIO, etc.
    if (field.getType().requiresOptions()) {
      schema.enum = field.getOptions();
    }

    // Default value
    const defaultValue = field.getDefaultValue();
    if (defaultValue) {
      schema.default = defaultValue.getValue();
    }

    // Array items para MULTISELECT
    if (field.getType().getValue() === 'MULTISELECT') {
      schema.items = {
        type: 'string',
        enum: field.getOptions(),
      };
    }

    return schema;
  }
}

