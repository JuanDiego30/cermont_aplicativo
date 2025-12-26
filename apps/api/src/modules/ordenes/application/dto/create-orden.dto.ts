import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  IsBoolean,
  MinLength,
} from 'class-validator';

export enum OrdenTipo {
  MANTENIMIENTO = 'MANTENIMIENTO',
  INSTALACION = 'INSTALACION',
  REPARACION = 'REPARACION',
  INSPECCION = 'INSPECCION',
  EMERGENCIA = 'EMERGENCIA',
}

export enum OrdenPrioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export class CreateOrdenDto {
  @ApiProperty({
    description: 'Descripción detallada de la orden de trabajo',
    example: 'Mantenimiento preventivo - Torre 5G Sector Norte',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion!: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Ecopetrol S.A.',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El cliente debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El cliente no puede exceder 200 caracteres' })
  cliente!: string;

  @ApiPropertyOptional({
    description: 'Contacto del cliente',
    example: 'Juan Pérez',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactoCliente?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '+57 300 123 4567',
  })
  @IsOptional()
  @IsString()
  telefonoCliente?: string;

  @ApiPropertyOptional({
    description: 'Dirección del cliente',
    example: 'Carrera 15 #45-67, Bogotá',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la orden',
    enum: OrdenPrioridad,
    default: OrdenPrioridad.MEDIA,
  })
  @IsOptional()
  @IsEnum(OrdenPrioridad, {
    message: 'La prioridad debe ser: baja, media, alta o urgente',
  })
  prioridad?: OrdenPrioridad;

  @ApiPropertyOptional({
    description: 'ID del técnico asignado',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del asignado debe ser un UUID válido' })
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha estimada de finalización',
    example: '2025-03-15T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFinEstimada?: string;

  @ApiPropertyOptional({
    description: 'Presupuesto estimado en pesos colombianos',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto debe ser un número' })
  @Min(0, { message: 'El presupuesto debe ser positivo' })
  presupuestoEstimado?: number;

  @ApiPropertyOptional({
    description: 'Indica si la orden requiere HES',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereHES debe ser booleano' })
  requiereHES?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

