import type { PlanningTool } from "@cermont/shared-types";
import { CheckCircle, Plus, Trash2, XCircle } from "lucide-react";

interface ToolsTabProps {
	tools: PlanningTool[];
	onToolsChange: (value: PlanningTool[]) => void;
}

export function ToolsTab({ tools, onToolsChange }: ToolsTabProps) {
	const addTool = () => onToolsChange([...tools, { name: "", quantity: 1, available: true }]);
	const removeTool = (index: number) =>
		onToolsChange(tools.filter((_, itemIndex) => itemIndex !== index));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Lista de Herramientas</h3>
				<button
					type="button"
					onClick={addTool}
					className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--color-brand-blue-bg)]"
				>
					<Plus className="size-3.5" aria-hidden="true" /> Agregar
				</button>
			</div>

			{tools.length === 0 ? (
				<p className="py-6 text-center text-xs text-[var(--text-muted)]">
					No se han registrado herramientas.
				</p>
			) : (
				<div className="space-y-3">
					{tools.map((tool, index) => (
						<div key={`tool-${tool.name}-${tool.quantity}`} className="flex items-center gap-3">
							<input
								type="text"
								aria-label={`Nombre de la herramienta ${index + 1}`}
								value={tool.name}
								placeholder="Nombre de la herramienta"
								onChange={(event) =>
									onToolsChange(
										tools.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, name: event.currentTarget.value }
												: item,
										),
								)
								}
								className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
							/>
							<input
								type="number"
								min={1}
								aria-label={`Cantidad de la herramienta ${index + 1}`}
								value={tool.quantity}
								onChange={(event) =>
									onToolsChange(
										tools.map((item, itemIndex) =>
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
								aria-label={`${tool.available ? "Marcar no disponible" : "Marcar disponible"} ${index + 1}`}
								onClick={() =>
									onToolsChange(
										tools.map((item, itemIndex) =>
											itemIndex === index
												? { ...item, available: !item.available }
												: item,
										),
									)
								}
								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tool.available ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--surface-secondary)] text-[var(--text-muted)]"}`}
							>
								{tool.available ? <CheckCircle className="size-3" aria-hidden="true" /> : <XCircle className="size-3" aria-hidden="true" />}
								{tool.available ? "Disponible" : "No disponible"}
							</button>
							<button
								type="button"
								aria-label={`Eliminar herramienta ${index + 1}`}
								onClick={() => removeTool(index)}
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
