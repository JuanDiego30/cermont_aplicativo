/**
 * @dto Offline Checklist DTOs
 *
 * DTOs para validación de datos offline/online.
 * Uso: Validar payloads de sincronización desde dispositivos móviles.
 */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

// ============================================
// ENUMS
// ============================================

export enum EstadoItemChecklist {
  PENDIENTE = "pendiente",
  COMPLETADO = "completado",
  RECHAZADO = "rechazado",
}

// ============================================
// NESTED DTOs
// ============================================

export class UbicacionGPSDto {
  @ApiProperty({ example: 7.8939, description: "Latitud GPS" })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: -72.5078, description: "Longitud GPS" })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({ example: 10, description: "Precisión en metros" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;
}

export class OfflineChecklistItemDto {
  @ApiProperty({ example: "uuid-item-123" })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: "Verificar arnés de seguridad" })
  @IsString()
  nombre!: string;

  @ApiProperty({ enum: EstadoItemChecklist, example: "completado" })
  @IsEnum(EstadoItemChecklist)
  estado!: EstadoItemChecklist;

  @ApiPropertyOptional({ example: "2024-12-13T10:30:00Z" })
  @IsOptional()
  @IsDateString()
  completadoEn?: string;

  @ApiPropertyOptional({ example: "Equipo en buen estado" })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["file:///local/photo1.jpg"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotosAdjuntas?: string[];

  @ApiProperty({ example: "uuid-checklist-456" })
  @IsUUID()
  checklistId!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orden?: number;
}

// ============================================
// MAIN DTOs
// ============================================

export class CreateOfflineChecklistDto {
  @ApiProperty({ description: "ID de la ejecución a preparar para offline" })
  @IsUUID()
  ejecucionId!: string;

  @ApiPropertyOptional({ description: "Identificador único del dispositivo" })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class SyncPayloadDto {
  @ApiProperty({ description: "ID de la ejecución" })
  @IsUUID()
  ejecucionId!: string;

  @ApiProperty({ description: "ID de la orden" })
  @IsUUID()
  ordenId!: string;

  @ApiPropertyOptional({ description: "Número de la orden" })
  @IsOptional()
  @IsString()
  numeroOrden?: string;

  @ApiProperty({
    type: [OfflineChecklistItemDto],
    description: "Items del checklist",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfflineChecklistItemDto)
  items!: OfflineChecklistItemDto[];

  @ApiProperty({ description: "Timestamp de generación del payload" })
  @IsDateString()
  timestamp!: string;

  @ApiProperty({ description: "ID único del dispositivo" })
  @IsString()
  deviceId!: string;

  @ApiPropertyOptional({ description: "Firma digital del técnico (base64)" })
  @IsOptional()
  @IsString()
  firma?: string;

  @ApiPropertyOptional({ type: UbicacionGPSDto, description: "Ubicación GPS" })
  @IsOptional()
  @ValidateNested()
  @Type(() => UbicacionGPSDto)
  ubicacionGPS?: UbicacionGPSDto;

  @ApiProperty({ example: 1, description: "Versión del schema" })
  @IsNumber()
  @Min(1)
  schemaVersion!: number;
}

export class SyncResultDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: "Sincronización completada. 15 items actualizados." })
  message!: string;

  @ApiPropertyOptional({ example: 15 })
  itemsSincronizados?: number;

  @ApiPropertyOptional({ example: 0 })
  itemsFallidos?: number;

  @ApiPropertyOptional({ type: [String], example: ["Error en item X"] })
  errores?: string[];

  @ApiPropertyOptional({ example: "2024-12-13T10:35:00Z" })
  sincronizadoEn?: string;
}

export class OfflinePayloadResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ description: "Payload listo para trabajo offline" })
  data!: {
    ejecucionId: string;
    ordenId: string;
    numeroOrden: string;
    items: OfflineChecklistItemDto[];
    timestamp: string;
    deviceId: string;
    schemaVersion: number;
  };

  @ApiProperty({
    example: "Modo offline activado. Sincronización automática cuando conecte.",
  })
  message!: string;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export class ValidateSyncIntegrityDto {
  @ApiProperty({ type: [String], description: "IDs de items a validar" })
  @IsArray()
  @IsUUID(undefined, { each: true })
  itemIds!: string[];

  @ApiProperty({ description: "ID de la ejecución" })
  @IsUUID()
  ejecucionId!: string;
}

export class ForceResyncDto {
  @ApiProperty({ description: "ID de la ejecución a resincronizar" })
  @IsUUID()
  ejecucionId!: string;

  @ApiPropertyOptional({
    description: "Forzar sobreescritura de datos locales",
  })
  @IsOptional()
  @IsBoolean()
  forceOverwrite?: boolean;
}
