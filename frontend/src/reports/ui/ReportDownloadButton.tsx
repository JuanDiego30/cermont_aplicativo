"use client";

import { Download } from "lucide-react";
import { useDownloadReportPdf } from "..";

interface ReportDownloadButtonProps {
	orderId: string;
	label?: string;
	className?: string;
}

export function ReportDownloadButton({
	orderId,
	label = "Descargar informe",
	className = "",
}: ReportDownloadButtonProps) {
	const downloadReport = useDownloadReportPdf();

	return (
		<button
			type="button"
			onClick={() => downloadReport.mutate(orderId)}
			disabled={downloadReport.isPending}
			className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
		>
			<Download className="h-4 w-4" aria-hidden="true" />
			{downloadReport.isPending ? "Descargando..." : label}
		</button>
	);
}
