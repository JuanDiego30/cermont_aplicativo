import { KpiFiltersDto } from '../../application/dto';

export interface IKpiCalculator {
    calcularOrdenesKpis(filters: KpiFiltersDto): Promise<any>;
    calcularTecnicosKpis(filters: KpiFiltersDto): Promise<any>;
    calcularFinancialKpis(filters: KpiFiltersDto): Promise<any>;
}
