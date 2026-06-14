import type { DispatchStop, DispatchTechnician } from "@cermont/shared-types";
import { MapPin, Route, Trash2, Truck, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { FormField, TextField } from "@/core/ui/FormField";

interface DispatchControlsProps {
	stops: DispatchStop[];
	technicians: DispatchTechnician[];
	onAddStop: (label: string, address: string) => void;
	onAddTechnician: (name: string, address: string) => void;
	onRemoveStop: (id: string) => void;
	onRemoveTechnician: (id: string) => void;
	onOptimize: () => void;
	onAssign: () => void;
	isGeocoding: boolean;
	isOptimizing: boolean;
	isAssigning: boolean;
}

export function DispatchControls({
	stops,
	technicians,
	onAddStop,
	onAddTechnician,
	onRemoveStop,
	onRemoveTechnician,
	onOptimize,
	onAssign,
	isGeocoding,
	isOptimizing,
	isAssigning,
}: DispatchControlsProps) {
	const [stopLabel, setStopLabel] = useState("");
	const [stopAddress, setStopAddress] = useState("");
	const [technicianName, setTechnicianName] = useState("");
	const [technicianAddress, setTechnicianAddress] = useState("");

	const submitStop = () => {
		const label = stopLabel.trim();
		const address = stopAddress.trim();
		if (!label || !address) {
			return;
		}
		onAddStop(label, address);
		setStopLabel("");
		setStopAddress("");
	};

	const submitTechnician = () => {
		const name = technicianName.trim();
		const address = technicianAddress.trim();
		if (!name || !address) {
			return;
		}
		onAddTechnician(name, address);
		setTechnicianName("");
		setTechnicianAddress("");
	};

	return (
		<div className="space-y-4 lg:col-span-1">
			<div className="rounded-xl border border-border-default bg-surface-primary p-4">
				<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
					<MapPin className="size-4 text-brand" aria-hidden="true" />
					Agregar parada
				</h2>
				<div className="space-y-3">
					<FormField label="Nombre o cliente" htmlFor="dispatch-stop-label">
						<TextField
							id="dispatch-stop-label"
							value={stopLabel}
							onChange={(event) => setStopLabel(event.target.value)}
							placeholder="Cliente principal"
						/>
					</FormField>
					<FormField label="Direccion completa" htmlFor="dispatch-stop-address">
						<TextField
							id="dispatch-stop-address"
							value={stopAddress}
							onChange={(event) => setStopAddress(event.target.value)}
							placeholder="Via, numero, ciudad"
						/>
					</FormField>
					<Button
						type="button"
						variant="primary"
						className="w-full"
						onClick={submitStop}
						loading={isGeocoding}
						disabled={!stopLabel.trim() || !stopAddress.trim()}
					>
						Geolocalizar y agregar
					</Button>
				</div>
			</div>

			<div className="rounded-xl border border-border-default bg-surface-primary p-4">
				<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
					<Route className="size-4 text-brand" aria-hidden="true" />
					Paradas ({stops.length})
				</h2>
				{stops.length === 0 ? (
					<p className="py-4 text-center text-xs text-muted-foreground">
						No hay paradas geolocalizadas.
					</p>
				) : (
					<ul className="max-h-64 space-y-2 overflow-y-auto">
						{stops.map((stop, index) => (
							<li
								key={stop.id}
								className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2 text-sm"
							>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-foreground">
										{index + 1}. {stop.label}
									</p>
									<p className="truncate text-xs text-muted-foreground">{stop.address}</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => onRemoveStop(stop.id)}
									aria-label={`Eliminar parada ${stop.label}`}
								>
									<Trash2 aria-hidden="true" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="rounded-xl border border-border-default bg-surface-primary p-4">
				<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
					<Users className="size-4 text-brand" aria-hidden="true" />
					Tecnicos
				</h2>
				<div className="space-y-3">
					<FormField label="Nombre del tecnico" htmlFor="dispatch-technician-name">
						<TextField
							id="dispatch-technician-name"
							value={technicianName}
							onChange={(event) => setTechnicianName(event.target.value)}
						/>
					</FormField>
					<FormField label="Punto de salida" htmlFor="dispatch-technician-address">
						<TextField
							id="dispatch-technician-address"
							value={technicianAddress}
							onChange={(event) => setTechnicianAddress(event.target.value)}
							placeholder="Base operativa o direccion actual"
						/>
					</FormField>
					<Button
						type="button"
						variant="secondary"
						className="w-full"
						onClick={submitTechnician}
						loading={isGeocoding}
						disabled={!technicianName.trim() || !technicianAddress.trim()}
					>
						<Truck aria-hidden="true" />
						Agregar tecnico
					</Button>
				</div>
				{technicians.length > 0 ? (
					<ul className="mt-3 space-y-2">
						{technicians.map((technician) => (
							<li
								key={technician.id}
								className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2 text-sm"
							>
								<span className="text-foreground">{technician.name}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => onRemoveTechnician(technician.id)}
									aria-label={`Eliminar tecnico ${technician.name}`}
								>
									<Trash2 aria-hidden="true" />
								</Button>
							</li>
						))}
					</ul>
				) : null}
			</div>

			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
				<Button
					type="button"
					variant="primary"
					onClick={onOptimize}
					loading={isOptimizing}
					disabled={stops.length < 2}
				>
					<Route aria-hidden="true" />
					Optimizar ruta
				</Button>
				<Button
					type="button"
					variant="accent"
					onClick={onAssign}
					loading={isAssigning}
					disabled={stops.length === 0 || technicians.length === 0}
				>
					<Users aria-hidden="true" />
					Asignar tecnicos
				</Button>
			</div>
		</div>
	);
}
