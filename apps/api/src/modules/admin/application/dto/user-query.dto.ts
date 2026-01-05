/**
 * @dto UserQueryDto
 *
 * DTO para filtros y paginación de usuarios.
 */

import { z } from "zod";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * Schema Zod para validación
 */
export const UserQuerySchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  active: z
    .string()
    .transform((val) => val === "true")
    .optional()
    .or(z.boolean().optional()),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type UserQueryInput = z.infer<typeof UserQuerySchema>;

/**
 * DTO class para Swagger documentation
 */
export class UserQueryDto {
  @ApiPropertyOptional({
    enum: USER_ROLES,
    description: "Filtrar por rol",
  })
  role?: UserRoleType;

  @ApiPropertyOptional({
    example: true,
    description: "Filtrar por estado activo",
  })
  active?: boolean;

  @ApiPropertyOptional({
    example: "juan",
    description: "Búsqueda por nombre o email",
    maxLength: 100,
  })
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Número de página",
    default: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: "Cantidad por página (max 100)",
    default: 10,
  })
  pageSize?: number;
}
