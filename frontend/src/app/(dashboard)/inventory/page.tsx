"use client";

/**
 * /inventory — Catálogo de inventario con stock, alertas y movimientos.
 */

import type { InventoryItem } from "@cermont/shared-types";
import { AlertTriangle, ArrowDownUp, Package, Plus } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import {
	useCreateInventoryItem,
	useInventoryItems,
	useRegisterStockMovement,
} from "@/modules/inventory/queries";

const CATEGORIES = [
	{ value: "", label: "Todas" },
	{ value: "herramienta", label: "Herramientas" },
	{ value: "equipo", label: "Equipos" },
	{ value: "material", label: "Materiales" },
	{ value: "epp", label: "EPP" },
	{ value: "consumible", label: "Consumibles" },
	{ value: "otro", label: "Otros" },
] as const;

const MOVEMENT_TYPES = [
	{ value: "entrada", label: "Entrada" },
	{ value: "salida", label: "Salida" },
	{ value: "ajuste", label: "Ajuste (stock absoluto)" },
	{ value: "prestamo", label: "Préstamo" },
	{ value: "devolucion", label: "Devolución" },
] as const;

const inputClasses =
	"rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]";

export default function InventoryPage() {
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState("");
	const [onlyLowStock, setOnlyLowStock] = useState(false);
	const [showNewForm, setShowNewForm] = useState(false);
	const [movementItem, setMovementItem] = useState<InventoryItem | "">("");

	const { data, isLoading, error, refetch } = useInventoryItems({
		page,
		limit: 20,
		...(category ? { category } : {}),
		...(onlyLowStock ? { lowStock: true } : {}),
	});

	const items = data?.data ?? [];
	const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

	return (
		<section className="space-y-6" aria-labelledby="inventory-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="inventory-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Inventario
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{pagination.total} items en catálogo
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowNewForm((v) => !v)}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nuevo item
				</button>
			</header>

			<div className="flex flex-wrap items-center gap-2">
				{CATEGORIES.map((cat) => (
					<button
						type="button"
						key={cat.value}
						onClick={() => {
							setCategory(cat.value);
							setPage(1);
						}}
						className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
							category === cat.value
								? "bg-[var(--color-brand-blue)] text-white"
								: "border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						{cat.label}
					</button>
				))}
				<label className="ml-2 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
					<input
						type="checkbox"
						checked={onlyLowStock}
						onChange={(e) => {
							setOnlyLowStock(e.target.checked);
							setPage(1);
						}}
						className="size-4 rounded border-[var(--border-default)]"
					/>
					Solo stock bajo
				</label>
			</div>

			{showNewForm && <NewItemForm onClose={() => setShowNewForm(false)} />}

			{movementItem && <MovementForm item={movementItem} onClose={() => setMovementItem("")} />}

			{isLoading && (
				<div className="space-y-2">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} variant="chart" height={56} />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar el inventario.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && items.length === 0 && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<Package
						className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]"
						aria-hidden="true"
					/>
					<p className="text-[var(--text-secondary)]">
						{onlyLowStock
							? "No hay items con stock bajo."
							: "El catálogo de inventario está vacío."}
					</p>
				</div>
			)}

			{items.length > 0 && (
				<ul className="space-y-2">
					{items.map((item) => {
						const isLow = item.currentStock <= item.minStock;
						return (
							<li
								key={item._id}
								className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4"
							>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											{item.name}
										</p>
										<span className="shrink-0 rounded bg-[var(--surface-secondary)] px-1.5 py-0.5 text-[10px] font-medium capitalize text-[var(--text-secondary)]">
											{item.category}
										</span>
										{isLow && (
											<span className="flex shrink-0 items-center gap-1 rounded bg-[var(--color-warning-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
												<AlertTriangle className="size-3" aria-hidden="true" />
												Stock bajo
											</span>
										)}
									</div>
									<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
										{item.currentStock} {item.unit} disponibles (mínimo {item.minStock})
										{item.location ? ` — ${item.location}` : ""}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setMovementItem(item)}
									className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
								>
									<ArrowDownUp className="size-3.5" aria-hidden="true" />
									Movimiento
								</button>
							</li>
						);
					})}
				</ul>
			)}

			{pagination.totalPages > 1 && (
				<nav aria-label="Paginación" className="flex items-center justify-center gap-2">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Anterior
					</button>
					<span className="text-xs text-[var(--text-tertiary)]">
						{page} / {pagination.totalPages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Siguiente
					</button>
				</nav>
			)}
		</section>
	);
}

