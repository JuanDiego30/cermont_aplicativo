"use client";

import { hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import type { CostCategory } from "@cermont/shared-types";
import { BookOpenText, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { CustomizableSelect } from "@/core/ui/CustomizableSelect";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCostCatalog, useCreateCostCatalogItem } from "../queries";
import { COST_CATEGORY_LABELS, COST_CATEGORY_OPTIONS, formatCurrency } from "../utils";

const ALL_CATEGORIES = "all";
const CATEGORY_OPTIONS = [
	{ value: ALL_CATEGORIES, label: "Todas las categorías" },
	...COST_CATEGORY_OPTIONS.map((category) => ({
		value: category,
		label: COST_CATEGORY_LABELS[category],
	})),
];
const CREATE_CATEGORY_OPTIONS = COST_CATEGORY_OPTIONS.map((category) => ({
	value: category,
	label: COST_CATEGORY_LABELS[category],
}));

const EMPTY_CATALOG_FORM = {
	code: "",
	name: "",
	category: "materials" as CostCategory,
	unit: "",
	unitPrice: "",
};

function CostCatalogCreateForm() {
	const [form, setForm] = useState(EMPTY_CATALOG_FORM);
	const [isOpen, setIsOpen] = useState(false);
	const createItem = useCreateCostCatalogItem();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const unitPrice = Number(form.unitPrice);
		if (!form.code.trim() || !form.name.trim() || !form.unit.trim() || Number.isNaN(unitPrice)) {
			return;
		}
		createItem.mutate(
			{
				code: form.code.trim(),
				name: form.name.trim(),
				category: form.category,
				unit: form.unit.trim(),
				unitPrice,
				currency: "COP",
				isActive: true,
			},
			{
				onSuccess: () => {
					setForm(EMPTY_CATALOG_FORM);
					setIsOpen(false);
				},
			},
		);
	};

	if (!isOpen) {
		return (
			<div className="border-t border-[var(--border-subtle)] px-5 py-3">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border-medium)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
				>
					<Plus className="size-4" aria-hidden="true" />
					Agregar ítem al catálogo
				</button>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="grid gap-3 border-t border-[var(--border-subtle)] px-5 py-4 md:grid-cols-2 lg:grid-cols-5"
			aria-label="Crear ítem del catálogo"
		>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Código
				<input
					value={form.code}
					onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
					required
					maxLength={40}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					placeholder="LAB-001"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Referencia
				<input
					value={form.name}
					onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
					required
					maxLength={200}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					placeholder="Hora técnica electricista"
				/>
			</label>
			<CustomizableSelect
				label="Categoría"
				value={form.category}
				options={CREATE_CATEGORY_OPTIONS}
				allowCustom={false}
				onChange={(value) => setForm((prev) => ({ ...prev, category: value as CostCategory }))}
			/>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Unidad
				<input
					value={form.unit}
					onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
					required
					maxLength={50}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					placeholder="hora, m2, unidad"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Valor unitario (COP)
				<input
					value={form.unitPrice}
					onChange={(event) => setForm((prev) => ({ ...prev, unitPrice: event.target.value }))}
					required
					type="number"
					min={0}
					step={1}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					placeholder="50000"
				/>
			</label>
			{createItem.isError && (
				<p className="text-sm text-[var(--color-danger)] md:col-span-2 lg:col-span-5" role="alert">
					{createItem.error instanceof Error
						? createItem.error.message
						: "No se pudo crear el ítem del catálogo"}
				</p>
			)}
			<div className="flex items-center gap-2 md:col-span-2 lg:col-span-5">
				<button
					type="submit"
					disabled={createItem.isPending}
					className="inline-flex min-h-11 items-center rounded-md bg-[var(--color-brand-blue)] px-4 text-sm font-semibold text-white disabled:opacity-60"
				>
					{createItem.isPending ? "Guardando…" : "Guardar ítem"}
				</button>
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="inline-flex min-h-11 items-center rounded-md border border-[var(--border-medium)] px-4 text-sm font-medium text-[var(--text-primary)]"
				>
					Cancelar
				</button>
			</div>
		</form>
	);
}

export function CostCatalogPanel() {
	const { user } = useAuth();
	const canManageCatalog = user ? hasRole(user.role, MANAGEMENT_ROLES) : false;
	const [category, setCategory] = useState<string>(ALL_CATEGORIES);
	const query = useCostCatalog({
		category: category === ALL_CATEGORIES ? undefined : (category as CostCategory),
		limit: 12,
	});

	return (
		<section className="border-y border-[var(--border-subtle)] bg-[var(--surface-primary)]">
			<header className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
				<div>
					<div className="flex items-center gap-2 text-[var(--color-brand-blue)]">
						<BookOpenText className="size-4" aria-hidden="true" />
						<p className="text-xs font-semibold uppercase tracking-[0.16em]">Base de referencia</p>
					</div>
					<h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
						Catálogo de costos
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Valores unitarios vigentes para materiales, cuadrillas, equipos y transporte.
					</p>
				</div>
				<CustomizableSelect
					label="Filtrar categoría"
					value={category}
					options={CATEGORY_OPTIONS}
					allowCustom={false}
					onChange={(value) => setCategory(value)}
					data-testid="cost-catalog-category"
				/>
			</header>

			{canManageCatalog && <CostCatalogCreateForm />}

			{query.isLoading ? (
				<div className="h-28 animate-pulse border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)]" />
			) : query.isError ? (
				<p className="border-t border-[var(--border-subtle)] px-5 py-8 text-sm text-[var(--color-danger)]">
					No se pudo consultar el catálogo. Los registros de costos siguen disponibles.
				</p>
			) : (query.data?.items.length ?? 0) === 0 ? (
				<p className="border-t border-dashed border-[var(--border-medium)] px-5 py-8 text-sm text-[var(--text-secondary)]">
					No hay referencias activas en esta categoría.
				</p>
			) : (
				<div className="overflow-x-auto border-t border-[var(--border-subtle)]">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-[var(--surface-secondary)] text-xs text-[var(--text-tertiary)]">
							<tr>
								<th className="px-5 py-3 font-semibold">Código y referencia</th>
								<th className="px-5 py-3 font-semibold">Categoría</th>
								<th className="px-5 py-3 font-semibold">Unidad</th>
								<th className="px-5 py-3 text-right font-semibold">Valor unitario</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{query.data?.items.map((item) => (
								<tr key={item._id}>
									<td className="px-5 py-3">
										<span className="font-mono text-xs text-[var(--text-tertiary)]">
											{item.code}
										</span>
										<p className="font-medium text-[var(--text-primary)]">{item.name}</p>
									</td>
									<td className="px-5 py-3 text-[var(--text-secondary)]">
										{COST_CATEGORY_LABELS[item.category]}
									</td>
									<td className="px-5 py-3 text-[var(--text-secondary)]">{item.unit}</td>
									<td className="px-5 py-3 text-right font-semibold text-[var(--text-primary)]">
										{formatCurrency(item.unitPrice, item.currency)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
