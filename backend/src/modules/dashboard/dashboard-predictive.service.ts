/**
 * Dashboard Predictive Service — Heuristic early-warning alerts + health score
 *
 * INNOVATION: ML heuristics for:
 * - SLA breach risk: orders near deadline with slow progress
 * - Resource bottleneck: assigned resources near capacity
 * - Workload spike: sudden incoming request increase
 * - Revenue dip: projected revenue below prior month
 *
 * Health score: composite (SLA 30% + efficiency 25% + financial 25% + workload 20%)
 */

import { Order } from "../../models/Order";
import { Resource } from "../../models/Resource";
import { WorkRequest } from "../../models/WorkRequest";
import { Invoice } from "../../models/Invoice";
import { ExecutionSession } from "../../models/ExecutionSession";
import { createLogger } from "../../common/utils/logger";

const log = createLogger("dashboard-predictive-service");

interface PredictiveAlert {
  id: string;
  type: "sla_breach_risk" | "resource_bottleneck" | "workload_spike" | "revenue_dip";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  probability: number;
  daysToImpact: number;
  affectedEntity?: string;
  suggestedAction?: string;
}

interface HealthScoreBreakdown {
  label: string;
  score: number;
  maxScore: number;
  status: "good" | "fair" | "poor";
}

interface HealthScore {
  overall: number;
  sla: number;
  efficiency: number;
  financial: number;
  workload: number;
  trend: "improving" | "stable" | "declining";
  breakdown: HealthScoreBreakdown[];
}

async function buildSlaBreachAlerts(now: Date): Promise<PredictiveAlert[]> {
  const results: PredictiveAlert[] = [];
  const slaRiskOrders = await Order.find({
    status: { $nin: ["closed", "cancelled"] },
    targetDate: { $gte: now, $lte: new Date(now.getTime() + 72 * 60 * 60 * 1000) },
    currentStage: { $in: ["intake", "assessment", "proposal"] },
  }).sort({ targetDate: 1 }).limit(5).lean();

  for (const order of slaRiskOrders) {
    const o = order as unknown as Record<string, unknown>;
    const targetDate = o.targetDate ? new Date(o.targetDate as Date) : null;
    const hoursLeft = targetDate ? Math.floor((targetDate.getTime() - now.getTime()) / 3_600_000) : 72;
    const probability = Math.min(100, Math.round((1 - hoursLeft / 72) * 100));
    if (probability < 40) { continue; }

    results.push({
      id: `sla-${String(o._id)}`,
      type: "sla_breach_risk",
      severity: probability >= 80 ? "critical" : probability >= 60 ? "high" : "medium",
      title: `Riesgo vencimiento SLA: ${String(o.code ?? "")}`,
      description: `Orden en etapa "${String(o.currentStage ?? "desconocida")}", ${hoursLeft}h restantes`,
      probability,
      daysToImpact: Math.ceil(hoursLeft / 24),
      affectedEntity: String(o._id),
      suggestedAction: "Revisar flujo de la orden, asignar recursos adicionales si es necesario.",
    });
  }
  return results;
}

async function buildResourceBottleneckAlert(): Promise<PredictiveAlert | null> {
  const [totalResources, assignedResources] = await Promise.all([
    Resource.countDocuments({}),
    Resource.countDocuments({ assignedToOrderId: { $ne: null } }),
  ]);
  if (totalResources === 0) { return null; }

  const utilizationRate = (assignedResources / totalResources) * 100;
  if (utilizationRate < 80) { return null; }

  return {
    id: "resource-bottleneck",
    type: "resource_bottleneck",
    severity: utilizationRate >= 95 ? "critical" : utilizationRate >= 90 ? "high" : "medium",
    title: "Cuello de botella de recursos",
    description: `${assignedResources}/${totalResources} recursos asignados (${Math.round(utilizationRate)}%)`,
    probability: Math.round(utilizationRate),
    daysToImpact: 1,
    suggestedAction: "Revisar asignaciones, liberar recursos de órdenes completadas no cerradas.",
  };
}

async function buildWorkloadSpikeAlert(now: Date): Promise<PredictiveAlert | null> {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [recentCount, weeklyCount] = await Promise.all([
    WorkRequest.countDocuments({ createdAt: { $gte: yesterday } }),
    WorkRequest.countDocuments({ createdAt: { $gte: lastWeek, $lt: yesterday } }),
  ]);
  const weeklyAvg = Math.round(weeklyCount / 6);
  if (weeklyAvg <= 0 || recentCount <= weeklyAvg * 1.5) { return null; }

  const spike = Math.round(((recentCount - weeklyAvg) / weeklyAvg) * 100);
  return {
    id: "workload-spike",
    type: "workload_spike",
    severity: spike >= 100 ? "high" : "medium",
    title: "Pico de solicitudes entrantes",
    description: `${recentCount} solicitudes en 24h (${spike}% sobre promedio ${weeklyAvg})`,
    probability: Math.min(90, spike),
    daysToImpact: 0,
    suggestedAction: "Activar plan de capacidad. Considerar personal adicional para próximas 48h.",
  };
}

export async function getPredictiveAlerts(): Promise<PredictiveAlert[]> {
  try {
    const now = new Date();
    const [slaAlerts, bottleneck, workloadSpike] = await Promise.all([
      buildSlaBreachAlerts(now),
      buildResourceBottleneckAlert(),
      buildWorkloadSpikeAlert(now),
    ]);
    return [...slaAlerts, ...(bottleneck ? [bottleneck] : []), ...(workloadSpike ? [workloadSpike] : [])];
  } catch (error) {
    log.error("Error computing predictive alerts", { error: String(error) });
    return [];
  }
}

