"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { readSearchParam } from "@/lib/utils/search-params";
import { OrderClosureTab } from "@/modules/orders/ui/detail/OrderClosureTab";
import { OrderCostsTab } from "@/modules/orders/ui/detail/OrderCostsTab";
import { OrderDetailHeader } from "@/modules/orders/ui/detail/OrderDetailHeader";
import { OrderDetailsTab } from "@/modules/orders/ui/detail/OrderDetailsTab";
import { OrderDetailTabsNav } from "@/modules/orders/ui/detail/OrderDetailTabsNav";
import { OrderDocumentsTab } from "@/modules/orders/ui/detail/OrderDocumentsTab";
import { OrderEvidencesTab } from "@/modules/orders/ui/detail/OrderEvidencesTab";
import { OrderExecutionTab } from "@/modules/orders/ui/detail/OrderExecutionTab";
import { OrderInspectionsTab } from "@/modules/orders/ui/detail/OrderInspectionsTab";
import { OrderPlanningTab } from "@/modules/orders/ui/detail/OrderPlanningTab";

export default function OrderDetailPage() {
	return (
		<Suspense fallback={<OrderDetailLoading />}>
			<OrderDetailPageInner />
		</Suspense>
	);
}

function OrderDetailLoading() {
	return (
		<section className="space-y-6" aria-labelledby="order-detail-title">
			<div className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
		</section>
	);
}

function OrderDetailPageInner() {
	const params = useParams();
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);

	const id = params.id as string;
	const tab = getSearchParam("tab") || "detalles";

	return (
		<section className="space-y-6" aria-labelledby="order-detail-title">
			<OrderDetailHeader orderId={id} />

			<OrderDetailTabsNav orderId={id} />

			{tab === "detalles" && <OrderDetailsTab orderId={id} />}

			{tab === "planificacion" && <OrderPlanningTab orderId={id} />}

			{tab === "ejecucion" && <OrderExecutionTab orderId={id} />}

			{tab === "costos" && <OrderCostsTab orderId={id} />}

			{tab === "inspecciones" && <OrderInspectionsTab orderId={id} />}

			{tab === "evidencias" && <OrderEvidencesTab orderId={id} />}

			{tab === "documentos" && <OrderDocumentsTab orderId={id} />}

			{tab === "cierre" && <OrderClosureTab orderId={id} />}
		</section>
	);
}
