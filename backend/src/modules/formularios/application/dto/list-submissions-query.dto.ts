/**
 * DTO: ListSubmissionsQueryDto
 *
 * DTO para query de listado de submissions
 */

import { IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListSubmissionsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextId?: string;
}
