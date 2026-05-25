"use client";

import { useServiceEntrySheetsList } from "@/modules/billing/queries";
import { sesRows, WorkflowRecordsPage } from "@/modules/billing/ui/WorkflowRecordsPage";

export default function BillingSESPage() {
	const query = useServiceEntrySheetsList();

	return (
		<WorkflowRecordsPage
			eyebrow="Dashboard / Cierre administrativo / SES"
			title="SES / Ariba"
			description="Controla Service Entry Sheets, referencias Ariba, aprobación y soportes antes de facturar."
			emptyTitle="Sin SES registradas"
			emptyDescription="Las SES se crean desde actas firmadas. Adjunta soportes PDF, Excel, Word o fotos para mantener el cierre auditable."
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
