"use client";

import type { ReportPipelineItem } from "@cermont/shared-types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, FileArchive, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/_shared/lib/utils/csv-export";
import { useDownloadEvidencesZip } from "@/reports/queries";

interface ExportMenuProps {
	items: ReportPipelineItem[];
}

const CSV_COLUMNS = [
	{ header: "Codigo", value: (row: ReportPipelineItem) => row.code },
	{ header: "Activo", value: (row: ReportPipelineItem) => row.assetName },
	{ header: "Tecnico", value: (row: ReportPipelineItem) => row.createdBy },
	{ header: "Estado OT", value: (row: ReportPipelineItem) => row.status },
	{ header: "Creada", value: (row: ReportPipelineItem) => row.createdAt },
	{ header: "Completada", value: (row: ReportPipelineItem) => row.completedAt },
	{ header: "Dias ciclo", value: (row: ReportPipelineItem) => row.daysWaiting },
	{ header: "Estado reporte", value: (row: ReportPipelineItem) => row.reportStatus },
];

export function ExportMenu({ items }: ExportMenuProps) {
	const downloadZip = useDownloadEvidencesZip();

	const handleCsvExport = () => {
		exportToCsv("reportes-aprobacion.csv", CSV_COLUMNS, items);
		toast.success("CSV generado");
	};

	const handleZipExport = async () => {
		try {
			await downloadZip.mutateAsync(items.map((item) => item._id));
			toast.success("ZIP de evidencias generado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo generar el ZIP");
		}
	};

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					Exportar
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					className="z-50 min-w-56 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-2)]"
				>
					<DropdownMenu.Item
						onSelect={handleCsvExport}
						className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none hover:bg-[var(--surface-secondary)]"
					>
						<FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
						CSV de la vista actual
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onSelect={handleZipExport}
						disabled={items.length === 0 || downloadZip.isPending}
						className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none hover:bg-[var(--surface-secondary)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
					>
						<FileArchive className="h-4 w-4" aria-hidden="true" />
						ZIP de evidencias
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
