import type { PlanningResourceLine } from "@cermont/shared-types";
import { Plus, Trash2 } from "lucide-react";

interface SafetyTabProps {
	safetyElements: PlanningResourceLine[];
	onSafetyElementsChange: (value: PlanningResourceLine[]) => void;
}

export function SafetyTab({ safetyElements, onSafetyElementsChange }: SafetyTabProps) {
	const addSafetyElement = () =>
		onSafetyElementsChange([
			...safetyElements,
			{ description: "", quantity: 1, unit: "und" },
		]);
	const removeSafetyElement = (index: number) =>
		onSafetyElementsChange(safetyElements.filter((_, itemIndex) => itemIndex !== index));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">EPP y Elementos de Seguridad</h3>
				<button
					type="button"
					onClick={addSafetyElement}
					className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--color-brand-blue-bg)]"
				>
					<Plus className="size-3.5" aria-hidden="true" /> Agregar
				</button>
			</div>

			{safetyElements.length === 0 ? (
				<p className="py-6 text-center text-xs text-[var(--text-muted)]">No se han registrado EPP.</p>
			) : (
				<div className="space-y-3">
					{safetyElements.map((element, index) => (
						<div
							key={`safety-${element.description}-${element.quantity}-${element.unit ?? ""}`}
							className="flex items-center gap-3"
						>
							<input
								type="text"
								aria-label={`Descripción del elemento de seguridad ${index + 1}`}
								value={element.description}
								placeholder="Descripción del EPP"
								onChange={(event) =>
									onSafetyElementsChange(
										safetyElements.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, description: event.currentTarget.value }
												: item,
										),
								)
								}
								className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<input
								type="number"
								min={1}
								aria-label={`Cantidad del elemento de seguridad ${index + 1}`}
								value={element.quantity}
								onChange={(event) =>
									onSafetyElementsChange(
										safetyElements.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, quantity: Number(event.currentTarget.value) }
												: item,
										),
								)
								}
								className="w-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<button
								type="button"
								aria-label={`Eliminar elemento de seguridad ${index + 1}`}
								onClick={() => removeSafetyElement(index)}
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
