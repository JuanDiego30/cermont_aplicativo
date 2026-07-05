"use client";

interface ReportSection {
	id: string;
	title: string;
	content: string;
	editable: boolean;
}

interface Props {
	serviceCaseCode: string;
	clientName: string;
	sections: ReportSection[];
	onRegenerate: () => void;
	onApprove: () => void;
	onUpdateSection: (id: string, content: string) => void;
	isLoading: boolean;
}

export function TechnicalReportDraftPage({
	serviceCaseCode,
	clientName,
	sections,
	onRegenerate,
	onApprove,
	onUpdateSection,
	isLoading,
}: Props) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				{["a", "b", "c", "d", "e"].map((id) => (
					<div
						key={`skeleton-report-draft-${id}`}
						className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-secondary)]"
					/>
				))}
			</div>
		);
	}

	if (sections.length === 0) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center p-6">
				<p className="text-sm text-[var(--text-secondary)]">
					No hay datos suficientes para generar un borrador automático
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 md:p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Informe Técnico</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{serviceCaseCode} · {clientName}
					</p>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={onRegenerate}
						className="rounded-full border border-[var(--border-medium)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
					>
						Regenerar desde datos
					</button>
					<button
						type="button"
						onClick={onApprove}
						className="rounded-full bg-[var(--color-brand-blue)] px-6 py-2 text-sm font-semibold text-white"
					>
						Aprobar y generar PDF
					</button>
				</div>
			</div>

			{sections.map((section) => (
				<section
					key={section.id}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
				>
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
						{section.title}
					</h2>
					{section.editable ? (
						<textarea
							value={section.content}
							onChange={(e) => onUpdateSection(section.id, e.target.value)}
							rows={4}
							aria-label={`Contenido de la sección ${section.title}`}
							className="mt-3 w-full rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-primary)]"
						/>
					) : (
						<p className="mt-3 text-sm leading-relaxed text-[var(--text-primary)]">
							{section.content}
						</p>
					)}
				</section>
			))}
		</div>
	);
}
