"use client";

import Link from "next/link";
import { ApiErrorBoundary } from "@/components/common/ApiErrorBoundary";
import { PageSkeleton } from "@/core/ui/PageSkeleton";
import {
	useInvoicesList,
	usePaymentsList,
	useServiceEntrySheetsList,
} from "@/modules/billing/queries";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";

export default function BillingPage() {
	const sesQuery = useServiceEntrySheetsList();
	const invoicesQuery = useInvoicesList();
	const paymentsQuery = usePaymentsList();
	const sesTotal = sesQuery.data?.total ?? 0;
	const invoiceTotal = invoicesQuery.data?.total ?? 0;
	const paymentTotal = paymentsQuery.data?.total ?? 0;
	const pendingInvoices =
		invoicesQuery.data?.items.filter((invoice) => invoice.status !== "paid").length ?? 0;
	const firstError = sesQuery.error ?? invoicesQuery.error ?? paymentsQuery.error;
	const isLoading = sesQuery.isLoading || invoicesQuery.isLoading || paymentsQuery.isLoading;
	if (isLoading) {
		return <PageSkeleton variant="detail" />;
	}
	if (firstError) {
		return (
			<ApiErrorBoundary
				error={firstError instanceof Error ? firstError : new Error("Billing request failed")}
				onRetry={() => {
					void sesQuery.refetch();
					void invoicesQuery.refetch();
					void paymentsQuery.refetch();
				}}
			/>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="billing-title">
			<header>
				<p className="text-sm font-medium text-brand">Dashboard / Cierre administrativo</p>
				<h1 id="billing-title" className="mt-2 text-2xl font-semibold text-foreground">
					Cierre administrativo
				</h1>
				<p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
					Orquesta SES / Ariba, facturas y pagos para cerrar el servicio sin perder trazabilidad con
					actas, informes técnicos y costos.
				</p>
			</header>

			<div className="grid gap-4 md:grid-cols-3">
				<BillingTile href="/billing/ses" title="SES / Ariba" value={sesTotal} description={sesTotal === 0 ? "Se crean desde actas firmadas." : "Registros en seguimiento."} />
				<BillingTile href="/billing/invoices" title="Facturas" value={invoiceTotal} description={invoiceTotal === 0 ? "Se crean desde SES aprobadas." : "Facturas en seguimiento."} />
				<BillingTile href="/payments" title="Pagos" value={paymentTotal} description={paymentTotal === 0 ? "Registra pagos desde facturas aprobadas." : "Pagos registrados."} />
			</div>

			<div className="rounded-lg border border-border bg-card p-5 shadow-card">
				<h2 className="text-base font-semibold text-foreground">Estado del cierre</h2>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					{pendingInvoices > 0
						? `${pendingInvoices} facturas siguen abiertas o pendientes de aprobación.`
						: "No hay facturas abiertas en la consulta actual."}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Link
						href="/delivery-records"
						className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground"
					>
						Revisar actas
					</Link>
					<Link
						href="/costs"
						className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground"
					>
						Ver costos
					</Link>
					<ContextualDocumentUploadModal
						defaultPurpose="closing_evidence"
						defaultStepCode="step_11_ses"
						title="Adjuntar soporte de cierre administrativo"
						description="Radica soportes de acta, SES, factura o pago y asócialos al paso correcto del cierre."
					>
						<button
							type="button"
							className="rounded-md bg-brand-green px-3 py-2 text-sm font-medium text-on-dark"
						>
							Subir soporte
						</button>
					</ContextualDocumentUploadModal>
				</div>
			</div>
		</section>
	);
}

function BillingTile({ href, title, value, description }: { href: string; title: string; value: number; description: string }) {
	return (
		<Link
			href={href}
			className="rounded-lg border border-border bg-card p-5 shadow-card transition-colors hover:bg-surface-secondary"
		>
			<p className="text-sm font-medium text-muted-foreground">{title}</p>
			<p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
			<p className="mt-2 text-xs text-muted-foreground">{description}</p>
		</Link>
	);
}
