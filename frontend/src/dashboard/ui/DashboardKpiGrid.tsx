"use client";

import type { ExtendedKpis, KpiPeriodPair } from "@cermont/shared-types";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	ClipboardList,
	Clock3,
	DollarSign,
	type LucideIcon,
	ShieldCheck,
	Users,
	UserX,
} from "lucide-react";

type MetricFormat = "number" | "percent" | "days" | "cop";
type MetricTone = "blue" | "green" | "red" | "amber" | "purple" | "cyan";

interface DashboardKpiFallback {
	activeOrders: number;
	completedOrders: number;
	overdueOrders: number;
	slaCompliancePct: number;
	avgCycleTimeDays: number;
	firstTimeFixRate: number;
	activeTechnicians: number;
	unassignedOrders: number;
	fsmTasaCumplimiento: number;
	fsmTiempoPromedioCiclo: number;
	fsmFacturacionPendiente: number;
	fsmOrdenesRetraso: number;
	fsmOrdenesActivas: number;
}

interface DashboardKpiGridProps {
	data?: ExtendedKpis;
	fallback: DashboardKpiFallback;
}

interface MetricDefinition {
	id: string;
	title: string;
	pair: KpiPeriodPair;
	icon: LucideIcon;
	tone: MetricTone;
	format: MetricFormat;
	description: string;
	isLowerBetter?: boolean;
	showGauge?: boolean;
	showProgress?: boolean;
}

const TONE_CLASSES: Record<MetricTone, { icon: string; bg: string; accent: string }> = {
	blue: {
		icon: "text-(--color-brand-blue)",
		bg: "bg-(--color-info-bg)",
		accent: "var(--color-brand-blue)",
	},
	green: {
		icon: "text-(--color-success)",
		bg: "bg-(--color-success-bg)",
		accent: "var(--color-success)",
	},
	red: {
		icon: "text-(--color-danger)",
		bg: "bg-(--color-danger-bg)",
		accent: "var(--color-danger)",
	},
	amber: {
		icon: "text-(--color-warning)",
		bg: "bg-(--color-warning-bg)",
		accent: "var(--color-warning)",
	},
	purple: {
		icon: "text-(--color-purple)",
		bg: "bg-(--color-purple-bg)",
		accent: "var(--color-purple)",
	},
	cyan: {
		icon: "text-(--color-info)",
		bg: "bg-(--color-info-bg)",
		accent: "var(--color-info)",
	},
};

function toPair(current: number): KpiPeriodPair {
	return { current, previous: 0 };
}

function formatMetric(value: number, format: MetricFormat): string {
	if (format === "percent") {
		return `${Math.round(value)}%`;
	}

	if (format === "days") {
		return `${value.toFixed(1)} d`;
	}

	if (format === "cop") {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			maximumFractionDigits: 0,
		}).format(value);
	}

	return Math.round(value).toLocaleString("es-CO");
}

function calculateTrend(pair: KpiPeriodPair): number {
	if (pair.previous === 0) {
		return pair.current > 0 ? 100 : 0;
	}

	return Math.round(((pair.current - pair.previous) / Math.abs(pair.previous)) * 100);
}

function Sparkline({ pair, color }: { pair: KpiPeriodPair; color: string }) {
	const max = Math.max(pair.current, pair.previous, 1);
	const previousY = 28 - (pair.previous / max) * 24;
	const currentY = 28 - (pair.current / max) * 24;

	return (
		<svg className="h-9 w-24" viewBox="0 0 96 32" role="img" aria-label="Tendencia del periodo">
			<path d="M4 28 H92" stroke="var(--border-default)" strokeWidth="1" />
			<polyline
				points={`4,${previousY} 48,${(previousY + currentY) / 2} 92,${currentY}`}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="3"
			/>
			<circle cx="92" cy={currentY} r="3" fill={color} />
		</svg>
	);
}

