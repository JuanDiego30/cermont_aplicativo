import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class AsignarTecnicoOrdenDto {
  @ApiProperty({
    description: 'ID del técnico a asignar',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  tecnicoId!: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha programada de inicio',
    example: '2025-03-16T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Instrucciones especiales para el técnico',
    example: 'Contactar al cliente 30 minutos antes de llegar',
  })
  @IsOptional()
  @IsString()
  instrucciones?: string;

  @ApiPropertyOptional({
    description: 'Motivo de la asignación',
    example: 'Técnico disponible más cercano al sitio',
  })
  @IsOptional()
  @IsString()
  motivoAsignacion?: string;
}

