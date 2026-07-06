import { PortalDocumentDownload } from "./PortalDocumentDownload";

interface Props {
	code: string;
	status: string;
	description: string;
	documents: Array<{ name: string; url: string }>;
}

export function PortalServiceCaseDetail({ code, status, description, documents }: Props) {
	return (
		<div className="space-y-6">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<h2 className="text-sm font-semibold text-[var(--text-secondary)]">Estado actual</h2>
				<p className="font-mono text-xs text-[var(--text-tertiary)]">{code}</p>
				<span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
					{status}
				</span>
				<p className="mt-3 text-sm text-[var(--text-primary)]">{description}</p>
			</div>

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<h2 className="text-sm font-semibold text-[var(--text-secondary)]">
					Documentos disponibles
				</h2>
				<div className="mt-2">
					<PortalDocumentDownload documents={documents} />
				</div>
			</div>
		</div>
	);
}
