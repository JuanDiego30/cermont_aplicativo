"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useInvoicesList } from "@/modules/billing/queries";
import {
	invoiceRows,
	WorkflowRecordsPage,
	WorkflowRecordsPageLoadingState,
} from "@/modules/billing/ui/WorkflowRecordsPage";

function BillingInvoicesPageContent() {
	const searchParams = useSearchParams();
	const workOrderId = searchParams.get("workOrderId")?.trim() || undefined;
	const query = useInvoicesList(workOrderId ? { workOrderId, limit: 50 } : undefined);

	return (
		<WorkflowRecordsPage
			activeContext={
				workOrderId
					? {
							label: "Work order",
							value: workOrderId,
							clearHref: "/billing/invoices",
						}
					: undefined
			}
			eyebrow="Dashboard / Cierre administrativo / Facturas"
			title="Facturas"
			description="Seguimiento de facturación emitida, aceptación del cliente, vencimiento y saldo pendiente."
			emptyIcon="invoices"
			emptyTitle={workOrderId ? "No invoices for this order" : "Sin facturas registradas"}
			emptyDescription={
				workOrderId
					? "The filtered work order does not have invoices yet. Review SES approval or keep the issued support here."
					: "Las facturas se crean desde SES aprobadas y conservan relación con orden, acta, costos y pago."
			}
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

export default function BillingInvoicesPage() {
	return (
		<main>
			<Suspense fallback={<WorkflowRecordsPageLoadingState />}>
				<BillingInvoicesPageContent />
			</Suspense>
		</main>
	);
}
