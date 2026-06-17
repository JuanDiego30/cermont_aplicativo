import {
	AlertTriangle,
	ClipboardCheck,
	ClipboardList,
	FileText,
	Route,
	Wrench,
} from "lucide-react";
import Link from "next/link";

interface ServiceCaseDashboardPanelProps {
	activeOrders: number;
	closedOrders: number;
	overdueOrders: number;
	maintenanceOpenCount: number;
	activeKitCount: number;
	totalBudgetApproved: number;
	recentOrdersCount: number;
	// Enhanced KPIs
	blockedCases?: number;
	readyToBill?: number;
	readyToClose?: number;
	inPlanning?: number;
}

const WORKFLOW_STEPS = [
	"Solicitud",
	"Visita",
	"Propuesta",
	"Aprobación",
	"Orden",
	"Planeación",
	"Ejecución",
	"Informe",
	"Acta",
	"SES",
	"Factura",
	"Pago",
] as const;

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatMoney(value: number): string {
	return COP_FORMATTER.format(value);
}

function clampPercent(value: number): number {
	return Math.max(0, Math.min(100, Math.round(value)));
}

export function ServiceCaseDashboardPanel({
	activeOrders,
	closedOrders,
	overdueOrders,
	maintenanceOpenCount,
	activeKitCount,
	totalBudgetApproved,
	recentOrdersCount,
	blockedCases = 0,
	readyToBill = 0,
	readyToClose = 0,
	inPlanning = 0,
}: ServiceCaseDashboardPanelProps) {
	const totalOperationalCases = activeOrders + closedOrders + overdueOrders;
	const executionLoad = activeOrders + maintenanceOpenCount;
	const closeoutProgress =
		totalOperationalCases > 0 ? (closedOrders / totalOperationalCases) * 100 : 0;
	const closeoutProgressPercent = clampPercent(closeoutProgress);
	const workflowPreview = WORKFLOW_STEPS.slice(0, 6);
	const workflowCloseout = WORKFLOW_STEPS.slice(6);

	const actionCards = [
		{
			label: "Casos activos",
			value: activeOrders,
			href: "/service-cases",
			icon: ClipboardList,
			tone: "text-[var(--color-brand-blue)]",
			surface: "bg-[var(--color-brand-blue-bg)]",
		},
		{
			label: "En planeación / ejecución",
			value: executionLoad + inPlanning,
			href: "/execution",
			icon: Wrench,
			tone: "text-[var(--color-brand-strong)]",
			surface: "bg-[var(--color-brand-hover)]",
		},
		{
			label: "Bloqueados",
			value: blockedCases || overdueOrders,
			href: "/service-cases",
			icon: AlertTriangle,
			tone: "text-[var(--color-danger)]",
			surface: "bg-[var(--color-danger-bg)]",
		},
		{
			label: "Listos para facturar",
			value: readyToBill || readyToClose || closedOrders,
			href: "/billing/ses",
			icon: ClipboardCheck,
			tone: "text-[var(--color-success)]",
			surface: "bg-[var(--color-success-bg)]",
		},
	] as const;

	return (
		<section
			data-dash="service-case"
			aria-labelledby="service-case-dashboard-title"
			className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] sm:p-6"
		>
			<div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
				<div>
					<div className="flex items-start gap-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-hover)] text-[var(--color-brand-strong)]">
							<Route className="size-5" aria-hidden="true" />
						</span>
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
								ServiceCase operativo
							</p>
							<h2
								id="service-case-dashboard-title"
								className="mt-1 text-xl font-semibold text-[var(--text-primary)]"
							>
								Flujo Cermont de punta a punta
							</h2>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
								Solicitudes, visitas, propuestas, órdenes, planeación, ejecución, evidencias,
								informes, actas, SES, facturación y pagos bajo el mismo caso de servicio.
							</p>
						</div>
					</div>

					<div className="mt-6 grid gap-3 sm:grid-cols-3">
						<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
								Pipeline
							</p>
							<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
								{totalOperationalCases.toLocaleString("es-CO")}
							</p>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">casos derivados de KPIs</p>
						</div>
						<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
								Kits activos
							</p>
							<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
								{activeKitCount.toLocaleString("es-CO")}
							</p>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">herramientas y equipos</p>
						</div>
						<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
								Presupuesto
							</p>
							<p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
								{formatMoney(totalBudgetApproved)}
							</p>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">aprobado en órdenes</p>
						</div>
					</div>

					<div className="mt-5">
						<div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
							<span>Cierre operativo</span>
							<span>{closeoutProgressPercent}%</span>
						</div>
						<div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
							<span
								className="block h-full rounded-full bg-[var(--color-brand)]"
								style={{ width: `${closeoutProgressPercent}%` }}
							/>
						</div>
					</div>
				</div>

				<div className="grid gap-4">
					<div className="grid gap-3 sm:grid-cols-2">
						{actionCards.map(({ label, value, href, icon: Icon, tone, surface }) => (
							<Link
								key={label}
								href={href}
								className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-2)]"
							>
								<div className="flex items-center justify-between gap-3">
									<span
										className={`flex size-10 items-center justify-center rounded-xl ${surface} ${tone}`}
									>
										<Icon className="size-5" aria-hidden="true" />
									</span>
									<span className={`font-mono text-2xl font-semibold ${tone}`}>
										{value.toLocaleString("es-CO")}
									</span>
								</div>
								<p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{label}</p>
							</Link>
						))}
					</div>

					<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
						<div className="flex items-center gap-2 text-[var(--text-primary)]">
							<FileText className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
							<p className="text-sm font-semibold">Cadena documental</p>
						</div>
						<div className="mt-4 grid gap-2 sm:grid-cols-2">
							{[workflowPreview, workflowCloseout].map((group) => (
								<ol key={group[0]} className="space-y-2">
									{group.map((step, index) => (
										<li
											key={step}
											className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
										>
											<span className="flex size-5 items-center justify-center rounded-full bg-[var(--surface-primary)] font-mono text-[10px] font-semibold text-[var(--color-brand-strong)]">
												{index + (group === workflowCloseout ? workflowPreview.length : 0) + 1}
											</span>
											{step}
										</li>
									))}
								</ol>
							))}
						</div>
						<p className="mt-4 text-xs leading-5 text-[var(--text-tertiary)]">
							{recentOrdersCount.toLocaleString("es-CO")} órdenes recientes alimentan el pulso de
							este flujo.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
