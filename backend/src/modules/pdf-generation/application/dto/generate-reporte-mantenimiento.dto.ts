import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { PdfBaseReportOptionsDto } from './pdf-base-options.dto';

export class GenerateReporteMantenimientoDto extends PdfBaseReportOptionsDto {
  @ApiProperty({
    description: 'ID del mantenimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  mantenimientoId!: string;

  @ApiPropertyOptional({
    description: 'Incluir detalles del activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirActivo?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir detalles del técnico',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirTecnico?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir tareas realizadas',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirTareas?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir problemas encontrados',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirProblemas?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir repuestos utilizados',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirRepuestos?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir recomendaciones',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirRecomendaciones?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir evidencias fotográficas',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirEvidencias?: boolean = true;
}
