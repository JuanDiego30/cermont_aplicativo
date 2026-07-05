"use client";

import { hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import type { CostCategory } from "@cermont/shared-types";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface Props {
	onSubmit: (data: {
		code: string;
		name: string;
		category: CostCategory;
		unit: string;
		unitPrice: number;
	}) => void;
	isPending?: boolean;
	error?: string;
}

const CATEGORY_OPTIONS: { value: CostCategory; label: string }[] = [
	{ value: "labor", label: "Mano de obra" },
	{ value: "materials", label: "Materiales" },
	{ value: "equipment", label: "Equipos" },
	{ value: "subcontract", label: "Subcontratista" },
	{ value: "transport", label: "Transporte" },
	{ value: "other", label: "Otros" },
];

export function CostCatalogForm({ onSubmit, isPending, error }: Props) {
	const { user } = useAuth();
	const canManage = user ? hasRole(user.role, MANAGEMENT_ROLES) : false;
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [category, setCategory] = useState<CostCategory>("materials");
	const [unit, setUnit] = useState("");
	const [unitPrice, setUnitPrice] = useState("");

	if (!canManage) {
		return null;
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const price = Number(unitPrice);
		if (!code.trim() || !name.trim() || !unit.trim() || Number.isNaN(price) || price <= 0) {
			return;
		}
		onSubmit({
			code: code.trim(),
			name: name.trim(),
			category,
			unit: unit.trim(),
			unitPrice: price,
		});
		setCode("");
		setName("");
		setUnit("");
		setUnitPrice("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 md:grid-cols-3 lg:grid-cols-5"
			aria-label="Crear ítem del catálogo"
		>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Código
				<input
					value={code}
					onChange={(e) => setCode(e.target.value)}
					required
					maxLength={40}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="LAB-001"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Referencia
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					maxLength={200}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="Hora técnica"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Categoría
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as CostCategory)}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
				>
					{CATEGORY_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Unidad
				<input
					value={unit}
					onChange={(e) => setUnit(e.target.value)}
					required
					maxLength={50}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="hora, m2, unidad"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Valor unitario (COP)
				<input
					value={unitPrice}
					onChange={(e) => setUnitPrice(e.target.value)}
					required
					type="number"
					min={0}
					step={1}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="50000"
				/>
			</label>
			{error && (
				<p className="text-sm text-[#F44336] md:col-span-3 lg:col-span-5" role="alert">
					{error}
				</p>
			)}
			<div className="flex items-center gap-2 md:col-span-3 lg:col-span-5">
				<button
					type="submit"
					disabled={isPending}
					className="rounded-full bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
				>
					{isPending ? "Guardando…" : "Guardar ítem"}
				</button>
			</div>
		</form>
	);
}
