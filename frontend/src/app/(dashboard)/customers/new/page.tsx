"use client";

/**
 * /customers/new — Alta de cliente.
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateCustomer } from "@/modules/customers/queries";
import { CustomerForm } from "@/modules/customers/ui/CustomerForm";

export default function NewCustomerPage() {
	const router = useRouter();
	const createMutation = useCreateCustomer();
	const [submitError, setSubmitError] = useState("");

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="new-customer-title">
			<Link
				href="/customers"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a clientes
			</Link>

			<h1 id="new-customer-title" className="text-xl font-semibold text-[var(--text-primary)]">
				Nuevo cliente
			</h1>

			{submitError && (
				<p
					className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]"
					role="alert"
				>
					{submitError}
				</p>
			)}

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
				<CustomerForm
					isSaving={createMutation.isPending}
					onSubmit={async (input) => {
						setSubmitError("");
						try {
							const created = await createMutation.mutateAsync(input);
							router.push(`/customers/${created._id}`);
						} catch (error) {
							setSubmitError(
								error instanceof Error ? error.message : "No se pudo crear el cliente.",
							);
						}
					}}
					onCancel={() => router.push("/customers")}
				/>
			</div>
		</section>
	);
}
