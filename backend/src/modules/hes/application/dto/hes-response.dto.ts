/**
 * DTO: HESResponseDto
 *
 * DTO de respuesta para HES
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HESResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numero!: string;

  @ApiProperty()
  ordenId!: string;

  @ApiProperty()
  estado!: string;

  @ApiProperty()
  tipoServicio!: string;

  @ApiProperty()
  prioridad!: string;

  @ApiProperty()
  nivelRiesgo!: string;

  @ApiProperty()
  clienteInfo!: {
    nombre: string;
    identificacion: string;
    telefono: string;
    email?: string;
    direccion: string;
  };

  @ApiPropertyOptional()
  condicionesEntrada?: {
    estadoGeneral: string;
    equipoFuncional: boolean;
    daniosVisibles: string[];
    fotosEntrada: string[];
  };

  @ApiPropertyOptional()
  diagnosticoPreliminar?: {
    descripcion: string;
    causaProbable?: string;
    accionesRecomendadas: string[];
  };

  @ApiPropertyOptional()
  requerimientosSeguridad?: {
    eppRequerido: string[];
    checklistItems: Record<string, boolean>;
    porcentajeCompletitud: number;
  };

  @ApiPropertyOptional()
  firmaCliente?: {
    firmadoPor: string;
    fechaHora: string;
  };

  @ApiPropertyOptional()
  firmaTecnico?: {
    firmadoPor: string;
    fechaHora: string;
  };

  @ApiProperty()
  creadoPor!: string;

  @ApiProperty()
  creadoEn!: string;

  @ApiPropertyOptional()
  completadoEn?: string;

  @ApiProperty()
  version!: number;
}
