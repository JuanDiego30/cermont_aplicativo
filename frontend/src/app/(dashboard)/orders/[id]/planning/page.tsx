"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { OrderPlanningTab } from "@/orders/ui/detail/OrderPlanningTab";

export default function OrderPlanningPage() {
	const params = useParams();
	const id = params.id as string;

	if (!id) {
		return (
			<div className="flex h-64 items-center justify-center text-slate-500">
				<Loader2 className="mr-2 h-6 w-6 animate-spin" /> Cargando...
			</div>
		);
	}

	return (
		<section className="space-y-4">
			<nav className="flex items-center gap-2 text-sm text-slate-500">
				<a href="/orders" className="hover:text-slate-900 dark:hover:text-white">
					Ordenes
				</a>
				<span>/</span>
				<a href={`/orders/${id}`} className="hover:text-slate-900 dark:hover:text-white">
					Detalle
				</a>
				<span>/</span>
				<span className="text-slate-900 dark:text-white">Planeacion</span>
			</nav>
			<OrderPlanningTab orderId={id} />
		</section>
	);
}
