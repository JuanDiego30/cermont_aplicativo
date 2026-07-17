import type { PlanningEquipment } from "@cermont/shared-types";
import { Plus, Trash2 } from "lucide-react";

interface EquipmentTabProps {
	equipment: PlanningEquipment[];
	onEquipmentChange: (value: PlanningEquipment[]) => void;
}

export function EquipmentTab({ equipment, onEquipmentChange }: EquipmentTabProps) {
	const addEquipment = () =>
		onEquipmentChange([
			...equipment,
			{ name: "", quantity: 1, available: true, certificateRequired: false },
		]);
	const removeEquipment = (index: number) =>
		onEquipmentChange(equipment.filter((_, itemIndex) => itemIndex !== index));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Lista de Equipos Especiales</h3>
				<button
					type="button"
					onClick={addEquipment}
					className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--color-brand-blue-bg)]"
				>
					<Plus className="size-3.5" aria-hidden="true" /> Agregar
				</button>
			</div>

			{equipment.length === 0 ? (
				<p className="py-6 text-center text-xs text-[var(--text-muted)]">
					No se han registrado equipos especiales.
				</p>
			) : (
				<div className="space-y-3">
					{equipment.map((item, index) => (
						<div key={`equipment-${item.name}-${item.quantity}`} className="flex items-center gap-3">
							<input
								type="text"
								aria-label={`Nombre del equipo ${index + 1}`}
								value={item.name}
								placeholder="Nombre del equipo"
								onChange={(event) =>
									onEquipmentChange(
										equipment.map((equipmentItem, itemIndex) =>
											itemIndex === index
												? { ...equipmentItem, name: event.currentTarget.value }
												: equipmentItem,
										),
								)
								}
								className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<input
								type="number"
								min={1}
								aria-label={`Cantidad del equipo ${index + 1}`}
								value={item.quantity}
								onChange={(event) =>
									onEquipmentChange(
										equipment.map((equipmentItem, itemIndex) =>
											itemIndex === index
												? { ...equipmentItem, quantity: Number(event.currentTarget.value) }
												: equipmentItem,
										),
								)
								}
								className="w-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<button
								type="button"
								aria-label={`${item.available ? "Marcar no disponible" : "Marcar disponible"} ${index + 1}`}
								onClick={() =>
									onEquipmentChange(
										equipment.map((equipmentItem, itemIndex) =>
											itemIndex === index
												? { ...equipmentItem, available: !equipmentItem.available }
												: equipmentItem,
										),
								)
								}
								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${item.available ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}
							>
								{item.available ? "Disponible" : "No disp."}
							</button>
							<button
								type="button"
								aria-label={`${item.certificateRequired ? "Quitar certificación requerida" : "Requerir certificación"} ${index + 1}`}
								onClick={() =>
									onEquipmentChange(
										equipment.map((equipmentItem, itemIndex) =>
											itemIndex === index
												? { ...equipmentItem, certificateRequired: !equipmentItem.certificateRequired }
												: equipmentItem,
										),
								)
								}
								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${item.certificateRequired ? "bg-amber-100 text-brand-warn dark:bg-amber-950/20" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}
							>
								{item.certificateRequired ? "Requiere Certif." : "Sin Certif."}
							</button>
							<button
								type="button"
								aria-label={`Eliminar equipo ${index + 1}`}
								onClick={() => removeEquipment(index)}
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
