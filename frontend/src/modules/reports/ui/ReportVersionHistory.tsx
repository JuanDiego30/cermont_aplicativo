"use client";

import { RotateCcw } from "lucide-react";

interface ReportVersion {
	id: string;
	number: number;
	createdAt: string;
	author: string;
	description: string;
}

interface Props {
	versions: ReportVersion[];
	onRestore: (versionId: string) => void;
}

export function ReportVersionHistory({ versions, onRestore }: Props) {
	if (versions.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
				Sin versiones registradas
			</p>
		);
	}

	return (
		<ol className="relative ml-4 border-l border-[var(--border-subtle)]">
			{versions.map((v) => (
				<li key={v.id} className="mb-6 ml-6">
					<span className="absolute -left-2 mt-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-brand-blue)] ring-4 ring-[var(--surface-primary)]">
						<span className="size-1.5 rounded-full bg-white" />
					</span>
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm font-semibold text-[var(--text-primary)]">
								v{v.number} — {v.description}
							</p>
							<p className="mt-0.5 text-xs text-[var(--text-secondary)]">{v.author}</p>
							<time className="text-xs text-[var(--text-tertiary)]">
								{new Date(v.createdAt).toLocaleString("es-CO")}
							</time>
						</div>
						<button
							type="button"
							onClick={() => onRestore(v.id)}
							className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
							title="Restaurar esta versión"
						>
							<RotateCcw className="size-3" aria-hidden="true" />
							Restaurar
						</button>
					</div>
				</li>
			))}
		</ol>
	);
}
