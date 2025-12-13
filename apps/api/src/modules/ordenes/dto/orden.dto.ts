// ============================================
// CREATE ORDER DTO - Validación para creación de órdenes
// ============================================

import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  IsDate,
  MaxLength,
  MinLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderPriorityDto {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Descripción detallada de la orden de trabajo',
    example: 'Mantenimiento preventivo de bomba P-101',
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion!: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Ecopetrol S.A.',
    maxLength: 200,
  })
  @IsString()
  @MinLength(2, { message: 'El cliente debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El cliente no puede exceder 200 caracteres' })
  cliente!: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la orden',
    enum: OrderPriorityDto,
    default: OrderPriorityDto.MEDIA,
  })
  @IsOptional()
  @IsEnum(OrderPriorityDto, {
    message: 'La prioridad debe ser: baja, media, alta o urgente',
  })
  prioridad?: OrderPriorityDto;

  @ApiPropertyOptional({
    description: 'ID del usuario asignado',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del asignado debe ser un UUID válido' })
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha estimada de finalización',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Fecha de fin estimada inválida' })
  fechaFinEstimada?: Date;

  @ApiPropertyOptional({
    description: 'Presupuesto estimado en pesos colombianos',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto debe ser un número' })
  @IsPositive({ message: 'El presupuesto debe ser positivo' })
  presupuestoEstimado?: number;

  @ApiPropertyOptional({
    description: 'Indica si la orden requiere HES',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereHES debe ser booleano' })
  requiereHES?: boolean;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Descripción detallada de la orden de trabajo',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cliente?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la orden',
    enum: OrderPriorityDto,
  })
  @IsOptional()
  @IsEnum(OrderPriorityDto)
  prioridad?: OrderPriorityDto;

  @ApiPropertyOptional({
    description: 'ID del usuario asignado',
  })
  @IsOptional()
  @IsUUID('4')
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha estimada de finalización',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaFinEstimada?: Date;

  @ApiPropertyOptional({
    description: 'Presupuesto estimado',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  presupuestoEstimado?: number;

  @ApiPropertyOptional({
    description: 'Margen de utilidad (%)',
  })
  @IsOptional()
  @IsNumber()
  margenUtilidad?: number;

  @ApiPropertyOptional({
    description: 'Impuestos aplicables (%)',
  })
  @IsOptional()
  @IsNumber()
  impuestosAplicables?: number;
}
