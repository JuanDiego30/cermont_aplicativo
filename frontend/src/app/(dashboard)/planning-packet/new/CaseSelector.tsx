"use client";

import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";

interface CaseSelectorProps {
	isCasesLoading: boolean;
	casesData:
		| { items?: { _id: string; clientName: string; code: string; currentStage: string }[] }
		| undefined;
	onSelectCase: (caseId: string) => void;
}

export function CaseSelector({ isCasesLoading, casesData, onSelectCase }: CaseSelectorProps) {
	return (
		<section className="space-y-6" aria-labelledby="planning-select-title">
			<header className="space-y-3">
				<Link
					href="/service-cases"
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" />
					Volver a casos
				</Link>
				<div>
					<h1
						id="planning-select-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Seleccionar caso de servicio
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Seleccione el caso con orden de compra aprobada para iniciar la planeaci&oacute;n.
					</p>
				</div>
			</header>

			{isCasesLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			) : (
				<div className="grid gap-3">
					{(casesData?.items ?? []).length === 0 ? (
						<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center">
							<Search className="mx-auto size-8 text-[var(--text-muted)]" />
							<p className="mt-3 text-sm text-[var(--text-secondary)]">
								No hay casos disponibles con PO aprobada.
							</p>
						</div>
					) : (
						(casesData?.items ?? []).map(
							(c: { _id: string; clientName: string; code: string; currentStage: string }) => (
								<button
									key={c._id}
									type="button"
									onClick={() => onSelectCase(c._id)}
									className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
								>
									<div>
										<p className="font-semibold text-[var(--text-primary)]">{c.clientName}</p>
										<p className="mt-0.5 text-sm text-[var(--text-muted)]">
											{c.code} &middot; {c.currentStage}
										</p>
									</div>
									<span className="text-sm font-medium text-[var(--color-brand)]">
										Seleccionar &rarr;
									</span>
								</button>
							),
						)
					)}
				</div>
			)}
		</section>
	);
}