function Gauge({ value, color }: { value: number; color: string }) {
	const safeValue = Math.max(0, Math.min(value, 100));
	const dash = `${safeValue} ${100 - safeValue}`;

	return (
		<svg className="h-14 w-14" viewBox="0 0 42 42" role="img" aria-label={`${safeValue}%`}>
			<circle
				cx="21"
				cy="21"
				r="15.9"
				fill="transparent"
				stroke="var(--border-default)"
				strokeWidth="4"
			/>
			<circle
				cx="21"
				cy="21"
				r="15.9"
				fill="transparent"
				stroke={color}
				strokeDasharray={dash}
				strokeLinecap="round"
				strokeWidth="4"
				transform="rotate(-90 21 21)"
			/>
			<text
				x="21"
				y="23"
				textAnchor="middle"
				className="fill-(--text-primary) text-[9px] font-bold"
			>
				{Math.round(safeValue)}%
			</text>
		</svg>
	);
}

function ProgressBar({ value, color }: { value: number; color: string }) {
	const width = Math.max(0, Math.min(value, 100));

	return (
		<div className="mt-3 h-2 overflow-hidden rounded-full bg-(--surface-muted)">
			<span
				className="block h-full rounded-full"
				style={{ width: `${width}%`, backgroundColor: color }}
			/>
		</div>
	);
}

