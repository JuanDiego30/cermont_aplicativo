"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";

const EXCEL_MIME_TYPES = new Set([
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-excel",
]);
const MAX_EXCEL_SIZE = 10 * 1024 * 1024;
const XLSX_ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const;
const XLS_OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;

export type ExcelValidationResult = "valid" | "invalid-format" | "too-large";

function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
	return signature.every((byte, index) => bytes[index] === byte);
}

async function hasExcelSignature(file: File): Promise<boolean> {
	const bytes = new Uint8Array(await file.slice(0, XLS_OLE_SIGNATURE.length).arrayBuffer());
	const signature = file.name.toLowerCase().endsWith(".xlsx")
		? XLSX_ZIP_SIGNATURE
		: XLS_OLE_SIGNATURE;
	return matchesSignature(bytes, signature);
}

export async function validateExcelFile(file: File): Promise<ExcelValidationResult> {
	const hasExcelExtension = /\.(xlsx|xls)$/i.test(file.name);
	const hasExcelMime = EXCEL_MIME_TYPES.has(file.type);
	if (!hasExcelExtension || !hasExcelMime) {
		return "invalid-format";
	}
	if (file.size > MAX_EXCEL_SIZE) {
		return "too-large";
	}
	return (await hasExcelSignature(file)) ? "valid" : "invalid-format";
}

export function ExcelUploadCard() {
	const [selectedFile, setSelectedFile] = useState<File | false>(false);

	async function selectFile(file: File): Promise<void> {
		const result = await validateExcelFile(file);
		if (result === "invalid-format") {
			setSelectedFile(false);
			toast.error("Formato no soportado. Sube un archivo .xlsx o .xls");
			return;
		}
		if (result === "too-large") {
			setSelectedFile(false);
			toast.error("El archivo excede el tamaño máximo de 10 MB");
			return;
		}
		setSelectedFile(file);
		toast.success("Archivo Excel validado");
	}

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-card">
			<div className="flex gap-3">
				<FileSpreadsheet className="mt-0.5 size-5 text-[var(--color-brand)]" aria-hidden="true" />
				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">
						Subir Excel de recursos
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Valida archivos .xlsx o .xls de hasta 10 MB antes de asociarlos a la planeación.
					</p>
					<label className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--color-brand)] focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)]">
						Seleccionar Excel
						<input
							type="file"
							accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
							className="sr-only"
				onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) {
									void selectFile(file);
								}
								event.target.value = "";
							}}
						/>
					</label>
					{selectedFile ? (
						<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
							<span className="break-all">{selectedFile.name}</span>
							<button
								type="button"
								className="min-h-11 px-2 font-semibold text-[var(--color-danger)]"
								onClick={() => setSelectedFile(false)}
							>
								Remover
							</button>
							<ContextualDocumentUploadModal
								defaultPurpose="template_source"
								defaultStepCode="step_05_planning"
								title="Subir Excel de recursos"
								description={`Archivo validado: ${selectedFile.name}. Selecciónalo para completar su asociación.`}
							>
								<Button type="button" size="sm">
									Continuar carga
								</Button>
							</ContextualDocumentUploadModal>
						</div>
					) : null}
				</div>
			</div>
		</article>
	);
}
