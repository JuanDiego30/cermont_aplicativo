import { CalendarDays, CreditCard } from "lucide-react";
import type { PipelineStage } from "../api/invoice.api";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
});

interface PaymentRecordCardProps {
	payment: PipelineStage;
}

export function PaymentRecordCard({ payment }: PaymentRecordCardProps) {
	const hasPayment = payment.status !== "not_created" && payment.amount > 0;

	return (
		<article
			aria-labelledby="payment-record-title"
			data-testid="payment-record-card"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<span className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--color-brand)]">
						<CreditCard className="size-5" aria-hidden="true" />
					</span>
					<div>
						<h2
							id="payment-record-title"
							className="text-base font-semibold text-[var(--text-primary)]"
						>
							Registro de pago
						</h2>
						<p className="text-xs text-[var(--text-secondary)]">
							{hasPayment ? (payment.code ?? "Referencia no informada") : "Aún no registrado"}
						</p>
					</div>
				</div>
				<InvoiceStatusBadge status={payment.status} />
			</div>

			{hasPayment ? (
				<div className="mt-5 grid gap-4 sm:grid-cols-2">
					<div>
						<p className="text-xs text-[var(--text-tertiary)]">Monto</p>
						<p className="mt-1 font-mono text-lg font-semibold text-[var(--text-primary)]">
							{COP_FORMATTER.format(payment.amount)}
						</p>
					</div>
					<div>
						<p className="text-xs text-[var(--text-tertiary)]">Fecha</p>
						<p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-primary)]">
							<CalendarDays className="size-4 text-[var(--text-tertiary)]" aria-hidden="true" />
							{payment.createdAt
								? DATE_FORMATTER.format(new Date(payment.createdAt))
								: "No informada"}
						</p>
					</div>
				</div>
			) : (
				<p className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-4 text-sm text-[var(--text-secondary)]">
					El pago aparecerá aquí cuando la factura aprobada sea conciliada.
				</p>
			)}
		</article>
	);
}
