/**
 * @dto Order DTOs
 * @description DTOs con validación class-validator para órdenes
 * @layer Application
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// ==========================================
// Enums
// ==========================================

export enum PrioridadOrder {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export enum EstadoOrder {
  PENDIENTE = 'pendiente',
  PLANEACION = 'planeacion',
  EJECUCION = 'ejecucion',
  PAUSADA = 'pausada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum EstadoTransicion {
  SOLICITUD_RECIBIDA = 'SOLICITUD_RECIBIDA',
  VISITA_PROGRAMADA = 'VISITA_PROGRAMADA',
  PROPUESTA_ELABORADA = 'PROPUESTA_ELABORADA',
  PROPUESTA_APROBADA = 'PROPUESTA_APROBADA',
  PLANEACION_INICIADA = 'PLANEACION_INICIADA',
  PLANEACION_APROBADA = 'PLANEACION_APROBADA',
  EJECUCION_INICIADA = 'EJECUCION_INICIADA',
  EJECUCION_COMPLETADA = 'EJECUCION_COMPLETADA',
  INFORME_GENERADO = 'INFORME_GENERADO',
  ACTA_ELABORADA = 'ACTA_ELABORADA',
  ACTA_FIRMADA = 'ACTA_FIRMADA',
  SES_APROBADA = 'SES_APROBADA',
  FACTURA_APROBADA = 'FACTURA_APROBADA',
  PAGO_RECIBIDO = 'PAGO_RECIBIDO',
}

// ==========================================
// Create Order DTO
// ==========================================
export class CreateOrderDto {
  @ApiProperty({
    description: 'Descripción de la Order',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion!: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2, { message: 'El cliente debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El cliente no puede exceder 200 caracteres' })
  cliente!: string;

  @ApiPropertyOptional({ enum: PrioridadOrder, default: 'media' })
  @IsOptional()
  @IsEnum(PrioridadOrder)
  prioridad?: PrioridadOrder = PrioridadOrder.MEDIA;

  @ApiPropertyOptional({ description: 'Fecha fin estimada (ISO)' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: TransformFnParams) => (value ? new Date(value) : undefined))
  fechaFinEstimada?: Date;

  @ApiPropertyOptional({ description: 'Presupuesto estimado' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  presupuestoEstimado?: number;

  @ApiPropertyOptional({ description: 'UUID del técnico asignado' })
  @IsOptional()
  @IsUUID('4')
  asignadoId?: string;
}

// ==========================================
// Update Order DTO
// ==========================================
export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Descripción de la Order',
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El cliente debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El cliente no puede exceder 200 caracteres' })
  cliente?: string;

  @ApiPropertyOptional({ enum: PrioridadOrder })
  @IsOptional()
  @IsEnum(PrioridadOrder)
  prioridad?: PrioridadOrder;

  @ApiPropertyOptional({ description: 'Fecha fin estimada (ISO)' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: TransformFnParams) => (value ? new Date(value) : undefined))
  fechaFinEstimada?: Date;

  @ApiPropertyOptional({ description: 'Presupuesto estimado' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  presupuestoEstimado?: number;

  @ApiPropertyOptional({ description: 'UUID del técnico asignado (null para desasignar)' })
  @IsOptional()
  @IsUUID('4')
  asignadoId?: string | null;
}

// ==========================================
// Change Estado DTO
// ==========================================
export class ChangeEstadoDto {
  @ApiProperty({ enum: EstadoOrder })
  @IsEnum(EstadoOrder)
  estado!: EstadoOrder;
}

// ==========================================
// Transition State DTO (para OrderStateService)
// ==========================================
export class TransitionStateDto {
  @ApiProperty({ enum: EstadoTransicion })
  @IsEnum(EstadoTransicion)
  toState!: EstadoTransicion;

  @ApiPropertyOptional({ description: 'Notas de la transición' })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

// ==========================================
// Query Order DTO
// ==========================================
export class OrderQueryDto {
  @ApiPropertyOptional({ enum: EstadoOrder })
  @IsOptional()
  @IsEnum(EstadoOrder)
  estado?: EstadoOrder;

  @ApiPropertyOptional({ description: 'Filtrar por cliente' })
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiPropertyOptional({ enum: PrioridadOrder })
  @IsOptional()
  @IsEnum(PrioridadOrder)
  prioridad?: PrioridadOrder;

  @ApiPropertyOptional({ description: 'UUID del técnico asignado' })
  @IsOptional()
  @IsUUID('4')
  asignadoId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ==========================================
// Response DTOs
// ==========================================
export interface OrderResponse {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: string;
  prioridad: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaFinEstimada?: string;
  presupuestoEstimado?: number;
  creador?: { id: string; name: string };
  asignado?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// Sub-DTOs for OrderDetailResponse
// Replaces any types with strongly typed interfaces
// ==========================================
export interface OrderItemDTO {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario?: number;
  total?: number;
}

export interface EvidenciaDTO {
  id: string;
  tipo: 'foto' | 'documento' | 'video';
  url: string;
  descripcion?: string;
  fechaCaptura: string;
}

export interface CostoDTO {
  id: string;
  concepto: string;
  monto: number;
  tipo: 'material' | 'mano_obra' | 'transporte' | 'otro';
  fecha: string;
}

export interface PlaneacionDTO {
  id: string;
  fechaProgramada?: string;
  observaciones?: string;
  aprobada: boolean;
}

export interface EjecucionDTO {
  id: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: string;
}

export interface OrderDetailResponse extends OrderResponse {
  items?: OrderItemDTO[];
  evidencias?: EvidenciaDTO[];
  costos?: CostoDTO[];
  planeacion?: PlaneacionDTO;
  ejecucion?: EjecucionDTO;
}
