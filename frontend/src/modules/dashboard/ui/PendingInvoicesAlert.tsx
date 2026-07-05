import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Props {
	count: number;
	totalAmount: number;
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function PendingInvoicesAlert({ count, totalAmount }: Props) {
	if (count === 0) {
		return null;
	}

	return (
		<Link
			href="/billing/invoices"
			className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-amber-400 bg-amber-50 p-4 hover:bg-amber-100 transition"
		>
			<AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-amber-800">
					{count} factura{count !== 1 ? "s" : ""} pendiente{count !== 1 ? "s" : ""}
				</p>
				<p className="text-xs text-amber-700">{COP.format(totalAmount)} por facturar o vencer</p>
			</div>
		</Link>
	);
}
