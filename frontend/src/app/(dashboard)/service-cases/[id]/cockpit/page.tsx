"use client";

import { use } from "react";
import { useCockpit } from "@/modules/cockpit/hooks/useCockpit";
import { AuditTimeline } from "@/modules/cockpit/ui/AuditTimeline";
import { BlockersPanelCollapsible } from "@/modules/cockpit/ui/BlockersPanelCollapsible";
import { CockpitHeaderCard } from "@/modules/cockpit/ui/CockpitHeaderCard";
import { CockpitTabs } from "@/modules/cockpit/ui/CockpitTabs";
import { DocumentRequirementsTable } from "@/modules/cockpit/ui/DocumentRequirementsTable";
import { FourteenStepProgressBar } from "@/modules/cockpit/ui/FourteenStepProgressBar";
import { NextActionCard } from "@/modules/cockpit/ui/NextActionCard";

interface Props {
	params: Promise<{ id: string }>;
}

export default function CockpitPage({ params }: Props) {
	const { id } = use(params);
	const { data, isLoading, isError, error } = useCockpit(id);

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-16 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
				<div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<div className="max-w-md text-center">
					<p className="text-lg font-semibold text-[var(--text-primary)]">
						Error al cargar el cockpit
					</p>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">
						{error instanceof Error ? error.message : "Error desconocido"}
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 rounded-full bg-[var(--color-brand-blue)] px-6 py-2.5 text-sm font-semibold text-white"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<p className="text-sm text-[var(--text-secondary)]">No se encontró la orden de servicio</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 md:p-6">
			<CockpitHeaderCard cockpit={data} />

			<section aria-label="Barra de progreso">
				<FourteenStepProgressBar steps={data.steps} currentStep={data.currentStep} />
			</section>

			{data.nextAction && (
				<section aria-label="Próxima acción">
					<NextActionCard action={data.nextAction} />
				</section>
			)}

			<section aria-label="Bloqueos">
				<BlockersPanelCollapsible blockers={data.blockers} />
			</section>

			<section aria-label="Secciones del cockpit">
				<CockpitTabs
					tabs={[
						{
							id: "documents",
							label: "Documentos",
							content: (
								<DocumentRequirementsTable
									documents={[
										{ name: "ATS Firmado", step: 5, status: "ready", fileUrl: "#" },
										{ name: "PTW Aprobado", step: 5, status: "pending" },
										{ name: "Certificado vehículo", step: 5, status: "pending" },
										{ name: "Informe técnico", step: 7, status: "pending" },
										{ name: "Acta de entrega", step: 8, status: "pending" },
										{ name: "SES Emitida", step: 10, status: "pending" },
										{ name: "Factura", step: 12, status: "pending" },
									]}
								/>
							),
						},
						{
							id: "evidence",
							label: "Evidencias",
							content: (
								<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
									Galería de evidencias agrupadas por fase (BEFORE / DURING / AFTER)
								</p>
							),
						},
						{
							id: "costs",
							label: "Costos",
							content: (
								<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
									Resumen de costos estimados vs reales
								</p>
							),
						},
						{
							id: "timeline",
							label: "Timeline",
							content: <AuditTimeline events={[]} />,
						},
						{
							id: "admin",
							label: "Admin",
							content: (
								<p className="py-8 text-center text-sm text-[var(--text-secondary)]">
									Pipeline SES → Factura → Pago
								</p>
							),
						},
					]}
				/>
			</section>
		</div>
	);
}
