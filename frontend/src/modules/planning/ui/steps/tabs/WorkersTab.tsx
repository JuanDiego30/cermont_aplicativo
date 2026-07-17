import type { WorkerRequirements } from "@cermont/shared-types";

interface WorkersTabProps {
	workerReqs: WorkerRequirements;
	onWorkerReqsChange: (value: WorkerRequirements) => void;
}

const WORKER_FIELDS = [
	{ key: "electricistas", label: "Técnicos Electricistas" },
	{ key: "tecnicosTelecomunicacion", label: "Técnicos de Telecomunicaciones" },
	{ key: "instrumentistas", label: "Instrumentistas" },
	{ key: "obreros", label: "Obreros / Auxiliares" },
] as const satisfies ReadonlyArray<{ key: keyof WorkerRequirements; label: string }>;

export function WorkersTab({ workerReqs, onWorkerReqsChange }: WorkersTabProps) {
	const handleWorkerChange = (key: keyof WorkerRequirements, value: number) => {
		onWorkerReqsChange({ ...workerReqs, [key]: Math.max(0, value) });
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">
					Necesidades de Personal Operativo
				</h3>
				<p className="text-xs text-[var(--text-secondary)]">
					Especifique el número mínimo de trabajadores requeridos por rol especializado.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{WORKER_FIELDS.map((field) => (
					<label
						key={field.key}
						className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3"
					>
						<span className="text-sm font-medium text-[var(--text-primary)]">{field.label}</span>
						<input
							type="number"
							min={0}
							value={workerReqs[field.key]}
							aria-label={`Cantidad de ${field.label}`}
							onChange={(event) =>
								handleWorkerChange(field.key, Number(event.currentTarget.value))
							}
							className="w-20 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/55 px-3 py-2 text-center text-sm text-[var(--text-primary)] focus:outline-none"
						/>
					</label>
				))}
			</div>
		</div>
	);
}
