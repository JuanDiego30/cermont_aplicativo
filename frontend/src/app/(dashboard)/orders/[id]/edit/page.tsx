"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EditOrderForm } from "@/modules/orders/ui/EditOrderForm";

export default function EditOrderPage() {
	const params = useParams();
	const id = params.id as string;

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="edit-order-title">
			<div className="flex items-center gap-3">
				<Link
					href={`/orders/${id}`}
					className="flex items-center gap-1 text-sm text-steel dark:text-steel hover:text-charcoal"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<h1 id="edit-order-title" className="text-2xl font-semibold text-ink dark:text-white">
					Editar Orden de Trabajo
				</h1>
			</div>

			<EditOrderForm orderId={id} />
		</section>
	);
}
