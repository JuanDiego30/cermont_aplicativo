import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUrl,
} from "class-validator";
import {
  TipoCertificacionTecnico,
  TipoCertificacionEquipo,
} from "../../domain/value-objects/tipo-certificacion.vo";

/**
 * DTO para crear certificación de técnico
 */
export class CreateCertificacionTecnicoDto {
  @ApiProperty({ description: "ID del técnico" })
  @IsString()
  @IsNotEmpty()
  tecnicoId!: string;

  @ApiProperty({
    enum: TipoCertificacionTecnico,
    description: "Tipo de certificación",
  })
  @IsEnum(TipoCertificacionTecnico)
  tipo!: TipoCertificacionTecnico;

  @ApiProperty({ description: "Entidad certificadora", example: "SENA" })
  @IsString()
  @IsNotEmpty()
  entidadCertificadora!: string;

  @ApiProperty({
    description: "Número de certificado",
    example: "CERT-2024-001",
  })
  @IsString()
  @IsNotEmpty()
  numeroCertificado!: string;

  @ApiProperty({ description: "Fecha de emisión", example: "2024-01-15" })
  @IsDateString()
  fechaEmision!: string;

  @ApiProperty({ description: "Fecha de vencimiento", example: "2025-01-15" })
  @IsDateString()
  fechaVencimiento!: string;

  @ApiPropertyOptional({ description: "URL del archivo del certificado" })
  @IsOptional()
  @IsUrl()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: "Observaciones adicionales" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO para crear certificación de equipo
 */
export class CreateCertificacionEquipoDto {
  @ApiProperty({ description: "ID del kit/equipo" })
  @IsString()
  @IsNotEmpty()
  equipoId!: string;

  @ApiProperty({
    enum: TipoCertificacionEquipo,
    description: "Tipo de certificación",
  })
  @IsEnum(TipoCertificacionEquipo)
  tipo!: TipoCertificacionEquipo;

  @ApiProperty({ description: "Entidad certificadora", example: "ICONTEC" })
  @IsString()
  @IsNotEmpty()
  entidadCertificadora!: string;

  @ApiProperty({ description: "Número de certificado", example: "EQ-2024-001" })
  @IsString()
  @IsNotEmpty()
  numeroCertificado!: string;

  @ApiProperty({ description: "Fecha de emisión", example: "2024-01-15" })
  @IsDateString()
  fechaEmision!: string;

  @ApiProperty({ description: "Fecha de vencimiento", example: "2025-01-15" })
  @IsDateString()
  fechaVencimiento!: string;

  @ApiPropertyOptional({ description: "URL del archivo del certificado" })
  @IsOptional()
  @IsUrl()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: "Observaciones adicionales" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO de respuesta de certificación
 */
export class CertificacionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tipo!: string;

  @ApiProperty()
  tipoDisplay!: string;

  @ApiProperty()
  entidadCertificadora!: string;

  @ApiProperty()
  numeroCertificado!: string;

  @ApiProperty()
  fechaEmision!: string;

  @ApiProperty()
  fechaVencimiento!: string;

  @ApiProperty({ description: "Estado de vigencia" })
  estadoVigencia!: string;

  @ApiProperty({ description: "Días restantes para vencimiento" })
  diasRestantes!: number;

  @ApiProperty({ description: "Mensaje descriptivo de vigencia" })
  mensajeVigencia!: string;

  @ApiPropertyOptional({
    description: "Nivel de alerta",
    enum: ["INFO", "WARNING", "CRITICAL"],
  })
  alertLevel?: string | null;

  @ApiPropertyOptional()
  archivoUrl?: string;

  @ApiPropertyOptional()
  observaciones?: string;
}

/**
 * DTO para validar certificaciones
 */
export class ValidarCertificacionesDto {
  @ApiProperty({ description: "IDs de técnicos a validar", type: [String] })
  @IsString({ each: true })
  tecnicosIds!: string[];

  @ApiPropertyOptional({
    description: "IDs de equipos a validar",
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  equiposIds?: string[];

  @ApiPropertyOptional({
    description: "Tipos de certificación requeridos",
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tiposRequeridos?: string[];
}

/**
 * DTO de resultado de validación
 */
export class ValidacionResultDto {
  @ApiProperty()
  allValid!: boolean;

  @ApiProperty({ type: [CertificacionResponseDto] })
  valid!: CertificacionResponseDto[];

  @ApiProperty({ description: "Certificaciones inválidas o faltantes" })
  invalid!: Array<{
    id: string;
    nombre: string;
    tipo: string;
    razon: string;
  }>;

  @ApiProperty({ description: "Alertas de vencimiento próximo" })
  alerts!: Array<{
    id: string;
    tipo: string;
    diasRestantes: number;
    nivel: string;
  }>;
}
