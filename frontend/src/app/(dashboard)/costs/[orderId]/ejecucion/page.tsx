"use client";

import { useParams } from "next/navigation";
import { CostPanel } from "@/modules/costs";

export default function ExecutionCostsPage() {
	const params = useParams<{ orderId: string }>();
	const orderId = params?.orderId ?? "";

	return (
		<section className="space-y-6" aria-labelledby="execution-costs-title">
			<header className="space-y-2">
				<p className="text-sm text-steel dark:text-steel">Dashboard / Costos</p>
				<h1 id="execution-costs-title" className="text-3xl font-semibold text-ink dark:text-white">
					Costos de la orden {orderId}
				</h1>
				<p className="text-sm text-steel dark:text-steel">
					Resumen, desglose y registro de costos reales contra la estimación.
				</p>
			</header>

			<CostPanel orderId={orderId} />
		</section>
	);
}
