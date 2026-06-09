"use client";

import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useApproveInvoice, useInvoice } from "@/modules/billing/queries";

export default function ApproveInvoicePage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<ApproveInvoiceInner />
		</Suspense>
	);
}

function ApproveInvoiceInner() {
	const params = useParams();
	const router = useRouter();
	const id = (params.id as string) ?? "";

	const { data: envelope, isLoading, isError } = useInvoice(id);
	const invoice = envelope?.data;

	const approveMutation = useApproveInvoice(id);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<Loader2 className="size-8 animate-spin text-brand" />
			</div>
		);
	}

	if (isError || !invoice) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-destructive">No se pudo cargar la factura</h1>
				<Link
					href="/billing/invoices"
					className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
				>
					Volver a facturas
				</Link>
			</div>
		);
	}

	function handleApprove() {
		approveMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Factura aprobada correctamente");
				router.push(`/billing/invoices/${id}`);
			},
			onError: (err) => {
				toast.error("Error al aprobar la factura", { description: err.message });
			},
		});
	}

	const currencyFmt = new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: invoice.currency ?? "COP",
		maximumFractionDigits: 0,
	});

	return (
		<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
			<Link
				href={`/billing/invoices/${id}`}
				className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Volver a la factura
			</Link>

			<h1 className="mb-6 text-2xl font-semibold text-foreground">Aprobar factura</h1>

			<div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Numero</span>
						<span className="font-mono text-sm font-medium text-foreground">
							{invoice.invoiceNumber ?? invoice.code}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Total</span>
						<span className="text-sm font-semibold text-foreground">
							{currencyFmt.format(invoice.totalAmount ?? invoice.amount ?? 0)}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Estado actual</span>
						<span className="rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
							{invoice.status}
						</span>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-success/20 bg-success/5 p-5">
				<h2 className="text-sm font-semibold text-success">Confirmar aprobacion</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Al aprobar esta factura quedara registrada como aprobada y podra avanzar al siguiente paso
					del flujo de facturacion.
				</p>
				<div className="mt-4">
					<Button
						onClick={handleApprove}
						loading={approveMutation.isPending}
						className="bg-success text-white hover:bg-success/90"
					>
						<CheckCircle2 className="size-4" />
						Aprobar factura
					</Button>
				</div>
			</div>
		</div>
	);
}
