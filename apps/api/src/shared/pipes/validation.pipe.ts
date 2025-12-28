import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Validation failed: No data provided');
    }

    // Si no hay DTO o metatype, pasar directamente
    if (!metadata.type || metadata.type === 'custom' || !metadata.metatype) {
      return value;
    }

    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private formatErrors(
    errors: ValidationError[],
    parent?: string,
  ): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    errors.forEach((error) => {
      const field = parent ? `${parent}.${error.property}` : error.property;

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children, field);
        Object.assign(formatted, nestedErrors);
      } else if (error.constraints) {
        formatted[field] = Object.values(error.constraints);
      }
    });

    return formatted;
  }
}
