import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";

/**
 * DashboardEmpty — Empty state when no dashboard data is available
 *
 * Shows an illustration icon, descriptive text, and a CTA link to create an order.
 */
export function DashboardEmpty() {
	return (
		<section
			className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 py-14 text-center"
			aria-label="No hay datos disponibles"
		>
			<div className="flex size-14 items-center justify-center rounded-full bg-surface text-slate">
				<BarChart3 className="size-6" aria-hidden="true" />
			</div>
			<div className="space-y-2">
				<h2 className="text-base font-semibold text-ink [text-wrap:balance]">
					No hay datos disponibles
				</h2>
				<p className="mx-auto max-w-md text-sm text-charcoal">
					Aún no se han registrado órdenes o actividades en el período
					seleccionado.
				</p>
			</div>
			<Link href="/orders/new">
				<Button size="sm" variant="primary">
					Ir a crear una orden
				</Button>
			</Link>
		</section>
	);
}
