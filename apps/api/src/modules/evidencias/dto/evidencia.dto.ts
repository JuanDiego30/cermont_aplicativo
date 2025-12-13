// ============================================
// EVIDENCIAS DTOs - Validación para upload de evidencias
// ============================================

import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoEvidenciaDto {
  FOTO = 'foto',
  VIDEO = 'video',
  DOCUMENTO = 'documento',
  FIRMA = 'firma',
  AUDIO = 'audio',
}

export class CreateEvidenciaDto {
  @ApiProperty({
    description: 'ID de la orden de trabajo',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID de orden inválido' })
  ordenId!: string;

  @ApiProperty({
    description: 'Tipo de evidencia',
    enum: TipoEvidenciaDto,
  })
  @IsEnum(TipoEvidenciaDto, {
    message: 'Tipo debe ser: foto, video, documento, firma o audio',
  })
  tipo!: TipoEvidenciaDto;

  @ApiPropertyOptional({
    description: 'Descripción de la evidencia',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID de la ejecución relacionada',
  })
  @IsOptional()
  @IsUUID('4')
  ejecucionId?: string;

  @ApiPropertyOptional({
    description: 'ID del checklist relacionado',
  })
  @IsOptional()
  @IsUUID('4')
  checklistId?: string;
}

export class EvidenciaGPSDto {
  @ApiPropertyOptional({
    description: 'Latitud de captura',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude({ message: 'Latitud inválida' })
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitud de captura',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude({ message: 'Longitud inválida' })
  lon?: number;

  @ApiPropertyOptional({
    description: 'Precisión GPS en metros',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  accuracy?: number;
}

export class UploadEvidenciaDto extends CreateEvidenciaDto {
  @ApiPropertyOptional({
    description: 'Datos de ubicación GPS',
  })
  @IsOptional()
  @Type(() => EvidenciaGPSDto)
  gps?: EvidenciaGPSDto;
}

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = {
  foto: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  documento: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  firma: ['image/png', 'image/jpeg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/webm'],
};

// Tamaños máximos por tipo (en bytes)
export const MAX_FILE_SIZES = {
  foto: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  documento: 25 * 1024 * 1024, // 25MB
  firma: 2 * 1024 * 1024, // 2MB
  audio: 50 * 1024 * 1024, // 50MB
};

/**
 * Valida si el tipo MIME del archivo es permitido
 */
export function isValidFileType(
  mimeType: string,
  tipoEvidencia: TipoEvidenciaDto,
): boolean {
  const allowedTypes = ALLOWED_FILE_TYPES[tipoEvidencia];
  return allowedTypes?.includes(mimeType) ?? false;
}

/**
 * Obtiene el tamaño máximo para un tipo de evidencia
 */
export function getMaxFileSize(tipoEvidencia: TipoEvidenciaDto): number {
  return MAX_FILE_SIZES[tipoEvidencia] ?? 10 * 1024 * 1024;
}
