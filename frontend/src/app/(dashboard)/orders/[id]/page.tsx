"use client";

import { useParams, useSearchParams } from "next/navigation";
import { OrderBillingTab } from "@/orders/ui/detail/OrderBillingTab";
import { OrderCostsTab } from "@/orders/ui/detail/OrderCostsTab";
import { OrderDetailHeader } from "@/orders/ui/detail/OrderDetailHeader";
import { OrderDetailTabsNav } from "@/orders/ui/detail/OrderDetailTabsNav";
import { OrderExecutionTab } from "@/orders/ui/detail/OrderExecutionTab";
import { OrderPlanningTab } from "@/orders/ui/detail/OrderPlanningTab";
import { OrderProposalTab } from "@/orders/ui/detail/OrderProposalTab";
import { OrderReportTab } from "@/orders/ui/detail/OrderReportTab";

const TAB_REDIRECTS: Record<string, string> = {
	detalles: "propuesta",
	planificacion: "planeacion",
	cierre: "informe",
	documentos: "informe",
	evidencias: "informe",
	inspecciones: "ejecucion",
};

export default function OrderDetailPage() {
	const params = useParams();
	const searchParams = useSearchParams();

	const id = params.id as string;
	const tabParam = searchParams.get("tab") || "propuesta";
	const tab = TAB_REDIRECTS[tabParam] ?? tabParam;

	return (
		<section className="space-y-6" aria-labelledby="order-detail-title">
			<OrderDetailHeader orderId={id} />

			<OrderDetailTabsNav />

			{/* New 6-tab FSM layout */}
			{tab === "propuesta" && <OrderProposalTab orderId={id} />}

			{tab === "planeacion" && <OrderPlanningTab orderId={id} />}

			{tab === "ejecucion" && <OrderExecutionTab orderId={id} />}

			{tab === "informe" && <OrderReportTab orderId={id} />}

			{tab === "facturacion" && <OrderBillingTab orderId={id} />}

			{tab === "costos" && <OrderCostsTab orderId={id} />}
		</section>
	);
}
