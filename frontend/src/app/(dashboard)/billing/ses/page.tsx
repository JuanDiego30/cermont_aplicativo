"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useServiceEntrySheetsList } from "@/modules/billing/queries";
import {
	sesRows,
	WorkflowRecordsPage,
	WorkflowRecordsPageLoadingState,
} from "@/modules/billing/ui/WorkflowRecordsPage";

function BillingSESPageContent() {
	const searchParams = useSearchParams();
	const workOrderId = searchParams.get("workOrderId")?.trim() || undefined;
	const query = useServiceEntrySheetsList(workOrderId ? { workOrderId, limit: 50 } : undefined);

	return (
		<WorkflowRecordsPage
			activeContext={
				workOrderId
					? {
							label: "Work order",
							value: workOrderId,
							clearHref: "/billing/ses",
						}
					: undefined
			}
			eyebrow="Dashboard / Cierre administrativo / SES"
			title="SES / Ariba"
			description="Controla Service Entry Sheets, referencias Ariba, aprobación y soportes antes de facturar."
			emptyTitle={workOrderId ? "No SES for this order" : "Sin SES registradas"}
			emptyDescription={
				workOrderId
					? "This work order does not have linked SES records yet. Use the order filter for traceability or attach external filing and approval support."
					: "Las SES se crean desde actas firmadas. Adjunta soportes PDF, Excel, Word o fotos para mantener el cierre auditable."
			}
			query={query}
			rows={sesRows}
			primaryLinks={[
				{ href: "/delivery-records", label: "Actas" },
				{ href: "/billing/invoices", label: "Facturas" },
				{ href: "/documents", label: "Soportes" },
			]}
		/>
	);
}

export default function BillingSESPage() {
	return (
		<Suspense fallback={<WorkflowRecordsPageLoadingState />}>
			<BillingSESPageContent />
		</Suspense>
	);
}
