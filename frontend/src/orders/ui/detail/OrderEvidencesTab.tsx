"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useEvidences } from "@/evidences/queries";
import { EvidenceUploader } from "@/evidences/ui/EvidenceUploader";

const PHASES = [
	{ key: "before", label: "Antes" },
	{ key: "during", label: "Durante" },
	{ key: "after", label: "Después" },
	{ key: "defect", label: "Defectos" },
	{ key: "safety", label: "Seguridad" },
	{ key: "signature", label: "Firmas" },
] as const;

interface OrderEvidencesTabProps {
	orderId: string;
}

export function OrderEvidencesTab({ orderId }: OrderEvidencesTabProps) {
	const { data, isLoading, error } = useEvidences(orderId);

	const evidencesByPhase = PHASES.reduce<Record<string, typeof data>>((acc, phase) => {
		acc[phase.key] = data?.filter((e) => e.type === phase.key) ?? [];
		return acc;
	}, {});

	if (isLoading) {
		return (
			<section
				aria-label="Evidencias fotográficas"
				className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
			>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="mb-4 h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
					<div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				aria-label="Evidencias fotográficas"
				className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20"
			>
				<p className="text-sm text-red-600 dark:text-red-400">
					Error al cargar las evidencias. Intente nuevamente.
				</p>
			</section>
		);
	}

	const totalEvidences = data?.length ?? 0;

	return (
		<section
			aria-label="Evidencias fotográficas"
			className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
		>
			<EvidenceUploader orderId={orderId} />

			{totalEvidences === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<Camera
						className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sin evidencias</h3>
					<p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
						No hay evidencias fotográficas registradas para esta orden.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{PHASES.map((phase) => {
						const phaseEvidences = evidencesByPhase[phase.key] ?? [];
						if (phaseEvidences.length === 0) {
							return null;
						}

						return (
							<div key={phase.key} className="space-y-3">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
									{phase.label}{" "}
									<span className="text-xs font-normal text-slate-400 dark:text-slate-500">
										({phaseEvidences.length})
									</span>
								</h3>
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
									{phaseEvidences.map((evidence) => (
										<figure
											key={evidence._id}
											className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
										>
											<div className="relative aspect-square overflow-hidden">
												<Image
													src={evidence.url}
													alt={`Evidencia ${phase.label}`}
													fill
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
													className="object-cover transition-transform hover:scale-105"
												/>
											</div>
											<figcaption className="space-y-1 p-2">
												<p className="truncate text-xs text-slate-600 dark:text-slate-400">
													{new Date(evidence.createdAt).toLocaleDateString("es-ES")}
												</p>
												{evidence.description && (
													<p className="truncate text-xs text-slate-500 dark:text-slate-500">
														{evidence.description}
													</p>
												)}
											</figcaption>
										</figure>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
