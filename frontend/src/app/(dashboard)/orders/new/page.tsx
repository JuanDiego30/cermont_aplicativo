import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateOrderForm } from "@/modules/orders/ui/CreateOrderForm";

export default async function NewOrderPage() {
	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-order-title">
			<div className="flex items-center gap-3">
				<Link
					href="/orders"
					className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<h1 id="new-order-title" className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Nueva Orden de Trabajo
				</h1>
			</div>

			<CreateOrderForm />
		</section>
	);
}
