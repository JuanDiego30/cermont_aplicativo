"use client";

import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useApproveServiceEntrySheet, useServiceEntrySheet } from "@/modules/billing/queries";

export default function ApproveSESPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<ApproveSESInner />
		</Suspense>
	);
}

function ApproveSESInner() {
	const params = useParams();
	const router = useRouter();
	const id = (params.id as string) ?? "";

	const { data: envelope, isLoading, isError } = useServiceEntrySheet(id);
	const ses = envelope?.data;

	const approveMutation = useApproveServiceEntrySheet(id);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<Loader2 className="size-8 animate-spin text-brand" />
			</div>
		);
	}

	if (isError || !ses) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-destructive">No se pudo cargar el SES</h1>
				<Link
					href="/billing/ses"
					className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
				>
					Volver a SES
				</Link>
			</div>
		);
	}

	function handleApprove() {
		approveMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("SES aprobado correctamente");
				router.push(`/billing/ses/${id}`);
			},
			onError: (err) => {
				toast.error("Error al aprobar el SES", { description: err.message });
			},
		});
	}

	const currencyFmt = new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: ses.currency ?? "COP",
		maximumFractionDigits: 0,
	});

	return (
		<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
			<Link
				href={`/billing/ses/${id}`}
				className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Volver al SES
			</Link>

			<h1 className="mb-6 text-2xl font-semibold text-foreground">Aprobar SES</h1>

			<div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Codigo</span>
						<span className="font-mono text-sm font-medium text-foreground">{ses.code}</span>
					</div>
					{ses.aribaDocumentNumber && (
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Referencia Ariba</span>
							<span className="text-sm text-foreground">{ses.aribaDocumentNumber}</span>
						</div>
					)}
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Total</span>
						<span className="text-sm font-semibold text-foreground">
							{currencyFmt.format(ses.totalAmount ?? ses.amount ?? 0)}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Estado actual</span>
						<span className="rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
							{ses.status}
						</span>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-success/20 bg-success/5 p-5">
				<h2 className="text-sm font-semibold text-success">Confirmar aprobacion</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Al aprobar este SES quedara registrado como aprobado y podra avanzar al siguiente paso del
					flujo de facturacion.
				</p>
				<div className="mt-4">
					<Button
						onClick={handleApprove}
						loading={approveMutation.isPending}
						className="bg-success text-white hover:bg-success/90"
					>
						<CheckCircle2 className="size-4" />
						Aprobar SES
					</Button>
				</div>
			</div>
		</div>
	);
}
