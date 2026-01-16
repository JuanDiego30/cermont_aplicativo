import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    description: 'Fecha real de inicio de ejecución',
    example: '2025-12-30T09:15:00Z',
  })
  @IsDateString({}, { message: 'Fecha real de inicio inválida' })
  @IsOptional()
  fechaRealInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha real de finalización',
    example: '2025-12-31T16:30:00Z',
  })
  @IsDateString({}, { message: 'Fecha real de fin inválida' })
  @IsOptional()
  fechaRealFin?: string;

  @ApiPropertyOptional({
    description: 'Costo real del trabajo en COP',
    example: 1650000,
  })
  @IsNumber()
  @Min(0, { message: 'El costo real no puede ser negativo' })
  @IsOptional()
  costoReal?: number;
}
