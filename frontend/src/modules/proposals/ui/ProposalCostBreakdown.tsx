"use client";

import type { ProposalCostBreakdown as ProposalCostBreakdownType } from "@cermont/shared-types";
import { Download, FileText, Table } from "lucide-react";
import { useState } from "react";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

type Props = {
	readonly proposalId: string;
	readonly breakdown: ProposalCostBreakdownType;
	readonly accessToken: string;
};

export function ProposalCostBreakdown({ proposalId, breakdown, accessToken }: Props) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExportPdf = async () => {
		setIsExporting(true);
		try {
			const response = await fetch(`/api/backend/proposals/${proposalId}/pdf`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!response.ok) {
				throw new Error("Error al generar PDF");
			}
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${breakdown.proposalCode}-costos.pdf`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			// Error al exportar PDF - ya registrado
		} finally {
			setIsExporting(false);
		}
	};

	if (breakdown.items.length === 0) {
		return (
			<div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]">
				<div className="flex items-center gap-2">
					<Table className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">
						Desglose de costos
					</h2>
				</div>
				<p className="mt-4 text-sm text-[var(--text-muted)]">
					Esta propuesta no tiene ítems de costo registrados.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-2)]">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<FileText className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h2 className="text-sm font-semibold text-[var(--text-primary)]">
						Desglose de costos
					</h2>
				</div>
				<button
					type="button"
					onClick={handleExportPdf}
					disabled={isExporting}
					className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-default)] px-4 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] disabled:opacity-50"
					aria-label="Exportar PDF de costos"
				>
					<Download className={`size-4 ${isExporting ? "animate-pulse" : ""}`} aria-hidden="true" />
					{isExporting ? "Generando PDF..." : "Exportar PDF"}
				</button>
			</div>

			{/* Desktop table */}
			<div className="hidden overflow-x-auto md:block">
				<table className="min-w-full text-left text-sm">
					<thead className="bg-[var(--surface-secondary)] text-xs uppercase text-[var(--text-tertiary)]">
						<tr>
							<th className="px-4 py-3 font-semibold">Descripción</th>
							<th className="px-4 py-3 font-semibold">Unidad</th>
							<th className="px-4 py-3 font-semibold text-right">Cantidad</th>
							<th className="px-4 py-3 font-semibold text-right">Precio unitario</th>
							<th className="px-4 py-3 font-semibold text-right">Total</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]">
						{breakdown.items.map((item) => (
							<tr key={`${item.description}-${item.unit}`}>
								<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
									{item.description}
								</td>
								<td className="px-4 py-3 text-[var(--text-secondary)]">{item.unit}</td>
								<td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
									{item.quantity}
								</td>
								<td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
									{formatCOP(item.unitPrice)}
								</td>
								<td className="px-4 py-3 text-right tabular-nums font-semibold text-[var(--text-primary)]">
									{formatCOP(item.total)}
								</td>
							</tr>
						))}
					</tbody>
					<tfoot className="border-t-2 border-[var(--border-default)] text-sm">
						<tr>
							<td colSpan={4} className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">
								Subtotal
							</td>
							<td className="px-4 py-3 text-right tabular-nums font-semibold text-[var(--text-primary)]">
								{formatCOP(breakdown.subtotal)}
							</td>
						</tr>
						<tr>
							<td colSpan={4} className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">
								IVA ({Math.round(breakdown.taxRate * 100)}%)
							</td>
							<td className="px-4 py-3 text-right tabular-nums font-semibold text-[var(--text-primary)]">
								{formatCOP(breakdown.taxAmount)}
							</td>
						</tr>
						<tr className="bg-[var(--surface-secondary)]">
							<td colSpan={4} className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">
								Total
							</td>
							<td className="px-4 py-3 text-right tabular-nums font-bold text-[var(--color-brand-blue)]">
								{formatCOP(breakdown.totalWithTax)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>

			{/* Mobile cards */}
			<div className="space-y-3 md:hidden">
				{breakdown.items.map((item) => (
					<div
						key={`mobile-${item.description}-${item.unit}`}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
					>
						<p className="font-medium text-[var(--text-primary)]">{item.description}</p>
						<div className="mt-2 grid grid-cols-2 gap-2 text-xs tabular-nums text-[var(--text-secondary)]">
							<span>Cant: {item.quantity} {item.unit}</span>
							<span className="text-right">P/U: {formatCOP(item.unitPrice)}</span>
						</div>
						<p className="mt-2 text-right tabular-nums font-semibold text-[var(--text-primary)]">
							{formatCOP(item.total)}
						</p>
					</div>
				))}
				<div className="border-t border-[var(--border-subtle)] pt-3 space-y-1">
					<div className="flex justify-between text-sm text-[var(--text-secondary)]">
						<span>Subtotal</span>
						<span className="tabular-nums">{formatCOP(breakdown.subtotal)}</span>
					</div>
					<div className="flex justify-between text-sm text-[var(--text-secondary)]">
						<span>IVA ({Math.round(breakdown.taxRate * 100)}%)</span>
						<span className="tabular-nums">{formatCOP(breakdown.taxAmount)}</span>
					</div>
					<div className="flex justify-between text-base font-bold text-[var(--text-primary)]">
						<span>Total</span>
						<span className="tabular-nums text-[var(--color-brand-blue)]">{formatCOP(breakdown.totalWithTax)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatCOP(value: number): string {
	return COP_FORMATTER.format(value);
}
