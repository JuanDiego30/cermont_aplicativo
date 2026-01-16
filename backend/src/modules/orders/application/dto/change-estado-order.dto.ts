import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderEstado } from '../../domain/order-state-machine';

export class ChangeEstadoOrderDto {
  @ApiProperty({
    description: 'Nuevo estado de la Order',
    enum: OrderEstado,
    example: OrderEstado.EJECUCION,
  })
  @IsEnum(OrderEstado)
  @IsNotEmpty()
  nuevoEstado!: OrderEstado;

  @ApiProperty({
    description: 'Motivo del cambio de estado',
    example: 'Técnico llegó a sitio e inició trabajos',
  })
  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que realiza el cambio',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre el cambio',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
