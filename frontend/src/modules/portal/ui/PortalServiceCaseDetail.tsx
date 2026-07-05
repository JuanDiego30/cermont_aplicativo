import Link from "next/link";

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
				{documents.length === 0 ? (
					<p className="mt-2 text-sm text-[var(--text-tertiary)]">No hay documentos disponibles</p>
				) : (
					<ul className="mt-2 space-y-1">
						{documents.map((doc) => (
							<li key={doc.name}>
								<Link
									href={doc.url}
									className="text-sm text-[var(--color-brand-blue)] hover:underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									{doc.name}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
