"use client";

import { AlertCircle, Check, Loader2, Plug, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { useErpConnectors, useSyncErpConnector } from "@/modules/erp-connector/queries";

const PROVIDER_LABELS: Record<string, string> = {
	fssm: "Field Service Management",
	gmao_csm: "GMAO / CSM Maintenance",
	sap: "SAP",
	ariba: "SAP Ariba",
	dian: "DIAN",
	custom: "Custom Adapter",
};

export default function ErpConnectorsPage() {
	const { data: connectors, isLoading, isError, refetch } = useErpConnectors();
	const syncMutation = useSyncErpConnector();

	const handleSync = (provider: string) => {
		syncMutation.mutate(provider, {
			onSuccess: () => toast.success(`Sync initiated for ${PROVIDER_LABELS[provider] ?? provider}`),
			onError: () => toast.error(`Sync failed for ${PROVIDER_LABELS[provider] ?? provider}`),
		});
	};

	if (isLoading) {
		return (
			<section
				aria-label="Loading ERP connectors"
				className="flex items-center justify-center py-16"
			>
				<Loader2 className="size-7 animate-spin text-brand" />
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col items-center gap-4 py-16">
				<AlertCircle className="size-8 text-brand-error" />
				<h2 className="text-lg font-semibold">Failed to load ERP connectors</h2>
				<Button onClick={() => refetch()}>Retry</Button>
			</section>
		);
	}

	if (!connectors || connectors.length === 0) {
		return (
			<EmptyState
				icon={Plug}
				title="No ERP Connectors"
				description="Add an ERP connector to integrate with external systems like FSSM, GMAO/CSM, SAP, or DIAN."
				action={{ label: "Add Connector", href: "/admin/erp-connectors/new" }}
			/>
		);
	}

	return (
		<section aria-labelledby="erp-title" className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 id="erp-title" className="text-2xl font-bold">
						ERP Connectors
					</h1>
					<p className="mt-1 text-sm text-secondary">
						Manage external system integrations for multi-ERP operations.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{connectors.map((conn) => (
					<div
						key={conn._id}
						className="rounded-xl border border-hairline bg-surface p-5 shadow-card"
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-brand/10 p-2">
									<Plug className="size-5 text-brand" />
								</div>
								<div>
									<h3 className="font-semibold">{conn.name}</h3>
									<p className="text-sm text-secondary">
										{PROVIDER_LABELS[conn.provider] ?? conn.provider}
									</p>
								</div>
							</div>
							<span
								className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
									conn.enabled
										? "bg-success-bg/50 text-success dark:bg-success-bg/10 dark:text-success"
										: "bg-surface text-muted border border-hairline"
								}`}
							>
								{conn.enabled ? (
									<>
										<Check className="size-3" /> Active
									</>
								) : (
									<>
										<X className="size-3" /> Disabled
									</>
								)}
							</span>
						</div>

						<div className="mt-4 flex items-center gap-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleSync(conn.provider)}
								disabled={syncMutation.isPending}
							>
								<RefreshCw className={`size-3 ${syncMutation.isPending ? "animate-spin" : ""}`} />
								Sync Now
							</Button>
						</div>

						{conn.baseUrl && <p className="mt-3 text-xs text-tertiary truncate">{conn.baseUrl}</p>}
					</div>
				))}
			</div>
		</section>
	);
}
