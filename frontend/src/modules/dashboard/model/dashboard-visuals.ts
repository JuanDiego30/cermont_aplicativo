/**
 * CERMONT Dashboard — Activity Visuals Catalog (SSOT)
 *
 * Every "real activity image" in the dashboard is registered here. Components
 * look up images by `DashboardVisual` key. The catalog pairs each visual with
 *   - a stable public path (used by `next/image`)
 *   - a module route (Link target)
 *   - width/height (image intrinsic dimensions)
 *   - alt text + caption (a11y, screen reader)
 *
 * No hardcoded paths in components. Add a new entry here, the rest of the
 * dashboard will pick it up.
 */

export type DashboardVisual =
	| "lifelines"
	| "cctv"
	| "planning"
	| "order"
	| "evidence"
	| "execution"
	| "risk";

export interface DashboardVisualConfig {
	/** Path served from `public/`. */
	src: string;
	/** Intrinsic width (used by `next/image` for aspect ratio). */
	width: number;
	/** Intrinsic height. */
	height: number;
	/** Module route — the image is a link to this. */
	href: string;
	/** Spanish short title for caption and aria-label. */
	title: string;
	/** Spanish description (1 sentence, ≤ 90 chars). */
	description: string;
	/** Icon concept that selects the canonical icon color for the badge. */
	iconConcept:
		| "module.lifelines"
		| "module.cctv"
		| "planning"
		| "order.active"
		| "evidence"
		| "execution"
		| "module.risk";
}

export const DASHBOARD_VISUALS: Record<DashboardVisual, DashboardVisualConfig> = {
	lifelines: {
		src: "/images/dashboard/lifelines.svg",
		width: 800,
		height: 480,
		href: "/ordenes",
		title: "Líneas de vida",
		description: "Inspección y certificación de sistemas de anclaje industrial.",
		iconConcept: "module.lifelines",
	},
	cctv: {
		src: "/images/dashboard/cctv.svg",
		width: 800,
		height: 480,
		href: "/evidencias",
		title: "Sistema CCTV",
		description: "Monitoreo 24/7 con 8 cámaras activas en planta.",
		iconConcept: "module.cctv",
	},
	planning: {
		src: "/images/dashboard/planning.svg",
		width: 800,
		height: 480,
		href: "/planeacion",
		title: "Planeación técnica",
		description: "Asignación de recursos, gantt y checklist preflight.",
		iconConcept: "planning",
	},
	order: {
		src: "/images/dashboard/order.svg",
		width: 800,
		height: 480,
		href: "/ordenes",
		title: "Orden de servicio",
		description: "OS-2026-0428 aprobada con desglose económico y firmas.",
		iconConcept: "order.active",
	},
	evidence: {
		src: "/images/dashboard/evidence.svg",
		width: 800,
		height: 480,
		href: "/evidencias",
		title: "Evidencias de campo",
		description: "6 evidencias capturadas hoy, 2 requieren validación.",
		iconConcept: "evidence",
	},
	execution: {
		src: "/images/dashboard/execution.svg",
		width: 800,
		height: 480,
		href: "/ejecucion",
		title: "Ejecución en obra",
		description: "3 técnicos on-site con checklist preflight al 80%.",
		iconConcept: "execution",
	},
	risk: {
		src: "/images/dashboard/risk.svg",
		width: 800,
		height: 480,
		href: "/hse",
		title: "Riesgos HSE",
		description: "Matriz IPER con 5 hallazgos activos, 2 críticos.",
		iconConcept: "module.risk",
	},
} as const;

export const DASHBOARD_VISUAL_LIST: DashboardVisualConfig[] = Object.values(
	DASHBOARD_VISUALS,
);
