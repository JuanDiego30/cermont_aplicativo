/**
 * @file zod-validation.pipe.ts
 * @description Pipe de validación con Zod
 *
 * Alternativa a class-validator con schemas declarativos
 * 
 * NOTA: Requiere instalar zod: pnpm add zod
 */

import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import type { ValidationErrorItem } from '../types/api-response.types';

/**
 * Interface para ZodSchema (evita dependencia directa de zod)
 */
interface ZodSchemaLike<T> {
    safeParse(value: unknown): { success: true; data: T } | { success: false; error: ZodErrorLike };
}

interface ZodErrorLike {
    errors: Array<{
        path: Array<string | number>;
        message: string;
    }>;
}

/**
 * Pipe para validación con Zod schemas
 *
 * Uso:
 * ```ts
 * import { z } from 'zod';
 * 
 * const userSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 * });
 *
 * @Post()
 * create(@Body(new ZodValidationPipe(userSchema)) data: CreateUserDto) {
 *   // data está validado y tipado
 * }
 * ```
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodSchemaLike<T>) {}

    transform(value: unknown, _metadata: ArgumentMetadata): T {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            const errors = this.formatZodErrors(result.error);
            throw new BadRequestException({
                message: 'Error de validación',
                errors,
            });
        }

        return result.data;
    }

    /**
     * Formatea errores de Zod a nuestro formato estándar
     */
    private formatZodErrors(error: ZodErrorLike): ValidationErrorItem[] {
        return error.errors.map((issue) => ({
            field: issue.path.join('.') || 'value',
            message: issue.message,
            value: undefined, // No exponemos el valor por seguridad
        }));
    }
}

/**
 * Factory function para crear ZodValidationPipe
 * Útil cuando se usa con decoradores
 */
export function createZodValidationPipe<T>(schema: ZodSchemaLike<T>): ZodValidationPipe<T> {
    return new ZodValidationPipe(schema);
}
