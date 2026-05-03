"use client";

import {
	FIELD_CLASS,
	MAINTENANCE_PRIORITIES,
	MAINTENANCE_STATUSES,
	MAINTENANCE_TYPES,
	toDateTimeLocal,
} from "./maintenance-constants";

interface Worker {
	_id: string;
	id?: string;
	name?: string;
}

interface MaintenanceFormFieldsProps {
	maintenance: Record<string, unknown>;
	workers: Worker[];
}

function getSafeString(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number") {
		return String(value);
	}
	return "";
}

function getSafeOptionalString(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number") {
		return String(value);
	}
	return "";
}

export function MaintenanceFormFields({ maintenance, workers }: MaintenanceFormFieldsProps) {
	return (
		<>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="maintenance-equipo-id"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Equipo ID{" "}
						<span aria-hidden="true" className="text-red-500">
							*
						</span>
					</label>
					<input
						id="maintenance-equipo-id"
						name="equipoId"
						type="text"
						required
						defaultValue={getSafeString(maintenance.equipment_id ?? "")}
						className={FIELD_CLASS}
					/>
				</div>

				<div>
					<label
						htmlFor="maintenance-tipo"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Tipo{" "}
						<span aria-hidden="true" className="text-red-500">
							*
						</span>
					</label>
					<select
						id="maintenance-tipo"
						name="tipo"
						required
						defaultValue={getSafeString(maintenance.type)}
						className={FIELD_CLASS}
					>
						{MAINTENANCE_TYPES.map((type) => (
							<option key={type.value} value={type.value}>
								{type.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<label
					htmlFor="maintenance-description"
					className="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Descripción{" "}
					<span aria-hidden="true" className="text-red-500">
						*
					</span>
				</label>
				<textarea
					id="maintenance-description"
					name="description"
					rows={4}
					required
					minLength={10}
					defaultValue={getSafeString(maintenance.description)}
					className={FIELD_CLASS}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label
						htmlFor="maintenance-fecha-programada"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Fecha programada{" "}
						<span aria-hidden="true" className="text-red-500">
							*
						</span>
					</label>
					<input
						id="maintenance-fecha-programada"
						name="fechaProgramada"
						type="datetime-local"
						required
						defaultValue={toDateTimeLocal(getSafeOptionalString(maintenance.scheduledDate))}
						className={FIELD_CLASS}
					/>
				</div>

				<div>
					<label
						htmlFor="maintenance-prioridad"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Prioridad
					</label>
					<select
						id="maintenance-prioridad"
						name="prioridad"
						defaultValue={getSafeString(maintenance.priority)}
						className={FIELD_CLASS}
					>
						{MAINTENANCE_PRIORITIES.map((priority) => (
							<option key={priority.value} value={priority.value}>
								{priority.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor="maintenance-estado"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Estado
					</label>
					<select
						id="maintenance-estado"
						name="estado"
						defaultValue={getSafeString(maintenance.status)}
						className={FIELD_CLASS}
					>
						{MAINTENANCE_STATUSES.map((status) => (
							<option key={status.value} value={status.value}>
								{status.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="maintenance-duracion-estimada"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Duración estimada (horas)
					</label>
					<input
						id="maintenance-duracion-estimada"
						name="duracionEstimada"
						type="number"
						min={1}
						step="1"
						defaultValue={getSafeString(maintenance.estimatedDuration || "")}
						className={FIELD_CLASS}
					/>
				</div>

				<div>
					<label
						htmlFor="maintenance-horas-reales"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Horas reales
					</label>
					<input
						id="maintenance-horas-reales"
						name="horasReales"
						type="number"
						min={1}
						step="1"
						defaultValue={getSafeString(maintenance.actualHours || "")}
						className={FIELD_CLASS}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="maintenance-assigned-technician"
					className="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Técnico asignado
				</label>
				<select
					id="maintenance-assigned-technician"
					name="assignedTechnicianId"
					defaultValue={getSafeString(maintenance.technicianId || "")}
					className={FIELD_CLASS}
				>
					<option value="">Sin técnico asignado</option>
					{workers.map((worker) => (
						<option key={worker.id ?? worker._id} value={worker.id ?? worker._id}>
							{worker.name}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="maintenance-costo-materiales"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Costo materiales
					</label>
					<input
						id="maintenance-costo-materiales"
						name="costoMateriales"
						type="number"
						min={0}
						step="0.01"
						defaultValue={getSafeString(maintenance.materialsCost || "")}
						className={FIELD_CLASS}
					/>
				</div>

				<div>
					<label
						htmlFor="maintenance-costo-mano-obra"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Costo mano de obra
					</label>
					<input
						id="maintenance-costo-mano-obra"
						name="costoManoObra"
						type="number"
						min={0}
						step="0.01"
						defaultValue={getSafeString(maintenance.laborCost || "")}
						className={FIELD_CLASS}
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="maintenance-trabajo-realizado"
					className="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Trabajo realizado
				</label>
				<textarea
					id="maintenance-trabajo-realizado"
					name="trabajoRealizado"
					rows={3}
					defaultValue={getSafeString(maintenance.workPerformed || "")}
					className={FIELD_CLASS}
				/>
			</div>

			<div>
				<label
					htmlFor="maintenance-observaciones"
					className="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Observaciones
				</label>
				<textarea
					id="maintenance-observaciones"
					name="observaciones"
					rows={3}
					defaultValue={getSafeString(maintenance.observations || "")}
					className={FIELD_CLASS}
				/>
			</div>
		</>
	);
}
