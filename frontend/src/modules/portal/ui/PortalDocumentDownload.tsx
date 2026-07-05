import { FileDown } from "lucide-react";

interface Document {
	name: string;
	url: string;
}

interface Props {
	documents: Document[];
}

export function PortalDocumentDownload({ documents }: Props) {
	if (documents.length === 0) {
		return <p className="text-sm text-[var(--text-tertiary)]">Sin documentos para descargar</p>;
	}

	return (
		<div className="space-y-2">
			{documents.map((doc) => (
				<a
					key={doc.name}
					href={doc.url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-3 rounded-lg border border-[var(--border-medium)] px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition"
				>
					<FileDown className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
					{doc.name}
				</a>
			))}
		</div>
	);
}
