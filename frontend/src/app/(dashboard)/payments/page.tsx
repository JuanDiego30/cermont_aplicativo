"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { usePaymentsList } from "@/modules/billing/queries";
import {
	paymentRows,
	WorkflowRecordsPage,
	WorkflowRecordsPageLoadingState,
} from "@/modules/billing/ui/WorkflowRecordsPage";

function PaymentsPageContent() {
	const searchParams = useSearchParams();
	const workOrderId = searchParams.get("workOrderId")?.trim() || undefined;
	const query = usePaymentsList(workOrderId ? { workOrderId, limit: 50 } : undefined);

	return (
		<WorkflowRecordsPage
			activeContext={
				workOrderId
					? {
							label: "Work order",
							value: workOrderId,
							clearHref: "/payments",
						}
					: undefined
			}
			eyebrow="Dashboard / Pagos"
			title="Pagos"
			description="Conciliación administrativa de recaudo contra facturas, SES y órdenes de trabajo."
			emptyIcon="payments"
			emptyTitle={workOrderId ? "No payments for this order" : "Sin pagos registrados"}
			emptyDescription={
				workOrderId
					? "The filtered work order does not have reconciled payments yet. Keep bank support and collection follow-up here."
					: "Registra pagos desde facturas aprobadas y adjunta soporte bancario para conciliación."
			}
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

export default function PaymentsPage() {
	return (
		<main>
			<Suspense fallback={<WorkflowRecordsPageLoadingState />}>
				<PaymentsPageContent />
			</Suspense>
		</main>
	);
}
