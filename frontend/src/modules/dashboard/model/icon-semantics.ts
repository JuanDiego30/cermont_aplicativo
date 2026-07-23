/**
 * CERMONT Dashboard — Icon Semantic Color System (SSOT)
 *
 * Rule: every icon that represents the same concept MUST wear the same color
 * across the entire dashboard. We do NOT switch colors based on state or
 * severity at the icon level — the color encodes the concept. Severity is
 * conveyed through background, border, badge, and label, never by recoloring
 * the icon.
 *
 *   Examples (correct):
 *     - Activity (Actividad)         → icon: --color-icon-accent  (Cermont Blue)
 *     - SLA / Cierre                 → icon: --color-icon-success (Cermont Green)
 *     - Alerta / Riesgo              → icon: --color-icon-warning (Amber)
 *     - Crítico / Vencido            → icon: --color-icon-error   (Red)
 *     - Información                  → icon: --color-icon-info    (Blue Light)
 *     - Etapa comercial              → icon: --color-icon-accent  (Cermont Blue)
 *     - Etapa operativo              → icon: --color-icon-accent  (Cermont Blue)
 *     - Etapa cierre                 → icon: --color-icon-success (Cermont Green)
 *     - Etapa financiero             → icon: --color-icon-primary (Ink / Navy)
 *
 * All values reference the design tokens defined in `src/app/globals.css`.
 * Never hardcode raw hex values.
 */

export type IconSemantic =
	| "primary"
	| "accent"
	| "info"
	| "success"
	| "warning"
	| "error"
	| "neutral"
	| "muted";

export interface IconColorTokens {
	/** Tailwind text class referencing the icon color CSS var. */
	iconText: string;
	/** Tailwind background class for the icon container (10% opacity surface). */
	iconBg: string;
	/** Tailwind ring/border class for the icon container (40% opacity). */
	iconBorder: string;
	/** CSS var name for the icon color (for inline styles). */
	cssVar: string;
	/** Spanish label for screen-reader / a11y descriptions. */
	label: string;
}

export const ICON_SEMANTIC_TOKENS: Record<IconSemantic, IconColorTokens> = {
	primary: {
		iconText: "text-[var(--icon-primary)]",
		iconBg: "bg-[var(--color-surface-soft)]",
		iconBorder: "border-[var(--color-hairline)]",
		cssVar: "--icon-primary",
		label: "Primario",
	},
	accent: {
		iconText: "text-[var(--icon-accent)]",
		iconBg: "bg-[var(--color-cermont-blue-bg)]",
		iconBorder: "border-[var(--color-brand-blue)]/40",
		cssVar: "--icon-accent",
		label: "Cermont",
	},
	info: {
		iconText: "text-[var(--icon-info)]",
		iconBg: "bg-[var(--color-info-bg)]",
		iconBorder: "border-[var(--color-info)]/40",
		cssVar: "--icon-info",
		label: "Información",
	},
	success: {
		iconText: "text-[var(--icon-success)]",
		iconBg: "bg-[var(--color-success-bg)]",
		iconBorder: "border-[var(--color-success)]/40",
		cssVar: "--icon-success",
		label: "Éxito",
	},
	warning: {
		iconText: "text-[var(--icon-warning)]",
		iconBg: "bg-[var(--color-warning-bg)]",
		iconBorder: "border-[var(--color-warning)]/40",
		cssVar: "--icon-warning",
		label: "Advertencia",
	},
	error: {
		iconText: "text-[var(--icon-error)]",
		iconBg: "bg-[var(--color-danger-bg)]",
		iconBorder: "border-[var(--color-danger)]/40",
		cssVar: "--icon-error",
		label: "Error",
	},
	neutral: {
		iconText: "text-[var(--icon-interactive)]",
		iconBg: "bg-[var(--color-surface)]",
		iconBorder: "border-[var(--color-hairline)]",
		cssVar: "--icon-interactive",
		label: "Neutral",
	},
	muted: {
		iconText: "text-[var(--icon-muted)]",
		iconBg: "bg-transparent",
		iconBorder: "border-transparent",
		cssVar: "--icon-muted",
		label: "Apagado",
	},
} as const;

