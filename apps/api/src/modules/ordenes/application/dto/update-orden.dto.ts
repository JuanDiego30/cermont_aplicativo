import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrdenDto } from './create-orden.dto';
import { IsEnum, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export enum OrdenEstado {
  PLANEACION = 'planeacion',
  EJECUCION = 'ejecucion',
  PAUSADA = 'pausada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export class UpdateOrdenDto extends PartialType(CreateOrdenDto) {
  @ApiPropertyOptional({
    description: 'Estado de la orden',
    enum: OrdenEstado,
    example: OrdenEstado.EJECUCION,
  })
  @IsOptional()
  @IsEnum(OrdenEstado)
  estado?: OrdenEstado;

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
    description: 'Costo real de la orden',
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

