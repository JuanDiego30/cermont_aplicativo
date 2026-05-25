"use client";

import Link from "next/link";
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

	return (
		<section className="space-y-6" aria-labelledby="billing-title">
			<header>
				<p className="text-sm font-medium text-[var(--color-brand)]">
					Dashboard / Cierre administrativo
				</p>
				<h1 id="billing-title" className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
					Cierre administrativo
				</h1>
				<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
					Orquesta SES / Ariba, facturas y pagos para cerrar el servicio sin perder trazabilidad con
					actas, informes técnicos y costos.
				</p>
			</header>

			<div className="grid gap-4 md:grid-cols-3">
				<BillingTile href="/billing/ses" title="SES / Ariba" value={sesTotal} />
				<BillingTile href="/billing/invoices" title="Facturas" value={invoiceTotal} />
				<BillingTile href="/payments" title="Pagos" value={paymentTotal} />
			</div>

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card">
				<h2 className="text-base font-semibold text-[var(--text-primary)]">Estado del cierre</h2>
				<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
					{pendingInvoices > 0
						? `${pendingInvoices} facturas siguen abiertas o pendientes de aprobación.`
						: "No hay facturas abiertas en la consulta actual."}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Link
						href="/delivery-records"
						className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						Revisar actas
					</Link>
					<Link
						href="/costs"
						className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						Ver costos
					</Link>
					<ContextualDocumentUploadModal
						defaultPurpose="closing_evidence"
						defaultStepCode="step_10_ses_submission"
						title="Adjuntar soporte de cierre administrativo"
						description="Radica soportes de acta, SES, factura o pago y asócialos al paso correcto del cierre."
					>
						<button
							type="button"
							className="rounded-[var(--radius-md)] bg-[var(--color-brand)] px-3 py-2 text-sm font-medium text-white"
						>
							Subir soporte
						</button>
					</ContextualDocumentUploadModal>
				</div>
			</div>
		</section>
	);
}

function BillingTile({ href, title, value }: { href: string; title: string; value: number }) {
	return (
		<Link
			href={href}
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card transition-colors hover:bg-[var(--surface-secondary)]"
		>
			<p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
			<p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
		</Link>
	);
}
