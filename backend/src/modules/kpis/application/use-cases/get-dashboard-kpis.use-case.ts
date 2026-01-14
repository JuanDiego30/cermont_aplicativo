import { Injectable, Logger } from "@nestjs/common";
import { KpiFiltersDto, DashboardKpiDto } from "../dto";
import { GetOrdenesKpisUseCase } from "./get-ordenes-kpis.use-case";
import { GetTecnicosKpisUseCase } from "./get-tecnicos-kpis.use-case";
import { GetFinancialKpisUseCase } from "./get-financial-kpis.use-case";

@Injectable()
export class GetDashboardKpisUseCase {
  private readonly logger = new Logger(GetDashboardKpisUseCase.name);

  constructor(
    private readonly getOrdenesKpis: GetOrdenesKpisUseCase,
    private readonly getTecnicosKpis: GetTecnicosKpisUseCase,
    private readonly getFinancialKpis: GetFinancialKpisUseCase,
  ) {}

  async execute(filters: KpiFiltersDto): Promise<DashboardKpiDto> {
    try {
      this.logger.log("Calculando KPIs del dashboard", { filters });

      const [ordenes, tecnicos, financiero] = await Promise.all([
        this.getOrdenesKpis.execute(filters),
        this.getTecnicosKpis.execute(filters),
        this.getFinancialKpis.execute(filters),
      ]);

      return {
        ordenes,
        tecnicos,
        financiero,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Error calculando KPIs del dashboard", error);
      throw error;
    }
  }
}
