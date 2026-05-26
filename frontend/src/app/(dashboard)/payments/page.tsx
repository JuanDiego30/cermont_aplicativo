"use client";

import { usePaymentsList } from "@/modules/billing/queries";
import { paymentRows, WorkflowRecordsPage } from "@/modules/billing/ui/WorkflowRecordsPage";

export default function PaymentsPage() {
	const query = usePaymentsList();

	return (
		<WorkflowRecordsPage
			eyebrow="Dashboard / Pagos"
			title="Pagos"
			description="Conciliación administrativa de recaudo contra facturas, SES y órdenes de trabajo."
			emptyTitle="Sin pagos registrados"
			emptyDescription="Registra pagos desde facturas aprobadas y adjunta soporte bancario para conciliación."
			query={query}
			rows={paymentRows}
			primaryLinks={[
				{ href: "/billing/invoices", label: "Facturas" },
				{ href: "/costs", label: "Costos" },
				{ href: "/documents", label: "Soportes" },
			]}
		/>
	);
}
