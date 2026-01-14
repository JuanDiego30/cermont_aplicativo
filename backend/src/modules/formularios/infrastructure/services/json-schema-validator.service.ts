/**
 * Service: JSONSchemaValidatorService
 *
 * Valida datos contra JSON Schema usando AJV
 */

import { Injectable } from "@nestjs/common";
import Ajv from "ajv";

@Injectable()
export class JSONSchemaValidatorService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateSchema: false,
    });

    // Agregar formatos (email, uri, date, etc.)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const addFormats = require("ajv-formats");
    addFormats(this.ajv);
  }

  /**
   * Validar datos contra schema
   */
  validate(
    data: Record<string, any>,
    schema: Record<string, any>,
  ): { isValid: boolean; errors?: any[] } {
    try {
      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (!valid) {
        return {
          isValid: false,
          errors: validate.errors || [],
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            message:
              error instanceof Error ? error.message : "Validation error",
          },
        ],
      };
    }
  }

  /**
   * Validar schema en sí mismo
   */
  validateSchema(schema: Record<string, any>): boolean {
    try {
      this.ajv.compile(schema);
      return true;
    } catch {
      return false;
    }
  }
}
