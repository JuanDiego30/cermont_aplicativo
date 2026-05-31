"use client";

import { useSearchParams } from "next/navigation";
import { useDeliveryRecordsList } from "@/modules/billing/queries";
import { deliveryRows, WorkflowRecordsPage } from "@/modules/billing/ui/WorkflowRecordsPage";

export default function DeliveryRecordsPage() {
	const searchParams = useSearchParams();
	const workOrderId = searchParams.get("workOrderId")?.trim() || undefined;
	const query = useDeliveryRecordsList(workOrderId ? { workOrderId, limit: 50 } : undefined);

	return (
		<WorkflowRecordsPage
			activeContext={
				workOrderId
					? {
							label: "Work order",
							value: workOrderId,
							clearHref: "/delivery-records",
						}
					: undefined
			}
			eyebrow="Dashboard / Actas"
			title="Actas de entrega"
			description="Cierre operativo posterior al informe técnico aprobado, con firma del cliente y soporte documental."
			emptyTitle={workOrderId ? "No delivery records for this order" : "Sin actas de entrega"}
			emptyDescription={
				workOrderId
					? "No delivery records are linked to the filtered work order yet. Review the technical report or attach the signed support to keep traceability intact."
					: "Cuando un informe técnico se apruebe, crea el acta desde el endpoint de informes y adjunta el documento firmado."
			}
			query={query}
			rows={deliveryRows}
			primaryLinks={[
				{ href: "/reports", label: "Informes técnicos" },
				{ href: "/documents", label: "Documentos" },
				{ href: "/billing/ses", label: "SES / Ariba" },
			]}
		/>
	);
}
