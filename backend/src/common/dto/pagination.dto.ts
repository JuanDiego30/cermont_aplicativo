/**
 * @file pagination.dto.ts
 * @description DTOs para paginación estandarizada
 *
 * Separado de pagination.util.ts para mantener SRP
 * Los DTOs son para validación de entrada, las utils para lógica
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min, Max, IsString, IsIn } from "class-validator";

/**
 * DTO base para queries de paginación
 *
 * Uso: @Query() pagination: PaginationQueryDto
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: "Número de página",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "page debe ser un número entero" })
  @Min(1, { message: "page debe ser mayor o igual a 1" })
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: "Registros por página",
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "limit debe ser un número entero" })
  @Min(1, { message: "limit debe ser mayor o igual a 1" })
  @Max(100, { message: "limit no puede ser mayor a 100" })
  limit?: number = 10;

  /**
   * Calcula offset para queries SQL/Prisma
   */
  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }

  /**
   * Alias para limit (compatibilidad Prisma)
   */
  get take(): number {
    return this.limit ?? 10;
  }
}

/**
 * DTO para ordenamiento
 */
export class SortQueryDto {
  @ApiPropertyOptional({
    description: "Campo por el cual ordenar",
    example: "createdAt",
  })
  @IsOptional()
  @IsString({ message: "sortBy debe ser un string" })
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ["asc", "desc"],
    default: "desc",
    description: "Dirección del ordenamiento",
    example: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"], { message: 'sortOrder debe ser "asc" o "desc"' })
  sortOrder?: "asc" | "desc" = "desc";
}

/**
 * DTO combinado: paginación + ordenamiento
 *
 * Para endpoints que requieren ambas funcionalidades
 */
export class PaginationWithSortDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Campo por el cual ordenar",
    example: "createdAt",
  })
  @IsOptional()
  @IsString({ message: "sortBy debe ser un string" })
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ["asc", "desc"],
    default: "desc",
    description: "Dirección del ordenamiento",
  })
  @IsOptional()
  @IsIn(["asc", "desc"], { message: 'sortOrder debe ser "asc" o "desc"' })
  sortOrder?: "asc" | "desc" = "desc";

  /**
   * Genera objeto orderBy para Prisma
   */
  getOrderBy(): Record<string, "asc" | "desc"> | undefined {
    if (!this.sortBy) {
      return undefined;
    }
    return { [this.sortBy]: this.sortOrder ?? "desc" };
  }
}

/**
 * DTO para búsqueda con paginación
 */
export class SearchPaginationDto extends PaginationWithSortDto {
  @ApiPropertyOptional({
    description: "Término de búsqueda",
    example: "ejemplo",
  })
  @IsOptional()
  @IsString({ message: "search debe ser un string" })
  search?: string;

  /**
   * Verifica si hay término de búsqueda
   */
  get hasSearch(): boolean {
    return !!this.search && this.search.trim().length > 0;
  }

  /**
   * Obtiene el término de búsqueda limpio
   */
  get cleanSearch(): string {
    return this.search?.trim() ?? "";
  }
}
