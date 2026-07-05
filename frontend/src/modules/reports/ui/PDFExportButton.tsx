import { FileDown } from "lucide-react";

interface Props {
	reportId: string;
	label?: string;
}

export function PDFExportButton({ reportId, label = "Exportar PDF" }: Props) {
	return (
		<a
			href={`/api/reports/${encodeURIComponent(reportId)}/download`}
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition"
		>
			<FileDown className="size-4" aria-hidden="true" />
			{label}
		</a>
	);
}
