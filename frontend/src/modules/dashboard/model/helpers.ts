import type { DashboardStats, KpiMetric } from "./types";

export function buildKpiMetricsFromStats(stats: DashboardStats | null): KpiMetric[] {
  if (!stats) { return []; }

  return [
    {
      id: "ordenes-activas",
      label: "Órdenes Activas",
      value: stats.ordenesActivas,
      sublabel: `${stats.totalOrdenes} en total`,
      iconName: "ClipboardList",
      semantics: "primary",
      linkTo: "/ordenes?estado=activa",
    },
    {
      id: "mantenimientos-abiertos",
      label: "Mantenimientos Abiertos",
      value: stats.mantenimientosAbiertos,
      sublabel: "Sin mantenimientos programados",
      iconName: "Wrench",
      semantics: "primary",
      linkTo: "/mantenimientos",
    },
    {
      id: "completadas-mes",
      label: "Completadas este Mes",
      value: stats.completadasMes,
      sublabel: "Órdenes finalizadas",
      iconName: "CheckCircle2",
      semantics: "success",
    },
    {
      id: "ingresos-mes",
      label: "Ingresos del Mes",
      value: `$${stats.ingresosMes.toLocaleString("es-CO")}`,
      sublabel: stats.ingresosMes === 0 ? "Sin presupuesto aprobado" : "Presupuesto aprobado",
      iconName: "DollarSign",
      semantics: stats.ingresosMes === 0 ? "neutral" : "success",
    },
    {
      id: "en-ejecucion",
      label: "En Ejecución",
      value: stats.enEjecucion,
      sublabel: "Planeación y ejecución activa",
      iconName: "Zap",
      semantics: "primary",
      linkTo: "/ordenes?estado=ejecucion",
    },
    {
      id: "bloqueadas",
      label: "Bloqueadas",
      value: stats.bloqueadas,
      sublabel: "Requieren atención inmediata",
      iconName: "AlertTriangle",
      semantics: stats.bloqueadas > 0 ? "danger" : "neutral",
      linkTo: "/ordenes?estado=bloqueada",
    },
    {
      id: "listas-facturar",
      label: "Listas para Facturar",
      value: stats.listasFacturar,
      sublabel: "Pendientes de emisión de factura",
      iconName: "Receipt",
      semantics: stats.listasFacturar > 0 ? "warning" : "neutral",
      linkTo: "/ordenes?estado=lista-facturar",
    },
    {
      id: "recursos-en-uso",
      label: "Recursos en Uso",
      value: stats.recursosEnUso,
      sublabel: "Herramientas y equipos asignados",
      iconName: "Package",
      semantics: "neutral",
      linkTo: "/recursos",
    },
  ];
}

export function computeSlaStatus(sla: number): "success" | "warning" | "danger" {
  if (sla >= 80) { return "success"; }
  if (sla >= 50) { return "warning"; }
  return "danger";
}
