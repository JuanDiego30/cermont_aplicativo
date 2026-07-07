"use client";

/**
 * EvidenceStatusBadge — Visual badge for Evidence FSM status.
 *
 * Displays the current state in the 8-state FSM:
 * captured → uploaded → pending_review → approved → rejected
 *                                         → replacement_requested → captured
 *                                         → locked → archived
 */

interface EvidenceStatusBadgeProps {
	status:
		| "captured"
		| "uploaded"
		| "pending_review"
		| "approved"
		| "rejected"
		| "replacement_requested"
		| "locked"
		| "archived"
		| string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
	captured: {
		label: "Capturada",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	uploaded: {
		label: "Subida",
		className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
	},
	pending_review: {
		label: "En revisión",
		className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	approved: {
		label: "Aprobada",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	rejected: {
		label: "Rechazada",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	replacement_requested: {
		label: "Reemplazo solicitado",
		className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	locked: {
		label: "Bloqueada",
		className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
	archived: {
		label: "Archivada",
		className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
	},
};

export function EvidenceStatusBadge({ status }: EvidenceStatusBadgeProps) {
	const config = STATUS_CONFIG[status] ?? {
		label: status,
		className: "bg-gray-100 text-gray-600",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.className}`}
		>
			{config.label}
		</span>
	);
}
