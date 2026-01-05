import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
} from "class-validator";
import { PdfBaseOptionsDto } from "./pdf-base-options.dto";

export enum TipoCertificado {
  INSPECCION_LINEA_VIDA = "INSPECCION_LINEA_VIDA",
  INSPECCION_EQUIPO = "INSPECCION_EQUIPO",
  MANTENIMIENTO_PREVENTIVO = "MANTENIMIENTO_PREVENTIVO",
  CERTIFICACION_ALTURA = "CERTIFICACION_ALTURA",
}

export class GenerateCertificadoDto extends PdfBaseOptionsDto {
  @ApiProperty({
    description: "Tipo de certificado",
    enum: TipoCertificado,
    example: TipoCertificado.INSPECCION_LINEA_VIDA,
  })
  @IsEnum(TipoCertificado)
  @IsNotEmpty()
  tipo!: TipoCertificado;

  @ApiProperty({
    description: "ID del elemento inspeccionado",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  elementoId!: string;

  @ApiPropertyOptional({
    description: "ID del inspector/técnico certificador",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  inspectorId?: string;

  @ApiPropertyOptional({
    description: "Número de certificado personalizado",
    example: "CERT-2024-001",
  })
  @IsOptional()
  @IsString()
  numeroCertificado?: string;

  @ApiPropertyOptional({
    description: "Observaciones del certificado",
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
