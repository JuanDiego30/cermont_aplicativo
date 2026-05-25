"use client";

import { useInvoicesList } from "@/modules/billing/queries";
import { invoiceRows, WorkflowRecordsPage } from "@/modules/billing/ui/WorkflowRecordsPage";

export default function BillingInvoicesPage() {
	const query = useInvoicesList();

	return (
		<WorkflowRecordsPage
			eyebrow="Dashboard / Cierre administrativo / Facturas"
			title="Facturas"
			description="Seguimiento de facturación emitida, aceptación del cliente, vencimiento y saldo pendiente."
			emptyTitle="Sin facturas registradas"
			emptyDescription="Las facturas se crean desde SES aprobadas y conservan relación con orden, acta, costos y pago."
			query={query}
			rows={invoiceRows}
			primaryLinks={[
				{ href: "/billing/ses", label: "SES / Ariba" },
				{ href: "/payments", label: "Pagos" },
				{ href: "/documents", label: "Soportes" },
			]}
		/>
	);
}
