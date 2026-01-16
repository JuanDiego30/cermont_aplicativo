/**
 * DTO: ListTemplatesQueryDto
 *
 * DTO para query de listado de templates
 */

import { IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListTemplatesQueryDto {
  @ApiPropertyOptional({ example: "inspeccion" })
  @IsOptional()
  @IsString()
  contextType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  publishedOnly?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}
