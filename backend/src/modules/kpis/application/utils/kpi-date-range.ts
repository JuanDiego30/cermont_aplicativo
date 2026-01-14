import { KpiFiltersDto } from "../dto";

export function parseKpiDateRange(
  filters: KpiFiltersDto,
  computeDefaultStart: (now: Date, filters: KpiFiltersDto) => Date,
): {
  fechaInicio: Date;
  fechaFin: Date;
} {
  const ahora = new Date();
  let fechaInicio: Date;
  let fechaFin: Date = ahora;

  if (filters.fechaInicio && filters.fechaFin) {
    fechaInicio = new Date(filters.fechaInicio);
    fechaFin = new Date(filters.fechaFin);
  } else {
    fechaInicio = computeDefaultStart(ahora, filters);
  }

  return { fechaInicio, fechaFin };
}
