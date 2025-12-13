/**
 * @barrel Dashboard Module Exports
 * 
 * Exportaciones del módulo de dashboard y KPIs.
 */

// Services
export { DashboardService } from './dashboard.service';
export { KpiCalculatorService } from './services/kpi-calculator.service';

// Interfaces
export {
    IKpiMetrics,
    IKpiOverview,
    IKpiCostos,
    IKpiTecnicos,
    IAlerta,
    ICostoDesglosado,
    IKpiTendencias,
    ITendencia,
    AlertaSeveridad,
    AlertaTipo,
} from './interfaces/kpi.interface';

// DTOs
export {
    KpiMetricsResponseDto,
    KpiOverviewDto,
    KpiCostosDto,
    KpiTecnicosDto,
    AlertaDto,
    GetKpisByPeriodDto,
    GetTendenciasDto,
    CostoDesglosadoDto,
    AlertaTipo as AlertaTipoEnum,
    AlertaSeveridad as AlertaSeveridadEnum,
    Granularidad,
} from './dto/kpi-response.dto';

// Module
export { DashboardModule } from './dashboard.module';
