import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { EstadoOrder } from './order.dto';

/**
 * @deprecated Use EstadoOrder from './order.dto' instead
 * Alias mantenido para compatibilidad temporal
 */
export const Orderstado = EstadoOrder;
export type Orderstado = EstadoOrder;

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    description: 'Estado de la Order',
    enum: EstadoOrder,
    example: EstadoOrder.EJECUCION,
  })
  @IsOptional()
  @IsEnum(EstadoOrder)
  estado?: EstadoOrder;

  @ApiPropertyOptional({
    description: 'Fecha real de inicio',
    example: '2025-03-15T08:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha real de finalización',
    example: '2025-03-15T16:45:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Costo real de la Order',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El costo real debe ser un número' })
  @Min(0, { message: 'El costo real debe ser positivo' })
  costoReal?: number;

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
