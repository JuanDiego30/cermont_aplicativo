/**
 * @dto UserQueryDto
 *
 * DTO para filtros y paginación de usuarios.
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * DTO class para Swagger documentation
 */
export class UserQueryDto {
  @ApiPropertyOptional({
    enum: USER_ROLES,
    description: "Filtrar por rol",
  })
  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRoleType;

  @ApiPropertyOptional({
    example: true,
    description: "Filtrar por estado activo",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: "juan",
    description: "Búsqueda por nombre o email",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "Número de página",
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: "Cantidad por página (max 100)",
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
