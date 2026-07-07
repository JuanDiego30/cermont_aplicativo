"use client";

import type { EvidenceType, LinkedEvidenceSummary } from "@cermont/shared-types";
import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import { Camera, MapPin } from "lucide-react";
import Image from "next/image";

interface EvidenceGallerySectionProps {
	evidences: LinkedEvidenceSummary[];
}

const TYPE_LABEL: Record<EvidenceType, string> = {
	before: "Antes",
	during: "Durante",
	after: "Después",
	defect: "Hallazgo",
	safety: "Seguridad",
	signature: "Firma",
};

const TYPE_CLASSES: Record<EvidenceType, string> = {
	before: "border-[var(--color-brand)] text-[var(--color-brand)]",
	during: "border-brand-warn text-brand-warn",
	after: "border-brand-annotate text-brand-annotate",
	defect: "border-[var(--color-danger-border)] text-[var(--color-danger)]",
	safety: "border-brand-warn text-brand-warn",
	signature: "border-hairline text-steel",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

const GENERAL_GROUP_KEY = "general";

function groupLabel(stepCode: string): string {
	if (stepCode === GENERAL_GROUP_KEY) {
		return "Sin paso asignado";
	}
	const step = CERMONT_OPERATIONAL_STEPS.find((item) => item.code === stepCode);
	return step ? `Paso ${step.stepNumber} — ${step.label}` : stepCode;
}

function groupByStep(evidences: LinkedEvidenceSummary[]): Map<string, LinkedEvidenceSummary[]> {
	const groups = new Map<string, LinkedEvidenceSummary[]>();
	for (const evidence of evidences) {
		const key = evidence.stepCode ?? GENERAL_GROUP_KEY;
		const bucket = groups.get(key) ?? [];
		bucket.push(evidence);
		groups.set(key, bucket);
	}
	return groups;
}

function EvidenceThumbnail({ evidence }: { evidence: LinkedEvidenceSummary }) {
	if (evidence.url) {
		return (
			<div className="relative h-24 w-full overflow-hidden rounded-t-[var(--radius-md)]">
				<Image
					src={evidence.url}
					alt={`Evidencia ${TYPE_LABEL[evidence.evidenceType]}: ${evidence.filename}`}
					fill
					unoptimized
					sizes="(max-width: 640px) 50vw, 160px"
					className="object-cover"
				/>
			</div>
		);
	}
	return (
		<div className="flex h-24 w-full items-center justify-center rounded-t-[var(--radius-md)] bg-[var(--surface-secondary)]">
			<Camera className="size-6 text-[var(--text-muted)]" aria-hidden="true" />
		</div>
	);
}

export function EvidenceGallerySection({ evidences }: EvidenceGallerySectionProps) {
	if (evidences.length === 0) {
		return (
			<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
				Sin evidencias capturadas para este caso todavía.
			</div>
		);
	}

	const groups = groupByStep(evidences);

	return (
		<div className="space-y-5">
			{[...groups.entries()].map(([stepCode, items]) => (
				<section key={stepCode} aria-label={groupLabel(stepCode)}>
					<div className="flex items-center justify-between">
						<h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							{groupLabel(stepCode)}
						</h4>
						<span className="text-[11px] font-semibold text-[var(--text-secondary)]">
							{items.length === 1 ? "1 evidencia" : `${items.length} evidencias`}
						</span>
					</div>
					<div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{items.map((evidence) => (
							<figure
								key={evidence.evidenceId}
								className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]"
							>
								<EvidenceThumbnail evidence={evidence} />
								<figcaption className="space-y-1 p-2">
									<div className="flex items-center justify-between gap-1">
										<span
											className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_CLASSES[evidence.evidenceType]}`}
										>
											{TYPE_LABEL[evidence.evidenceType]}
										</span>
										{evidence.hasGps && (
											<MapPin
												className="size-3 text-[var(--color-brand)]"
												aria-label="Con ubicación GPS"
											/>
										)}
									</div>
									<p
										className="truncate text-[10px] text-[var(--text-secondary)]"
										title={evidence.filename}
									>
										{evidence.filename}
									</p>
									{evidence.capturedAt && (
										<p className="text-[9px] text-[var(--text-muted)]">
											{DATE_FORMATTER.format(new Date(evidence.capturedAt))}
										</p>
									)}
								</figcaption>
							</figure>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
