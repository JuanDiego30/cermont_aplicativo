/**
 * CERMONT Flow Status Styles — SSOT for step status visual styles.
 *
 * Status groups:
 *   completed    → done (semantic success)
 *   in_progress  → active (brand accent / info)
 *   blocked      → stuck (semantic danger)
 *   pending      → waiting (neutral / muted)
 *
 * Usage: These records are reference-only objects that resolve to classes
 * referencing CSS custom properties. They are NOT React components.
 *
 * @see DESIGN.md §3.2 — Color-as-signal rules
 */

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Check, Circle, Lock } from "lucide-react";

export type StepStatus = "completed" | "in_progress" | "blocked" | "pending";

export interface StatusStyle {
	/** Background color class for the step indicator */
	bg: string;
	/** Border color class for the step indicator */
	border: string;
	/** Icon for the status */
	icon: LucideIcon;
	/** Tailwind circle-fill color for connector lines */
	connector: string;
	/** Label for screen readers */
	label: string;
}

export const STATUS_STYLES: Record<StepStatus, StatusStyle> = {
	completed: {
		bg: "bg-[var(--color-success)]",
		border: "border-[var(--color-success)]",
		icon: Check,
		connector: "bg-[var(--color-success)]",
		label: "Completado",
	},
	in_progress: {
		bg: "bg-[var(--color-info)]",
		border: "border-[var(--color-info)]",
		icon: Circle,
		connector: "bg-[var(--color-info)]",
		label: "En progreso",
	},
	blocked: {
		bg: "bg-[var(--color-danger)]",
		border: "border-[var(--color-danger)]",
		icon: AlertTriangle,
		connector: "bg-[var(--color-danger)]",
		label: "Bloqueado",
	},
	pending: {
		bg: "bg-[var(--color-steel)]",
		border: "border-[var(--color-steel)]",
		icon: Lock,
		connector: "bg-[var(--color-steel)]",
		label: "Pendiente",
	},
};
