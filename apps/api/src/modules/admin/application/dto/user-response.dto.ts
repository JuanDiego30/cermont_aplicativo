/**
 * @dto UserResponseDto
 *
 * DTO para respuestas de usuario (sin información sensible).
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { type UserRoleType } from "../../domain/value-objects/user-role.vo";

/**
 * Response DTO para un usuario individual
 */
export class UserResponseDto {
  @ApiProperty({
    example: "uuid-user-123",
    description: "ID único del usuario",
  })
  id!: string;

  @ApiProperty({
    example: "tecnico@cermont.com",
    description: "Email del usuario",
  })
  email!: string;

  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo",
  })
  name!: string;

  @ApiProperty({
    example: "tecnico",
    description: "Rol del usuario",
  })
  role!: UserRoleType;

  @ApiPropertyOptional({
    example: "+57 3001234567",
    description: "Teléfono de contacto",
  })
  phone?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL del avatar",
  })
  avatar?: string;

  @ApiProperty({
    example: true,
    description: "Estado activo del usuario",
  })
  active!: boolean;

  @ApiPropertyOptional({
    example: "2024-12-13T10:00:00.000Z",
    description: "Último login (ISO 8601)",
  })
  lastLogin?: string;

  @ApiProperty({
    example: "2024-12-01T08:00:00.000Z",
    description: "Fecha de creación (ISO 8601)",
  })
  createdAt!: string;

  @ApiPropertyOptional({
    example: "2024-12-13T15:30:00.000Z",
    description: "Última actualización (ISO 8601)",
  })
  updatedAt?: string;
}

/**
 * Response DTO para listado paginado
 */
export class PaginatedUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: "Lista de usuarios",
  })
  data!: UserResponseDto[];

  @ApiProperty({
    example: 50,
    description: "Total de usuarios",
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: "Página actual",
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: "Cantidad por página",
  })
  pageSize!: number;

  @ApiProperty({
    example: 5,
    description: "Total de páginas",
  })
  totalPages!: number;
}

/**
 * Response DTO para operaciones de acción
 */
export class ActionResponseDto<T = UserResponseDto> {
  @ApiProperty({
    example: true,
    description: "Indica si la operación fue exitosa",
  })
  success!: boolean;

  @ApiProperty({
    example: "Operación completada exitosamente",
    description: "Mensaje de resultado",
  })
  message!: string;

  @ApiPropertyOptional({
    description: "Datos resultantes de la operación",
  })
  data?: T;
}

/**
 * Response DTO para estadísticas
 */
export class UserStatsResponseDto {
  @ApiProperty({
    example: 50,
    description: "Total de usuarios",
  })
  total!: number;

  @ApiProperty({
    example: 45,
    description: "Usuarios activos",
  })
  activos!: number;

  @ApiProperty({
    example: { admin: 2, supervisor: 5, tecnico: 30, administrativo: 13 },
    description: "Usuarios por rol",
  })
  porRol!: Record<string, number>;
}
