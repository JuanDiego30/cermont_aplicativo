import type { PlanningResourceLine } from "@cermont/shared-types";
import { Plus, Trash2 } from "lucide-react";

interface MaterialsTabProps {
	materials: PlanningResourceLine[];
	onMaterialsChange: (value: PlanningResourceLine[]) => void;
}

export function MaterialsTab({ materials, onMaterialsChange }: MaterialsTabProps) {
	const addMaterial = () =>
		onMaterialsChange([...materials, { description: "", quantity: 1, unit: "und" }]);

	const removeMaterial = (index: number) =>
		onMaterialsChange(materials.filter((_, itemIndex) => itemIndex !== index));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Lista de Materiales</h3>
				<button
					type="button"
					onClick={addMaterial}
					className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--color-brand-blue-bg)]"
				>
					<Plus className="size-3.5" aria-hidden="true" /> Agregar
				</button>
			</div>

			{materials.length === 0 ? (
				<p className="py-6 text-center text-xs text-[var(--text-muted)]">
					No se han registrado materiales. Agregue uno para iniciar.
				</p>
			) : (
				<div className="space-y-3">
					{materials.map((material, index) => (
						<div
							key={`material-${material.description}-${material.quantity}-${material.unit ?? ""}`}
							className="flex items-center gap-3"
						>
							<input
								type="text"
								value={material.description}
								onChange={(event) =>
									onMaterialsChange(
										materials.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, description: event.currentTarget.value }
												: item,
										),
								)
								}
								placeholder="Descripción del material"
								aria-label={`Descripción del material ${index + 1}`}
								className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<input
								type="number"
								min={1}
								value={material.quantity}
								aria-label={`Cantidad del material ${index + 1}`}
								onChange={(event) =>
									onMaterialsChange(
										materials.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, quantity: Number(event.currentTarget.value) }
												: item,
										),
								)
								}
								className="w-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<input
								type="text"
								value={material.unit ?? ""}
								placeholder="unidad"
								aria-label={`Unidad del material ${index + 1}`}
								onChange={(event) =>
									onMaterialsChange(
										materials.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, unit: event.currentTarget.value }
												: item,
										),
								)
								}
								className="w-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<button
								type="button"
								aria-label={`Eliminar material ${index + 1}`}
								onClick={() => removeMaterial(index)}
								className="rounded-xl p-2 text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)]"
							>
								<Trash2 className="size-4" aria-hidden="true" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
