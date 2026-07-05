"use client";

import type { CostProposalLineItem, CostProposalResult } from "@cermont/shared-types";
import { Fragment } from "react";

const CATEGORY_LABELS: Record<string, string> = {
	materials: "MATERIALES",
	labor: "MANO DE OBRA",
	equipment: "HERRAMIENTAS / EQUIPOS",
	transport: "TRANSPORTE",
	other: "OTROS",
};

const SOURCE_LABELS: Record<string, string> = {
	catalog: "catálogo",
	calculated: "calculado",
	user_provided: "usuario",
	estimated: "estimado",
};

interface CostProposalAssistantResultsProps {
	result: CostProposalResult;
	formatCOP: (value: number) => string;
}

const SOURCE_BADGE_COLORS: Record<string, string> = {
	catalog: "bg-blue-50 text-blue-700",
	calculated: "bg-green-50 text-green-700",
	user_provided: "bg-purple-50 text-purple-700",
	estimated: "bg-amber-50 text-amber-700",
};

const CATEGORY_ORDER = ["materials", "labor", "equipment", "transport", "other"] as const;

function SourceBadge({ source }: { source: CostProposalLineItem["source"] }) {
	return (
		<span
			className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SOURCE_BADGE_COLORS[source] ?? "bg-gray-50 text-gray-600"}`}
		>
			{SOURCE_LABELS[source] ?? source}
		</span>
	);
}

export function CostProposalAssistantResults({
	result,
	formatCOP,
}: CostProposalAssistantResultsProps) {
	// Group line items by category
	const grouped = new Map<string, CostProposalLineItem[]>();
	for (const item of result.lineItems) {
		const existing = grouped.get(item.category) ?? [];
		existing.push(item);
		grouped.set(item.category, existing);
	}

	return (
		<section className="space-y-6">
			<header>
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
					Desglose de costos
				</h3>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">{result.activityDescription}</p>
			</header>

			<div className="rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-0 text-sm">
						<thead>
							<tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold">
									Categoría
								</th>
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Ítem</th>
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold text-right">
									Cantidad
								</th>
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold text-right">
									V/Unitario
								</th>
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold text-right">
									Total
								</th>
								<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Fuente</th>
							</tr>
						</thead>
						<tbody className="text-[var(--text-secondary)]">
							{CATEGORY_ORDER.map((cat) => {
								const items = grouped.get(cat);
								if (!items || items.length === 0) {
									return null;
								}

								const categorySubtotal = items.reduce((s, i) => s + i.total, 0);

								return (
									<Fragment key={cat}>
										{items.map((item, itemIdx) => (
											<tr
												key={`${cat}-${item.item}`}
												className="border-b border-[var(--border-subtle)]"
											>
												<td className="p-3 font-medium text-[var(--text-primary)]">
													{itemIdx === 0 ? (CATEGORY_LABELS[cat] ?? cat) : ""}
												</td>
												<td className="p-3">
													{item.item}
													{item.notes && (
														<span className="ml-1 text-xs text-[var(--text-tertiary)]">
															({item.notes})
														</span>
													)}
												</td>
												<td className="p-3 text-right tabular-nums">
													{item.quantity} {item.unit}
												</td>
												<td className="p-3 text-right tabular-nums">{formatCOP(item.unitPrice)}</td>
												<td className="p-3 text-right tabular-nums font-medium">
													{formatCOP(item.total)}
												</td>
												<td className="p-3">
													<SourceBadge source={item.source} />
												</td>
											</tr>
										))}
										<tr className="bg-[var(--surface-secondary)]">
											<td
												className="p-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]"
												colSpan={4}
											>
												Subtotal {CATEGORY_LABELS[cat] ?? cat}
											</td>
											<td
												className="p-3 text-right tabular-nums font-semibold text-[var(--text-primary)]"
												colSpan={2}
											>
												{formatCOP(categorySubtotal)}
											</td>
										</tr>
									</Fragment>
								);
							})}
						</tbody>
						<tfoot className="text-sm" aria-label="Resumen de totales">
							<tr className="border-t-2 border-[var(--border-medium)]">
								<td className="p-3 font-semibold" colSpan={5}>
									COSTO DIRECTO TOTAL
								</td>
								<td className="p-3 text-right tabular-nums font-semibold text-[var(--text-primary)]">
									{formatCOP(result.directCost)}
								</td>
							</tr>
							<tr>
								<td className="p-3 text-[var(--text-tertiary)]" colSpan={5}>
									Margen de contribución ({result.suggestedMarginPercent}%)
								</td>
								<td className="p-3 text-right tabular-nums text-[var(--text-primary)]">
									{formatCOP(result.suggestedMarginAmount)}
								</td>
							</tr>
							<tr className="border-t border-[var(--border-subtle)]">
								<td className="p-3 font-semibold" colSpan={5}>
									SUBTOTAL
								</td>
								<td className="p-3 text-right tabular-nums font-semibold text-[var(--text-primary)]">
									{formatCOP(result.subtotal)}
								</td>
							</tr>
							<tr>
								<td className="p-3 text-[var(--text-tertiary)]" colSpan={5}>
									IVA ({(result.taxRate * 100).toFixed(0)}%) sobre base gravable
								</td>
								<td className="p-3 text-right tabular-nums text-[var(--text-primary)]">
									{formatCOP(result.taxAmount)}
								</td>
							</tr>
							<tr className="border-t-2 border-[var(--color-brand)] bg-[#2154A608]">
								<td className="p-3 text-base font-bold text-[var(--color-brand)]" colSpan={5}>
									TOTAL PROPUESTA
								</td>
								<td className="p-3 text-right tabular-nums text-base font-bold text-[var(--color-brand)]">
									{formatCOP(result.totalRounded)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>

			<p className="text-xs text-[var(--text-tertiary)]">
				Generado: {new Date(result.generatedAt).toLocaleString("es-CO")}
			</p>
		</section>
	);
}
