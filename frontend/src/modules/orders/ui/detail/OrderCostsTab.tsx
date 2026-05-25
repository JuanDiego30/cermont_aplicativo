"use client";

import { CostPanel } from "@/modules/costs";
import { useOrder } from "@/modules/orders/queries";

interface OrderCostsTabProps {
	orderId: string;
}

export function OrderCostsTab({ orderId }: OrderCostsTabProps) {
	const { data: order } = useOrder(orderId);

	return (
		<section aria-label="Costos de la orden" className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold text-zinc-950 dark:text-white">Costos</h2>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Registra costos reales, revisa el resumen y controla la variación antes del cierre.
				</p>
			</div>

			<CostPanel
				orderId={orderId}
				readOnly={order?.status === "closed" || order?.status === "cancelled"}
			/>
		</section>
	);
}