export function DashboardKpiGrid({ data, fallback }: DashboardKpiGridProps) {
	const metrics: MetricDefinition[] = [
		{
			id: "active-orders",
			title: "Órdenes activas",
			pair: data?.kpis.active_orders ?? toPair(fallback.activeOrders),
			icon: ClipboardList,
			tone: "blue",
			format: "number",
			description: "OTs en curso del periodo",
		},
		{
			id: "completed-orders",
			title: "Completadas",
			pair: data?.kpis.completed_orders ?? toPair(fallback.completedOrders),
			icon: CheckCircle2,
			tone: "green",
			format: "number",
			description: "OTs cerradas del periodo",
		},
		{
			id: "overdue-sla",
			title: "Atrasadas SLA",
			pair: data?.kpis.overdue_sla_risk ?? toPair(fallback.overdueOrders),
			icon: AlertTriangle,
			tone: "red",
			format: "number",
			description: "Riesgo operativo por vencimiento",
			isLowerBetter: true,
		},
		{
			id: "sla-compliance",
			title: "Cumplimiento SLA",
			pair: data?.kpis.sla_compliance_pct ?? toPair(fallback.slaCompliancePct),
			icon: ShieldCheck,
			tone: "green",
			format: "percent",
			description: "Trabajos cerrados a tiempo",
			showProgress: true,
		},
		{
			id: "cycle-time",
			title: "Tiempo de ciclo",
			pair: data?.kpis.avg_cycle_time_days ?? toPair(fallback.avgCycleTimeDays),
			icon: Clock3,
			tone: "amber",
			format: "days",
			description: "Promedio desde creación a cierre",
			isLowerBetter: true,
		},
		{
			id: "first-time-fix",
			title: "First-Time Fix",
			pair: data?.kpis.first_time_fix_rate ?? toPair(fallback.firstTimeFixRate),
			icon: Activity,
			tone: "cyan",
			format: "percent",
			description: "Resuelto sin visita adicional",
			showGauge: true,
		},
		{
			id: "sla-risk-count",
			title: "Riesgo SLA",
			pair: data?.kpis.sla_risk_count ?? toPair(fallback.overdueOrders),
			icon: AlertTriangle,
			tone: "red",
			format: "number",
			description: "Vencen en las próximas 24 horas",
			isLowerBetter: true,
		},
		{
			id: "billing-funnel-cop",
			title: "Embudo facturación",
			pair: data?.kpis.billing_funnel_cop ?? toPair(0),
			icon: DollarSign,
			tone: "green",
			format: "cop",
			description: "COP detenido en cierre administrativo",
		},
		{
			id: "avg-days-to-invoice",
			title: "Días a factura",
			pair: data?.kpis.avg_days_to_invoice ?? toPair(0),
			icon: Clock3,
			tone: "amber",
			format: "days",
			description: "Meta operativa: menos de 5 días",
			isLowerBetter: true,
		},
		{
			id: "active-technicians",
			title: "Técnicos activos",
			pair: data?.kpis.active_technicians_today ?? toPair(fallback.activeTechnicians),
			icon: Users,
			tone: "purple",
			format: "number",
			description: "Recurso humano desplegado",
		},
		{
			id: "unassigned-orders",
			title: "OTs sin asignar",
			pair: data?.kpis.unassigned_orders ?? toPair(fallback.unassignedOrders),
			icon: UserX,
			tone: "amber",
			format: "number",
			description: "Pendientes sin técnico",
			isLowerBetter: true,
		},
		{
			id: "fsm-tasa-cumplimiento",
			title: "Tasa de cumplimiento",
			pair: data?.kpis.fsm_tasa_cumplimiento ?? toPair(fallback.fsmTasaCumplimiento),
			icon: CheckCircle2,
			tone: "green",
			format: "percent",
			description: "Órdenes completadas a tiempo",
			showProgress: true,
		},
		{
			id: "fsm-tiempo-ciclo",
			title: "Tiempo promedio de ciclo",
			pair: data?.kpis.fsm_tiempo_promedio_ciclo ?? toPair(fallback.fsmTiempoPromedioCiclo),
			icon: Clock3,
			tone: "amber",
			format: "days",
			description: "Días desde creación a cierre",
			isLowerBetter: true,
		},
		{
			id: "fsm-facturacion-pendiente",
			title: "Facturación pendiente",
			pair: data?.kpis.fsm_facturacion_pendiente ?? toPair(fallback.fsmFacturacionPendiente),
			icon: DollarSign,
			tone: "amber",
			format: "cop",
			description: "Monto COP en facturación pendiente",
		},
		{
			id: "fsm-ordenes-retraso",
			title: "Órdenes con retraso",
			pair: data?.kpis.fsm_ordenes_retraso ?? toPair(fallback.fsmOrdenesRetraso),
			icon: AlertTriangle,
			tone: "red",
			format: "number",
			description: "Cantidad de órdenes vencidas",
			isLowerBetter: true,
		},
		{
			id: "fsm-ordenes-activas",
			title: "Órdenes activas",
			pair: data?.kpis.fsm_ordenes_activas ?? toPair(fallback.fsmOrdenesActivas),
			icon: Activity,
			tone: "blue",
			format: "number",
			description: "Cantidad de órdenes activas actualmente",
		},
	];

	return (
		<section aria-label="Indicadores clave de Field Service">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => {
					const tone = TONE_CLASSES[metric.tone];
					const trend = calculateTrend(metric.pair);
					const isHealthyTrend = metric.isLowerBetter ? trend <= 0 : trend >= 0;
					const Icon = metric.icon;

					return (
						<article
							key={metric.id}
							className="rounded-lg border border-(--border-default) bg-(--surface-primary) p-5 shadow-(--shadow-1) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-2)"
						>
							<header className="flex items-start justify-between gap-3">
								<span
									className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone.bg}`}
								>
									<Icon className={`h-5 w-5 ${tone.icon}`} aria-hidden="true" />
								</span>
								{metric.showGauge ? (
									<Gauge value={metric.pair.current} color={tone.accent} />
								) : (
									<Sparkline pair={metric.pair} color={tone.accent} />
								)}
							</header>

							<div className="mt-4">
								<p className="text-3xl font-bold tracking-tight text-(--text-primary)">
									{formatMetric(metric.pair.current, metric.format)}
								</p>
								<h2 className="mt-1 text-sm font-semibold text-(--text-secondary)">
									{metric.title}
								</h2>
								<p className="mt-1.5 text-xs text-(--text-tertiary)">{metric.description}</p>
								{metric.showProgress ? (
									<ProgressBar value={metric.pair.current} color={tone.accent} />
								) : (
									<p
										className={`mt-3 text-xs font-semibold ${
											isHealthyTrend ? "text-(--color-success)" : "text-(--color-danger)"
										}`}
									>
										{trend > 0 ? "+" : ""}
										{trend}% vs periodo anterior
									</p>
								)}
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}
