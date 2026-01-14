import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import {
  KpiFiltersDto,
  OrdenesKpiDto,
  TecnicosKpiDto,
  FinancialKpiDto,
  DashboardKpiDto,
} from "../../application/dto";
import {
  GetOrdenesKpisUseCase,
  GetTecnicosKpisUseCase,
  GetFinancialKpisUseCase,
  GetDashboardKpisUseCase,
} from "../../application/use-cases";

@ApiTags("kpis")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("kpis")
export class KpisController {
  constructor(
    private readonly getOrdenesKpisUseCase: GetOrdenesKpisUseCase,
    private readonly getTecnicosKpisUseCase: GetTecnicosKpisUseCase,
    private readonly getFinancialKpisUseCase: GetFinancialKpisUseCase,
    private readonly getDashboardKpisUseCase: GetDashboardKpisUseCase,
  ) {}

  @Get("dashboard")
  @ApiOperation({
    summary: "Obtener todos los KPIs del dashboard",
    description:
      "Retorna KPIs de órdenes, técnicos y financiero en una sola llamada",
  })
  @ApiResponse({
    status: 200,
    description: "KPIs del dashboard obtenidos exitosamente",
    type: DashboardKpiDto,
  })
  async getDashboard(
    @Query() filters: KpiFiltersDto,
  ): Promise<DashboardKpiDto> {
    return this.getDashboardKpisUseCase.execute(filters);
  }

  @Get("ordenes")
  @ApiOperation({
    summary: "Obtener KPIs de órdenes de trabajo",
    description:
      "Estadísticas de órdenes: total, completadas, pendientes, tasa de completitud",
  })
  @ApiResponse({
    status: 200,
    description: "KPIs de órdenes obtenidos exitosamente",
    type: OrdenesKpiDto,
  })
  async getOrdenesKpis(
    @Query() filters: KpiFiltersDto,
  ): Promise<OrdenesKpiDto> {
    return this.getOrdenesKpisUseCase.execute(filters);
  }

  @Get("tecnicos")
  @ApiOperation({
    summary: "Obtener KPIs de técnicos",
    description:
      "Estadísticas de técnicos: activos, disponibles, eficiencia promedio",
  })
  @ApiResponse({
    status: 200,
    description: "KPIs de técnicos obtenidos exitosamente",
    type: TecnicosKpiDto,
  })
  async getTecnicosKpis(
    @Query() filters: KpiFiltersDto,
  ): Promise<TecnicosKpiDto> {
    return this.getTecnicosKpisUseCase.execute(filters);
  }

  @Get("financiero")
  @ApiOperation({
    summary: "Obtener KPIs financieros",
    description:
      "Estadísticas financieras: ingresos, costos, utilidad, margen de ganancia",
  })
  @ApiResponse({
    status: 200,
    description: "KPIs financieros obtenidos exitosamente",
    type: FinancialKpiDto,
  })
  async getFinancialKpis(
    @Query() filters: KpiFiltersDto,
  ): Promise<FinancialKpiDto> {
    return this.getFinancialKpisUseCase.execute(filters);
  }
}
