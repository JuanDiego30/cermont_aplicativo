"use client";

import { BadgePill } from "@/core/ui/BadgePill";
import { cn } from "@/lib/utils";

/**
 * ProposalStatusBadge , uses English ProposalStatus from shared-types as SSOT.
 * Spanish labels provided for UI display only.
 */

const STATUS_META: Record<string, { label: string; className: string }> = {
	draft: {
		label: "Borrador",
		className: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
	},
	sent: {
		label: "Enviada",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
	},
	approved: {
		label: "Aprobada",
		className: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	},
	rejected: {
		label: "Rechazada",
		className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
	},
	expired: {
		label: "Expirada",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	},
};

const FALLBACK_META = {
	label: "",
	className: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
};

/**
 * Normalizes legacy Spanish status values to English ProposalStatus.
 * Returns the input unchanged if it is already English.
 */
export function normalizeProposalStatus(status: string): string {
	switch (status) {
		case "borrador":
			return "draft";
		case "enviada":
			return "sent";
		case "aprobada":
			return "approved";
		case "rechazada":
			return "rejected";
		case "expirada":
			return "expired";
		default:
			return status;
	}
}

export function ProposalStatusBadge({ status }: { status: string }) {
	const normalizedStatus = normalizeProposalStatus(status);
	const meta = STATUS_META[normalizedStatus] ?? {
		...FALLBACK_META,
		label: status,
	};

	return (
		<BadgePill className={cn("text-xs font-semibold", meta.className)}>{meta.label}</BadgePill>
	);
}
