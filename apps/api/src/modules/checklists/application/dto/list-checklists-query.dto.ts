/**
 * @dto ListChecklistsQueryDto
 *
 * DTO para consultar checklists con filtros y paginación
 */

import {
  IsInt,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ChecklistStatusEnum } from "../../domain/value-objects/checklist-status.vo";
import { Pagination20QueryDto } from "../../../../common/dto/pagination-20-query.dto";

export class ListChecklistsQueryDto extends Pagination20QueryDto {
  @ApiPropertyOptional({ example: "mantenimiento" })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({ example: "preventivo" })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ enum: ChecklistStatusEnum })
  @IsEnum(ChecklistStatusEnum)
  @IsOptional()
  status?: ChecklistStatusEnum;

  @ApiPropertyOptional({ example: true, default: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({ example: "mantenimiento" })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsString()
  @IsOptional()
  ordenId?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsString()
  @IsOptional()
  ejecucionId?: string;
}
