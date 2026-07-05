"use client";

import { use } from "react";
import { DigitalSignaturePad } from "@/modules/reports/ui/DigitalSignaturePad";
import { PDFExportButton } from "@/modules/reports/ui/PDFExportButton";
import { ReportReviewPanel } from "@/modules/reports/ui/ReportReviewPanel";

interface Props {
	params: Promise<{ id: string }>;
}

export default function ReportSignPage({ params }: Props) {
	const { id } = use(params);

	return (
		<div className="space-y-8 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Firma del Informe</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">Informe #{id.slice(-8)}</p>
			</div>

			<DigitalSignaturePad
				signerName="Técnico responsable"
				title="Firma del técnico"
				onSign={(dataUrl) => console.log("Signature:", dataUrl)}
			/>

			<DigitalSignaturePad
				signerName="Cliente"
				title="Firma del cliente"
				onSign={(dataUrl) => console.log("Signature:", dataUrl)}
			/>

			<ReportReviewPanel
				onApprove={() => {}}
				onReject={(reason) => console.log("Rejected:", reason)}
			/>

			<div className="flex justify-end">
				<PDFExportButton reportId={id} />
			</div>
		</div>
	);
}
