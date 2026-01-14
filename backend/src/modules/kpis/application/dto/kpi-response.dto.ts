import { ApiProperty } from "@nestjs/swagger";

export class OrdenesKpiDto {
  @ApiProperty({ description: "Total de órdenes", example: 150 })
  total!: number;

  @ApiProperty({ description: "Órdenes completadas", example: 120 })
  completadas!: number;

  @ApiProperty({ description: "Órdenes pendientes", example: 20 })
  pendientes!: number;

  @ApiProperty({ description: "Órdenes en progreso", example: 10 })
  enProgreso!: number;

  @ApiProperty({ description: "Órdenes canceladas", example: 0 })
  canceladas!: number;

  @ApiProperty({ description: "Tasa de completitud (%)", example: 80 })
  tasaCompletitud!: number;

  @ApiProperty({
    description: "Tiempo promedio de resolución (horas)",
    example: 48,
  })
  tiempoPromedioResolucion!: number;
}

export class TecnicosKpiDto {
  @ApiProperty({ description: "Total de técnicos activos", example: 25 })
  totalActivos!: number;

  @ApiProperty({ description: "Técnicos disponibles", example: 15 })
  disponibles!: number;

  @ApiProperty({ description: "Técnicos ocupados", example: 10 })
  ocupados!: number;

  @ApiProperty({ description: "Promedio de órdenes por técnico", example: 6 })
  promedioOrdenesPorTecnico!: number;

  @ApiProperty({ description: "Eficiencia promedio (%)", example: 85 })
  eficienciaPromedio!: number;
}

export class FinancialKpiDto {
  @ApiProperty({ description: "Ingresos totales", example: 250000 })
  ingresosTotales!: number;

  @ApiProperty({ description: "Costos totales", example: 180000 })
  costosTotales!: number;

  @ApiProperty({ description: "Utilidad", example: 70000 })
  utilidad!: number;

  @ApiProperty({ description: "Margen de ganancia (%)", example: 28 })
  margenGanancia!: number;

  @ApiProperty({ description: "Ticket promedio", example: 1666.67 })
  ticketPromedio!: number;
}

export class DashboardKpiDto {
  @ApiProperty({ type: OrdenesKpiDto })
  ordenes!: OrdenesKpiDto;

  @ApiProperty({ type: TecnicosKpiDto })
  tecnicos!: TecnicosKpiDto;

  @ApiProperty({ type: FinancialKpiDto })
  financiero!: FinancialKpiDto;

  @ApiProperty({
    description: "Fecha de cálculo",
    example: "2024-12-24T18:12:00.000Z",
  })
  timestamp!: string;
}

export class KpiResponseDto<T> {
  @ApiProperty({ description: "Operación exitosa", example: true })
  success!: boolean;

  @ApiProperty({ description: "Datos del KPI" })
  data!: T;

  @ApiProperty({
    description: "Fecha de generación",
    example: "2024-12-24T18:12:00.000Z",
  })
  timestamp!: string;
}
