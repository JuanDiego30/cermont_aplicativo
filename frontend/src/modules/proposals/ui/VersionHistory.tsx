"use client";

import type { Proposal } from "@cermont/shared-types";
import { History } from "lucide-react";
import { useMemo } from "react";

interface ProposalVersion {
	_id: string;
	code: string;
	status: Proposal["status"];
	total: number;
	createdAt: string;
	superseded: boolean;
}

interface VersionHistoryProps {
	versions: ProposalVersion[];
	currentProposalId: string;
}

export function VersionHistory({ versions, currentProposalId }: VersionHistoryProps) {
	const dateFormatter = useMemo(
		() => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" }),
		[],
	);
	const currencyFormatter = useMemo(
		() => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
		[],
	);
	if (versions.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-[var(--border-default)] p-4 text-center text-sm text-[var(--text-secondary)]">
				Sin historial de versiones
			</div>
		);
	}

	return (
		<section className="space-y-3" aria-label="Historial de versiones">
			<div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
				<History className="size-4" />
				Historial de versiones
			</div>
			<ul className="divide-y divide-[var(--border-subtle)]">
				{versions.map((version) => (
					<li
						key={version._id}
						className={`flex items-center justify-between px-3 py-2 text-sm ${
							version._id === currentProposalId
								? "bg-brand/5 font-medium text-brand"
								: "text-[var(--text-secondary)]"
						}`}
					>
						<div>
							<span className="font-mono text-xs">{version.code}</span>
							{version.superseded && (
								<span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
									Reemplazada
								</span>
							)}
						</div>
						<div className="flex items-center gap-3 text-xs">
							<span>{currencyFormatter.format(version.total)}</span>
							<span className="text-[var(--text-tertiary)]">
								{dateFormatter.format(new Date(version.createdAt))}
							</span>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
