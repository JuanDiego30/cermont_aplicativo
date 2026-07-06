"use client";

import { hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import type { CostCategory } from "@cermont/shared-types";
import { type FormEvent, useReducer } from "react";
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

interface CostCatalogFormState {
	code: string;
	name: string;
	category: CostCategory;
	unit: string;
	unitPrice: string;
}

type CostCatalogFormAction =
	| { type: "SET_CODE"; value: string }
	| { type: "SET_NAME"; value: string }
	| { type: "SET_CATEGORY"; value: CostCategory }
	| { type: "SET_UNIT"; value: string }
	| { type: "SET_UNIT_PRICE"; value: string }
	| { type: "RESET" };

function costCatalogFormReducer(
	state: CostCatalogFormState,
	action: CostCatalogFormAction,
): CostCatalogFormState {
	switch (action.type) {
		case "SET_CODE":
			return { ...state, code: action.value };
		case "SET_NAME":
			return { ...state, name: action.value };
		case "SET_CATEGORY":
			return { ...state, category: action.value };
		case "SET_UNIT":
			return { ...state, unit: action.value };
		case "SET_UNIT_PRICE":
			return { ...state, unitPrice: action.value };
		case "RESET":
			return { code: "", name: "", category: "materials", unit: "", unitPrice: "" };
	}
}

const CATEGORY_OPTIONS: { value: CostCategory; label: string }[] = [
	{ value: "labor", label: "Mano de obra" },
	{ value: "materials", label: "Materiales" },
	{ value: "equipment", label: "Equipos" },
	{ value: "subcontract", label: "Subcontratista" },
	{ value: "transport", label: "Transporte" },
	{ value: "other", label: "Otros" },
];

const INITIAL_STATE: CostCatalogFormState = {
	code: "",
	name: "",
	category: "materials",
	unit: "",
	unitPrice: "",
};

export function CostCatalogForm({ onSubmit, isPending, error }: Props) {
	const { user } = useAuth();
	const canManage = user ? hasRole(user.role, MANAGEMENT_ROLES) : false;
	const [state, dispatch] = useReducer(costCatalogFormReducer, INITIAL_STATE);

	if (!canManage) {
		return null;
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const price = Number(state.unitPrice);
		if (
			!state.code.trim() ||
			!state.name.trim() ||
			!state.unit.trim() ||
			Number.isNaN(price) ||
			price <= 0
		) {
			return;
		}
		onSubmit({
			code: state.code.trim(),
			name: state.name.trim(),
			category: state.category,
			unit: state.unit.trim(),
			unitPrice: price,
		});
		dispatch({ type: "RESET" });
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
					value={state.code}
					onChange={(e) => dispatch({ type: "SET_CODE", value: e.target.value })}
					required
					maxLength={40}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="LAB-001"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Referencia
				<input
					value={state.name}
					onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
					required
					maxLength={200}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="Hora técnica"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Categoría
				<select
					value={state.category}
					onChange={(e) =>
						dispatch({ type: "SET_CATEGORY", value: e.target.value as CostCategory })
					}
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
					value={state.unit}
					onChange={(e) => dispatch({ type: "SET_UNIT", value: e.target.value })}
					required
					maxLength={50}
					className="min-h-11 rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm"
					placeholder="hora, m2, unidad"
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Valor unitario (COP)
				<input
					value={state.unitPrice}
					onChange={(e) => dispatch({ type: "SET_UNIT_PRICE", value: e.target.value })}
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
