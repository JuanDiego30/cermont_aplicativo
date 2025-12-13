/**
 * @dto ToggleActiveDto
 * 
 * DTO para activar/desactivar usuario.
 */

import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Schema Zod para validación
 */
export const ToggleActiveSchema = z.object({
  active: z.boolean({
    required_error: 'El campo active es requerido',
    invalid_type_error: 'El campo active debe ser booleano',
  }),
  reason: z.string().max(500).optional(),
});

export type ToggleActiveInput = z.infer<typeof ToggleActiveSchema>;

/**
 * DTO class para Swagger documentation
 */
export class ToggleActiveDto implements ToggleActiveInput {
  @ApiProperty({
    example: false,
    description: 'Estado activo del usuario',
  })
  active!: boolean;

  @ApiPropertyOptional({
    example: 'Usuario solicitó baja',
    description: 'Razón del cambio de estado (opcional)',
    maxLength: 500,
  })
  reason?: string;
}