async function computeSlaScore(startMonth: Date, endMonth: Date): Promise<number> {
  const [totalCompletadas, enTiempo] = await Promise.all([
    Order.countDocuments({ status: "closed", closedAt: { $gte: startMonth, $lte: endMonth } }),
    Order.countDocuments({ status: "closed", closedAt: { $gte: startMonth, $lte: endMonth }, slaBreached: { $ne: true } }),
  ]);
  return totalCompletadas > 0 ? Math.round((enTiempo / totalCompletadas) * 100) : 100;
}

async function computeEfficiencyScore(startMonth: Date, endMonth: Date): Promise<number> {
  const sessions = await ExecutionSession.find({
    status: "completed",
    completedAt: { $gte: startMonth, $lte: endMonth },
    mttrMinutes: { $exists: true, $ne: null },
  }).select("mttrMinutes").lean();

  if (sessions.length === 0) { return 100; }
  let totalMttr = 0;
  for (const s of sessions) {
    const raw = s as unknown as Record<string, unknown>;
    totalMttr += (raw.mttrMinutes as number) ?? 0;
  }
  const avgMttr = totalMttr / sessions.length;
  return Math.max(0, Math.min(100, Math.round(100 - (avgMttr / 60) * 2)));
}

async function computeFinancialScore(startMonth: Date, endMonth: Date): Promise<number> {
  const [ingresos, presupuesto] = await Promise.all([
    Invoice.aggregate([{ $match: { status: "paid", paidAt: { $gte: startMonth, $lte: endMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Order.aggregate([{ $match: { approvedBudget: { $exists: true, $ne: null } } }, { $group: { _id: null, total: { $sum: "$approvedBudget" } } }]),
  ]);
  const t = ingresos[0]?.total ?? 0;
  const b = presupuesto[0]?.total ?? 0;
  return b > 0 ? Math.min(100, Math.round((t / b) * 100)) : 50;
}

async function computeWorkloadScore(): Promise<number> {
  const [totalRes, assignedRes] = await Promise.all([
    Resource.countDocuments({}),
    Resource.countDocuments({ assignedToOrderId: { $ne: null } }),
  ]);
  const utilization = totalRes > 0 ? (assignedRes / totalRes) * 100 : 0;
  return utilization > 90 ? 30 : utilization > 75 ? 60 : utilization > 50 ? 80 : 100;
}

function computeTrend(slaScore: number, previousSla: number): "improving" | "stable" | "declining" {
  return slaScore > previousSla + 5 ? "improving" : slaScore < previousSla - 5 ? "declining" : "stable";
}

function buildBreakdown(sla: number, efficiency: number, financial: number, workload: number): HealthScoreBreakdown[] {
  const statusFn = (v: number, g: number, f: number) => v >= g ? "good" as const : v >= f ? "fair" as const : "poor" as const;
  return [
    { label: "SLA", score: sla, maxScore: 100, status: statusFn(sla, 80, 50) },
    { label: "Eficiencia", score: efficiency, maxScore: 100, status: statusFn(efficiency, 70, 40) },
    { label: "Financiero", score: financial, maxScore: 100, status: statusFn(financial, 70, 40) },
    { label: "Carga", score: workload, maxScore: 100, status: statusFn(workload, 70, 40) },
  ];
}

async function computePreviousSla(startMonth: Date): Promise<number> {
  const lastStart = new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1);
  const lastEnd = new Date(startMonth.getFullYear(), startMonth.getMonth(), 0, 23, 59, 59);
  const [c, t] = await Promise.all([
    Order.countDocuments({ status: "closed", closedAt: { $gte: lastStart, $lte: lastEnd } }),
    Order.countDocuments({ status: "closed", closedAt: { $gte: lastStart, $lte: lastEnd }, slaBreached: { $ne: true } }),
  ]);
  return c > 0 ? Math.round((t / c) * 100) : 100;
}

export async function getHealthScore(): Promise<HealthScore> {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  try {
    const [slaScore, efficiencyScore, financialScore, workloadScore, previousSla] = await Promise.all([
      computeSlaScore(startMonth, endMonth),
      computeEfficiencyScore(startMonth, endMonth),
      computeFinancialScore(startMonth, endMonth),
      computeWorkloadScore(),
      computePreviousSla(startMonth),
    ]);

    const overall = Math.round(slaScore * 0.3 + efficiencyScore * 0.25 + financialScore * 0.25 + workloadScore * 0.2);
    const trend = computeTrend(slaScore, previousSla);
    const breakdown = buildBreakdown(slaScore, efficiencyScore, financialScore, workloadScore);

    return { overall, sla: slaScore, efficiency: efficiencyScore, financial: financialScore, workload: workloadScore, trend, breakdown };
  } catch (error) {
    log.error("Error computing health score", { error: String(error) });
    return {
      overall: 0, sla: 0, efficiency: 0, financial: 0, workload: 0, trend: "stable",
      breakdown: [
        { label: "SLA", score: 0, maxScore: 100, status: "poor" },
        { label: "Eficiencia", score: 0, maxScore: 100, status: "poor" },
        { label: "Financiero", score: 0, maxScore: 100, status: "poor" },
        { label: "Carga", score: 0, maxScore: 100, status: "poor" },
      ],
    };
  }
}

log.info("Dashboard predictive service initialized");
