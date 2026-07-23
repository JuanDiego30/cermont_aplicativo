/**
 * Dashboard Constants — SSOT for dashboard configuration values
 */

export const KPI_REFRESH_INTERVALS = {
  stats: 30_000,
  charts: 60_000,
  activity: 15_000,
  sla: 60_000,
  recentOrders: 30_000,
  healthScore: 120_000,
  predictiveAlerts: 300_000,
} as const;

export const KPI_STALE_TIMES = {
  stats: 15_000,
  charts: 30_000,
  activity: 5_000,
  sla: 30_000,
  recentOrders: 15_000,
  healthScore: 60_000,
  predictiveAlerts: 120_000,
} as const;

export const DASHBOARD_LIMITS = {
  recentOrders: 5,
  activityFeed: 10,
  slaAlerts: 10,
  healthScoreBreakdown: 4,
  predictiveAlertsMax: 3,
} as const;

export const SLA_THRESHOLDS = {
  success: 80,
  warning: 50,
} as const;

export const PREDICTIVE_ALERT_THRESHOLDS = {
  slaRiskHours: 72,
  resourceUtilizationWarning: 80,
  resourceUtilizationCritical: 95,
  workloadSpikeMultiplier: 1.5,
  revenueDipThreshold: -15,
  revenueDipCritical: -30,
} as const;

export const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

export const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;
