import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateOrderForm } from "@/orders/ui/CreateOrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-order-title">
			<div className="flex items-center gap-3">
				<Link
					href="/orders"
					className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700"
				>
					<ArrowLeft aria-hidden="true" className="h-4 w-4" />
					Volver
				</Link>
				<h1 id="new-order-title" className="text-2xl font-bold text-slate-900 dark:text-white">
					Nueva Orden de Trabajo
				</h1>
			</div>

			<CreateOrderForm />
		</section>
	);
}
