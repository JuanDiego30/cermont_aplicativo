"use client";

import type { OrderListQuery } from "@cermont/shared-types";
import { Download } from "lucide-react";
import { buildOrdersExportUrl } from "@/orders/queries";

interface OrderExportButtonProps {
	filters: Partial<OrderListQuery>;
}

export function OrderExportButton({ filters }: OrderExportButtonProps) {
	return (
		<div className="grid min-w-0 grid-cols-2 gap-2">
			<a
				href={buildOrdersExportUrl(filters, "csv")}
				className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				CSV
			</a>
			<a
				href={buildOrdersExportUrl(filters, "pdf")}
				className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
			>
				PDF
			</a>
		</div>
	);
}
