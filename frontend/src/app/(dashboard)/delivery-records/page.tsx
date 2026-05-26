"use client";

import { useDeliveryRecordsList } from "@/modules/billing/queries";
import { deliveryRows, WorkflowRecordsPage } from "@/modules/billing/ui/WorkflowRecordsPage";

export default function DeliveryRecordsPage() {
	const query = useDeliveryRecordsList();

	return (
		<WorkflowRecordsPage
			eyebrow="Dashboard / Actas"
			title="Actas de entrega"
			description="Cierre operativo posterior al informe técnico aprobado, con firma del cliente y soporte documental."
			emptyTitle="Sin actas de entrega"
			emptyDescription="Cuando un informe técnico se apruebe, crea el acta desde el endpoint de informes y adjunta el documento firmado."
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
