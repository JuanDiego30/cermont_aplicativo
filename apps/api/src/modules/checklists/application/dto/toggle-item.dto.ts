/**
 * @dto ToggleItemDto
 *
 * DTOs para toggle y actualización de items
 */

import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ToggleChecklistItemDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID de la orden o ejecución",
  })
  @IsString()
  @IsUUID()
  ordenId?: string;

  @ApiPropertyOptional({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID de la ejecución (alternativa a ordenId)",
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  ejecucionId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID del checklist",
  })
  @IsString()
  @IsUUID()
  checklistId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID del item",
  })
  @IsString()
  @IsUUID()
  itemId!: string;
}

export class UpdateChecklistItemDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID del checklist",
  })
  @IsString()
  @IsUUID()
  checklistId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID del item",
  })
  @IsString()
  @IsUUID()
  itemId!: string;

  @ApiPropertyOptional({
    example: "Item completado correctamente",
    description: "Observaciones del item",
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  observaciones?: string;
}