/**
 * CERMONT — Map every concept to ONE icon semantic.
 * This is the single source of truth. Components MUST look up colors via this
 * map. The map is keyed by canonical concept name, NOT by lucide icon name.
 */
export const CONCEPT_ICON_SEMANTIC: Record<string, IconSemantic> = {
	// ── Order / Pipeline ──
	"order.active": "accent",
	"order.total": "accent",
	"order.created": "accent",
	"order.inProgress": "info",
	"order.completed": "success",
	"order.blocked": "warning",
	"order.closed": "success",

	// ── Plan / Schedule ──
	"planning": "info",
	"execution": "accent",
	"evidence": "info",

	// ── Maintenance / Kit ──
	"maintenance.open": "warning",
	"maintenance.upcoming": "accent",
	"kit.active": "accent",
	"kit.inventory": "primary",
	"resource.inUse": "info",

	// ── Money / Finance ──
	"finance.revenue": "success",
	"finance.budget": "accent",
	"finance.overdue": "error",
	"finance.outstanding": "warning",
	"finance.paid": "success",
	"finance.invoice": "accent",
	"finance.payment": "success",
	"finance.ses": "info",

	// ── SLA / Risk ──
	"sla.compliance": "success",
	"sla.atRisk": "warning",
	"sla.breached": "error",
	"sla.healthy": "success",
	"sla.warning": "warning",
	"sla.critical": "error",

	// ── Predict / Health ──
	"predictive.low": "info",
	"predictive.medium": "warning",
	"predictive.high": "warning",
	"predictive.critical": "error",
	"health.score": "success",
	"health.declining": "warning",
	"health.stable": "info",
	"health.improving": "success",

	// ── Activity / Timeline ──
	"activity.recent": "accent",
	"activity.alert": "warning",
	"activity.success": "success",
	"activity.info": "info",
	"activity.danger": "error",

	// ── Flow stages (14-step pipeline) ──
	"flow.comercial": "accent",
	"flow.operativo": "accent",
	"flow.cierre": "success",
	"flow.financiero": "primary",

	// ── Service lines / Modules ──
	"module.lifelines": "accent",
	"module.cctv": "info",
	"module.hse": "success",
	"module.risk": "warning",
	"module.cost": "primary",
	"module.inventory": "primary",

	// ── User / Role ──
	"user": "primary",
	"role": "info",
	"team": "primary",
	"technician": "info",

	// ── Status / Generic ──
	"status.success": "success",
	"status.warning": "warning",
	"status.danger": "error",
	"status.info": "info",
	"status.neutral": "neutral",
	"status.draft": "muted",
} as const;

export type IconConcept = keyof typeof CONCEPT_ICON_SEMANTIC;

export function getIconTokensForConcept(concept: IconConcept): IconColorTokens {
	return ICON_SEMANTIC_TOKENS[CONCEPT_ICON_SEMANTIC[concept]];
}

export function getIconTokensForSemantic(semantic: IconSemantic): IconColorTokens {
	return ICON_SEMANTIC_TOKENS[semantic];
}

/**
 * Severity → icon semantic mapping. Severity is rendered through container
 * background / border, NEVER through the icon's own color. This is intentional:
 * the icon must keep its concept color so the user can recognize the underlying
 * domain (SLA, Predictive, Health) regardless of severity.
 */
export const SEVERITY_BACKGROUND: Record<
	"low" | "medium" | "high" | "critical",
	{ bg: string; border: string; label: string; text: string }
> = {
	low: {
		bg: "bg-[var(--color-info-bg)]",
		border: "border-[var(--color-info)]/30",
		label: "Bajo",
		text: "text-[var(--color-info)]",
	},
	medium: {
		bg: "bg-[var(--color-warning-bg)]",
		border: "border-[var(--color-warning)]/30",
		label: "Medio",
		text: "text-[var(--color-warning)]",
	},
	high: {
		bg: "bg-[var(--color-warning-bg)]",
		border: "border-[var(--color-warning)]/50",
		label: "Alto",
		text: "text-[var(--color-warning)]",
	},
	critical: {
		bg: "bg-[var(--color-danger-bg)]",
		border: "border-[var(--color-danger)]/40",
		label: "Crítico",
		text: "text-[var(--color-danger)]",
	},
} as const;
