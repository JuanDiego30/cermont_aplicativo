"use client";

import type { PlanningResourceLine, PlanningTool, WorkerRequirements } from "@cermont/shared-types";
import { Users } from "lucide-react";
import { CollapsibleSection, FormField, ReadinessBadge } from "./shared-components";

interface PlanningPacketScheduleProps {
	workerReqs: WorkerRequirements;
	onWorkerReqsChange: (reqs: WorkerRequirements) => void;
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	safetyElements: PlanningResourceLine[];
	expandedSections: Record<string, boolean>;
	onToggleSection: (key: string) => void;
}

const WORKER_FIELDS: Array<{ key: keyof WorkerRequirements; label: string }> = [
	{ key: "electricistas", label: "Electricistas" },
	{ key: "tecnicosTelecomunicacion", label: "Téc. Telecomunicación" },
	{ key: "instrumentistas", label: "Instrumentistas" },
	{ key: "obreros", label: "Obreros" },
] as const;

export function PlanningPacketSchedule({
	workerReqs,
	onWorkerReqsChange,
	materials,
	tools,
	safetyElements,
	expandedSections,
	onToggleSection,
}: PlanningPacketScheduleProps) {
	const totalWorkers = Object.values(workerReqs).reduce((a, b) => a + b, 0);
	const hasWorkers = Object.values(workerReqs).some((v) => v > 0);

	return (
		<>
			{/* Crew requirements */}
			<CollapsibleSection
				icon={<Users className="size-4" />}
				title="Número de trabajadores"
				expanded={expandedSections.crew}
				onToggle={() => onToggleSection("crew")}
			>
				<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
					{WORKER_FIELDS.map(({ key, label }) => (
						<FormField key={key} label={label} htmlFor={`worker-${key}`}>
							<input
								id={`worker-${key}`}
								type="number"
								min={0}
								max={50}
								value={workerReqs[key]}
								onChange={(e) =>
									onWorkerReqsChange({
										...workerReqs,
										[key]: Number(e.target.value),
									})
								}
								className="field-input w-full"
								aria-label={label}
							/>
						</FormField>
					))}
				</div>
			</CollapsibleSection>

			{/* Readiness summary */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
				<p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
					Resumen de readiness
				</p>
				<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
					<ReadinessBadge
						label="Materiales"
						ready={materials.length > 0}
						count={materials.length}
					/>
					<ReadinessBadge label="Herramientas" ready={tools.length > 0} count={tools.length} />
					<ReadinessBadge
						label="EPP"
						ready={safetyElements.length > 0}
						count={safetyElements.length}
					/>
					<ReadinessBadge label="Trabajadores" ready={hasWorkers} count={totalWorkers} />
				</div>
			</div>
		</>
	);
}
