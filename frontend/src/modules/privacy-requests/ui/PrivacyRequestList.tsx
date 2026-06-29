/**
 * Privacy requests list view
 */
"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { usePrivacyRequests } from "../hooks/usePrivacyRequests";

const STATUS_LABELS: Record<string, string> = {
	pending: "Pendiente",
	in_progress: "En proceso",
	completed: "Completada",
	rejected: "Rechazada",
};

const TYPE_LABELS: Record<string, string> = {
	access: "Acceso a datos",
	rectification: "Rectificación",
	erasure: "Eliminación",
	restriction: "Restricción",
	portability: "Portabilidad",
};

const STATUS_COLORS: Record<string, string> = {
	pending: "bg-amber-500/10 text-amber-600 border-amber-200",
	in_progress: "bg-blue-500/10 text-blue-600 border-blue-200",
	completed: "bg-green-500/10 text-green-600 border-green-200",
	rejected: "bg-red-500/10 text-red-600 border-red-200",
};

export function PrivacyRequestList() {
	const { data: requests, isLoading, error } = usePrivacyRequests();

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton variant="card" />
				<Skeleton variant="card" />
				<Skeleton variant="card" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/10 p-6 text-center">
				<p className="text-sm text-[var(--color-danger)]">
					Error al cargar solicitudes. Intente de nuevo.
				</p>
			</div>
		);
	}

	if (!requests?.length) {
		return (
			<EmptyState
				icon={FileText}
				title="Sin solicitudes"
				description="No hay solicitudes de privacidad registradas."
			/>
		);
	}

	return (
		<div className="space-y-4">
			{requests.map((req) => (
				<article
					key={req._id}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
				>
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-medium text-[var(--text-primary)]">
								{TYPE_LABELS[req.type] ?? req.type}
							</h4>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">{req.description}</p>
						</div>
						<span
							className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[req.status] || ""}`}
						>
							{STATUS_LABELS[req.status] ?? req.status}
						</span>
					</div>
					<p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
						{new Date(req.submittedAt).toLocaleDateString("es-CO")}
					</p>
				</article>
			))}
		</div>
	);
}