function NewItemForm({ onClose }: { onClose: () => void }) {
	const createMutation = useCreateInventoryItem();
	const [name, setName] = useState("");
	const [itemCategory, setItemCategory] = useState("material");
	const [unit, setUnit] = useState("unidad");
	const [minStock, setMinStock] = useState(0);
	const [initialStock, setInitialStock] = useState(0);
	const [location, setLocation] = useState("");
	const [formError, setFormError] = useState("");

	return (
		<form
			className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] sm:grid-cols-2 lg:grid-cols-3"
			onSubmit={async (e) => {
				e.preventDefault();
				setFormError("");
				if (!name.trim()) {
					setFormError("El nombre es obligatorio.");
					return;
				}
				try {
					await createMutation.mutateAsync({
						name: name.trim(),
						category: itemCategory as "herramienta",
						unit,
						minStock,
						initialStock,
						...(location.trim() ? { location: location.trim() } : {}),
					});
					onClose();
				} catch (error) {
					setFormError(error instanceof Error ? error.message : "No se pudo crear el item.");
				}
			}}
			aria-label="Nuevo item de inventario"
		>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Nombre
				<input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Categoría
				<select
					value={itemCategory}
					onChange={(e) => setItemCategory(e.target.value)}
					className={inputClasses}
				>
					{CATEGORIES.filter((c) => c.value).map((cat) => (
						<option key={cat.value} value={cat.value}>
							{cat.label}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Unidad
				<input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClasses} />
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Stock mínimo
				<input
					type="number"
					inputMode="numeric"
					min={0}
					value={minStock}
					onChange={(e) => setMinStock(Math.max(0, Number(e.target.value)))}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Stock inicial
				<input
					type="number"
					inputMode="numeric"
					min={0}
					value={initialStock}
					onChange={(e) => setInitialStock(Math.max(0, Number(e.target.value)))}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Ubicación
				<input
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					placeholder="Bodega principal"
					className={inputClasses}
				/>
			</label>
			{formError && (
				<p className="text-sm text-[var(--color-danger)] sm:col-span-2 lg:col-span-3" role="alert">
					{formError}
				</p>
			)}
			<div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
				<button
					type="button"
					onClick={onClose}
					className="rounded-[var(--radius-lg)] border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={createMutation.isPending}
					className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{createMutation.isPending ? "Guardando..." : "Crear item"}
				</button>
			</div>
		</form>
	);
}

function MovementForm({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
	const movementMutation = useRegisterStockMovement();
	const [type, setType] = useState("salida");
	const [quantity, setQuantity] = useState(1);
	const [reason, setReason] = useState("");
	const [formError, setFormError] = useState("");

	return (
		<form
			className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--color-info-bg)] bg-[var(--color-info-bg)]/30 p-4"
			onSubmit={async (e) => {
				e.preventDefault();
				setFormError("");
				try {
					await movementMutation.mutateAsync({
						itemId: item._id ?? "",
						input: {
							type: type as "salida",
							quantity,
							...(reason.trim() ? { reason: reason.trim() } : {}),
						},
					});
					onClose();
				} catch (error) {
					setFormError(
						error instanceof Error ? error.message : "No se pudo registrar el movimiento.",
					);
				}
			}}
			aria-label={`Movimiento de stock para ${item.name}`}
		>
			<p className="w-full text-sm font-medium text-[var(--text-primary)]">
				Movimiento — {item.name} ({item.currentStock} {item.unit})
			</p>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Tipo
				<select value={type} onChange={(e) => setType(e.target.value)} className={inputClasses}>
					{MOVEMENT_TYPES.map((mt) => (
						<option key={mt.value} value={mt.value}>
							{mt.label}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Cantidad
				<input
					type="number"
					inputMode="numeric"
					min={1}
					value={quantity}
					onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
					className={inputClasses}
				/>
			</label>
			<label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Motivo
				<input
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Orden OT-2026-0012"
					className={inputClasses}
				/>
			</label>
			{formError && (
				<p className="w-full text-sm text-[var(--color-danger)]" role="alert">
					{formError}
				</p>
			)}
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onClose}
					className="rounded-[var(--radius-lg)] border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={movementMutation.isPending}
					className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{movementMutation.isPending ? "Registrando..." : "Registrar"}
				</button>
			</div>
		</form>
	);
}
