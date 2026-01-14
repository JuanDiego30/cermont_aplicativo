/**
 * DTO: CreateFormTemplateDto
 *
 * DTO para crear un nuevo template de formulario
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFormFieldDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: "TEXT" })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: "Nombre del Cliente" })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class CreateFormTemplateDto {
  @ApiProperty({ example: "Inspección Líneas de Vida" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: "Formulario para inspección de líneas de vida verticales",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "inspeccion",
    enum: ["orden", "checklist", "inspeccion", "encuesta"],
  })
  @IsString()
  @IsNotEmpty()
  contextType!: string;

  @ApiPropertyOptional({ type: [CreateFormFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields?: CreateFormFieldDto[];
}
