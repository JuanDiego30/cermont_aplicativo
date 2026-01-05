/**
 * @file parse-int.pipe.ts
 * @description Pipe para parseo seguro de integers con validación
 */

import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

export interface ParseIntPipeOptions {
  /** Nombre del campo para mensajes de error */
  fieldName?: string;
  /** Valor mínimo permitido */
  min?: number;
  /** Valor máximo permitido */
  max?: number;
  /** Si es true, permite undefined/null */
  optional?: boolean;
}

/**
 * Pipe para parsear strings a integers con validación
 *
 * Uso:
 * ```ts
 * @Get(':id')
 * findOne(@Param('id', new ParseIntSafePipe({ fieldName: 'id', min: 1 })) id: number) {
 *   return this.service.findOne(id);
 * }
 * ```
 */
@Injectable()
export class ParseIntSafePipe implements PipeTransform<string, number> {
  private readonly fieldName: string;
  private readonly options: ParseIntPipeOptions;

  constructor(options: ParseIntPipeOptions = {}) {
    this.fieldName = options.fieldName ?? "valor";
    this.options = options;
  }

  transform(value: string | undefined | null): number {
    // Manejar valores vacíos
    if (value === undefined || value === null || value === "") {
      if (this.options.optional) {
        return undefined as unknown as number;
      }
      throw new BadRequestException(`${this.fieldName} es requerido`);
    }

    // Parsear a entero
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException(
        `${this.fieldName} debe ser un número entero`,
      );
    }

    // Validar mínimo
    if (this.options.min !== undefined && val < this.options.min) {
      throw new BadRequestException(
        `${this.fieldName} debe ser mayor o igual a ${this.options.min}`,
      );
    }

    // Validar máximo
    if (this.options.max !== undefined && val > this.options.max) {
      throw new BadRequestException(
        `${this.fieldName} debe ser menor o igual a ${this.options.max}`,
      );
    }

    return val;
  }
}

/**
 * Pipe para parsear IDs (enteros positivos)
 */
@Injectable()
export class ParseIdPipe extends ParseIntSafePipe {
  constructor(fieldName: string = "id") {
    super({
      fieldName,
      min: 1,
    });
  }
}

/**
 * Pipe para parsear UUIDs
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  private readonly fieldName: string;
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(fieldName: string = "id") {
    this.fieldName = fieldName;
  }

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException(`${this.fieldName} es requerido`);
    }

    if (!ParseUuidPipe.UUID_REGEX.test(value)) {
      throw new BadRequestException(
        `${this.fieldName} debe ser un UUID válido`,
      );
    }

    return value.toLowerCase();
  }
}

/**
 * Pipe para parsear boolean desde query string
 */
@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  private readonly fieldName: string;

  constructor(fieldName: string = "valor") {
    this.fieldName = fieldName;
  }

  transform(value: string | undefined | null): boolean {
    if (value === undefined || value === null || value === "") {
      return false;
    }

    const normalized = value.toLowerCase().trim();

    if (["true", "1", "yes", "si"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }

    throw new BadRequestException(
      `${this.fieldName} debe ser un valor booleano (true/false)`,
    );
  }
}
