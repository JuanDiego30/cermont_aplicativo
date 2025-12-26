import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsUUID, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Prioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export class CreateOrdenDto {
  @ApiProperty({
    description: 'Descripción detallada del trabajo a realizar',
    example: 'Mantenimiento preventivo de transformador 500kVA',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion!: string;

  @ApiProperty({
    description: 'Nombre del cliente o empresa',
    example: 'Empresa Eléctrica del Norte S.A.',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: 'El nombre del cliente no puede exceder 200 caracteres' })
  cliente!: string;

  @ApiProperty({
    enum: Prioridad,
    description: 'Nivel de prioridad de la orden',
    example: Prioridad.ALTA,
    default: Prioridad.MEDIA,
  })
  @IsEnum(Prioridad, { message: 'Prioridad inválida. Valores permitidos: baja, media, alta, urgente' })
  prioridad!: Prioridad;

  @ApiPropertyOptional({
    description: 'Fecha estimada de finalización (ISO 8601)',
    example: '2025-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de finalización debe estar en formato ISO 8601' })
  fechaFinEstimada?: string;

  @ApiPropertyOptional({
    description: 'Presupuesto estimado en moneda local',
    example: 1500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Presupuesto debe ser un número' })
  @Min(0, { message: 'Presupuesto no puede ser negativo' })
  @Type(() => Number)
  presupuestoEstimado?: number;

  @ApiPropertyOptional({
    description: 'UUID del técnico asignado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID de técnico debe ser un UUID válido' })
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Indica si requiere Hoja de Especificaciones de Seguridad (HES)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereHES debe ser un valor booleano' })
  requiereHES?: boolean;
}

