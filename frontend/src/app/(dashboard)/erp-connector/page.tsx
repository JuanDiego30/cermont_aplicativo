"use client";

/**
 * /erp-connector — ERP integration management page
 */

import { useQuery } from "@tanstack/react-query";
import { Plug, RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";

type ErpConnector = {
	_id: string;
	provider: string;
	label: string;
	baseUrl: string;
	apiVersion: string;
	lifecycleStatus: string;
	createdAt: string;
};

export default function ErpConnectorPage() {
	const [syncing, setSyncing] = useState<string | null>(null);

	const { data, isLoading, error, refetch } = useQuery<ErpConnector[]>({
		queryKey: ["erp-connectors"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: ErpConnector[] }>(
				"/erp-connectors",
			);
			return json.data;
		},
	});

	const handleSync = async (id: string) => {
		setSyncing(id);
		try {
			await apiClient.post(`/erp-connectors/${id}/test-sync`, {});
		} finally {
			setSyncing(null);
		}
	};

	if (isLoading) {
		return (
			<section className="space-y-4" aria-label="Cargando conectores ERP">
				<Skeleton variant="text" />
				<Skeleton variant="chart" height={80} />
				<Skeleton variant="chart" height={80} />
			</section>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
				<p className="text-[var(--color-danger)]">Error al cargar conectores ERP.</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
				>
					Reintentar
				</button>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<section>
				<EmptyState
					icon="generic"
					title="Sin conectores ERP"
					description="No hay conectores ERP configurados."
				/>
			</section>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="erp-title">
			<header>
				<h1 id="erp-title" className="text-xl font-semibold text-[var(--text-primary)]">
					Conectores ERP
				</h1>
				<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
					{data.length} conectores configurados
				</p>
			</header>

			<div className="space-y-3">
				{data.map((connector) => (
					<div
						key={connector._id}
						className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
					>
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<Plug className="size-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden="true" />
								<p className="text-sm font-medium text-[var(--text-primary)]">{connector.label}</p>
								<span
									className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
										connector.lifecycleStatus === "active"
											? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
											: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
									}`}
								>
									{connector.lifecycleStatus === "active" ? "Activo" : "Inactivo"}
								</span>
							</div>
							<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
								{connector.provider} — {connector.baseUrl}
							</p>
						</div>
						<button
							type="button"
							disabled={syncing === connector._id}
							onClick={() => handleSync(connector._id)}
							className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-50"
						>
							<RefreshCw
								className={`size-3.5 ${syncing === connector._id ? "animate-spin" : ""}`}
								aria-hidden="true"
							/>
							{syncing === connector._id ? "Sincronizando..." : "Sincronizar"}
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
