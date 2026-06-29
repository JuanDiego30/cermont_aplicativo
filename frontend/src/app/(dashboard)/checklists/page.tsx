"use client";

/**
 * /checklists — Checklists management page
 * Lists checklists by order and provides access to ChecklistPanel
 */

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";

type ChecklistSummary = {
	_id: string;
	orderId: string;
	orderCode: string;
	templateName: string;
	status: string;
	itemCount: number;
	completedItems: number;
	createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	in_progress: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
	completed: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	cancelled: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

const STATUS_LABELS: Record<string, string> = {
	pending: "Pendiente",
	in_progress: "En progreso",
	completed: "Completado",
	cancelled: "Cancelado",
};

export default function ChecklistsPage() {
	const [search, setSearch] = useState("");

	const { data: checklists = [], isLoading, error } = useQuery<ChecklistSummary[]>({
		queryKey: ["checklists"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: ChecklistSummary[] }>(
				"/checklists",
			);
			return json.data;
		},
	});

	const filtered = search.trim()
		? checklists.filter(
				(c) =>
					c.orderCode.toLowerCase().includes(search.toLowerCase()) ||
					c.templateName.toLowerCase().includes(search.toLowerCase()),
			)
		: checklists;

	return (
		<section className="space-y-6" aria-labelledby="checklists-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="checklists-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Checklists operativos
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{checklists.length} checklist(s) registrados
					</p>
				</div>
				<div className="relative w-full sm:w-64">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true" />
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por orden…"
						className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] py-2 pl-9 pr-3 text-sm"
					/>
				</div>
			</header>

			{isLoading && <Skeleton variant="list-item" rows={5} />}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-4 text-sm text-[var(--color-danger)]">
					Error al cargar checklists.
				</div>
			)}

			{!isLoading && !error && filtered.length === 0 && (
				<EmptyState
					icon="generic"
					title={search ? "Sin resultados" : "Sin checklists"}
					description={
						search
							? `No hay checklists que coincidan con "${search}".`
							: "No hay checklists registrados. Genéralos desde la orden de trabajo."
					}
				/>
			)}

			{filtered.length > 0 && (
				<div className="space-y-2">
					{filtered.map((cl) => (
						<div
							key={cl._id}
							className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
						>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<ClipboardList className="size-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden="true" />
									<p className="text-sm font-medium text-[var(--text-primary)]">
										{cl.templateName}
									</p>
									<span
										className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
											STATUS_STYLES[cl.status] ?? ""
										}`}
									>
										{STATUS_LABELS[cl.status] ?? cl.status}
									</span>
								</div>
								<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
									Orden: {cl.orderCode} — {cl.completedItems}/{cl.itemCount} items
								</p>
							</div>
							<Link
								href={`/orders/${cl.orderId}`}
								className="flex shrink-0 items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							>
								<ExternalLink className="size-3.5" aria-hidden="true" />
								Abrir orden
							</Link>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
