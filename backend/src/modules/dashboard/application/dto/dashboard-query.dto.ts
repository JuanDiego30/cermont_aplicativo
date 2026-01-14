import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsEnum,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: "Fecha inicio del rango",
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: "Fecha fin del rango",
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: "Cliente específico" })
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiPropertyOptional({
    description: "Estado de orden",
    example: "planeacion",
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: "Días para tendencia",
    minimum: 7,
    maximum: 365,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  @Type(() => Number)
  diasTendencia?: number;

  @ApiPropertyOptional({
    description: "Límite de órdenes recientes",
    minimum: 5,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  @Type(() => Number)
  limitOrdenes?: number;

  @ApiPropertyOptional({ description: "ID del técnico" })
  @IsOptional()
  @IsString()
  tecnicoId?: string;
}
