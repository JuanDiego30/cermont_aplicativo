import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum KpiPeriodo {
  HOY = 'HOY',
  SEMANA = 'SEMANA',
  MES = 'MES',
  TRIMESTRE = 'TRIMESTRE',
  ANO = 'ANO',
}

export class KpiFiltersDto {
  @ApiPropertyOptional({ enum: KpiPeriodo })
  @IsOptional()
  @IsEnum(KpiPeriodo)
  periodo?: KpiPeriodo = KpiPeriodo.MES;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;
}

export class OrdenesKpiDto {
  total!: number;
  completadas!: number;
  pendientes!: number;
  enProgreso!: number;
  canceladas!: number;
  tasaCompletitud!: number;
  tiempoPromedioResolucion!: number;
}

export class TecnicosKpiDto {
  totalActivos!: number;
  disponibles!: number;
  ocupados!: number;
  promedioOrdenesPorTecnico!: number;
  eficienciaPromedio!: number;
}

export class FinancialKpiDto {
  ingresosTotales!: number;
  costosTotales!: number;
  utilidad!: number;
  margenGanancia!: number;
  ticketPromedio!: number;
}

export class DashboardKpiDto {
  ordenes!: OrdenesKpiDto;
  tecnicos!: TecnicosKpiDto;
  financiero!: FinancialKpiDto;
  timestamp!: string;
}
