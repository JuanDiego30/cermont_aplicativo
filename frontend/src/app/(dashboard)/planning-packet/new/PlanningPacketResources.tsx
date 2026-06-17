"use client";

import type { PlanningEquipment, PlanningResourceLine, PlanningTool } from "@cermont/shared-types";
import { CheckCircle, Package, Wrench, XCircle, Zap } from "lucide-react";
import { emptyEquipment, emptyMaterial, emptyTool } from "./constants";
import { CollapsibleSection, ResourceTable } from "./shared-components";

interface PlanningPacketResourcesProps {
	materials: PlanningResourceLine[];
	onMaterialsChange: (materials: PlanningResourceLine[]) => void;
	tools: PlanningTool[];
	onToolsChange: (tools: PlanningTool[]) => void;
	equipment: PlanningEquipment[];
	onEquipmentChange: (equipment: PlanningEquipment[]) => void;
	expandedSections: Record<string, boolean>;
	onToggleSection: (key: string) => void;
}

export function PlanningPacketResources({
	materials,
	onMaterialsChange,
	tools,
	onToolsChange,
	equipment,
	onEquipmentChange,
	expandedSections,
	onToggleSection,
}: PlanningPacketResourcesProps) {
	return (
		<>
			{/* Materials section */}
			<CollapsibleSection
				icon={<Package className="size-4" />}
				title="Materiales"
				count={materials.length}
				expanded={expandedSections.materials}
				onToggle={() => onToggleSection("materials")}
			>
				<ResourceTable
					rows={materials}
					columns={["Descripción", "Cantidad", "Unidad"]}
					onAdd={() => onMaterialsChange([...materials, emptyMaterial()])}
					onRemove={(i) => onMaterialsChange(materials.filter((_, idx) => idx !== i))}
					renderRow={(row, i) => (
						<>
							<input
								type="text"
								value={row.description}
								onChange={(e) => {
									const updated = [...materials];
									updated[i] = { ...row, description: e.target.value };
									onMaterialsChange(updated);
								}}
								placeholder="Descripción del material"
								className="field-input text-sm"
								aria-label={`Material, fila ${i + 1} — descripción`}
							/>
							<input
								type="number"
								min={1}
								value={row.quantity}
								onChange={(e) => {
									const updated = [...materials];
									updated[i] = { ...row, quantity: Number(e.target.value) };
									onMaterialsChange(updated);
								}}
								className="field-input w-20 text-sm"
								aria-label={`Material, fila ${i + 1} — cantidad`}
							/>
							<input
								type="text"
								value={row.unit ?? "und"}
								onChange={(e) => {
									const updated = [...materials];
									updated[i] = { ...row, unit: e.target.value };
									onMaterialsChange(updated);
								}}
								placeholder="und"
								className="field-input w-20 text-sm"
								aria-label={`Material, fila ${i + 1} — unidad`}
							/>
						</>
					)}
				/>
			</CollapsibleSection>

			{/* Tools section */}
			<CollapsibleSection
				icon={<Wrench className="size-4" />}
				title="Herramientas"
				count={tools.length}
				expanded={expandedSections.tools}
				onToggle={() => onToggleSection("tools")}
			>
				<ResourceTable
					rows={tools}
					columns={["Herramienta", "Cant.", "Disponible"]}
					onAdd={() => onToolsChange([...tools, emptyTool()])}
					onRemove={(i) => onToolsChange(tools.filter((_, idx) => idx !== i))}
					renderRow={(row: PlanningTool, i) => (
						<>
							<input
								type="text"
								value={row.name}
								onChange={(e) => {
									const updated = [...tools];
									updated[i] = { ...row, name: e.target.value };
									onToolsChange(updated);
								}}
								placeholder="Nombre de la herramienta"
								className="field-input text-sm"
								aria-label={`Herramienta, fila ${i + 1} — nombre`}
							/>
							<input
								type="number"
								min={1}
								value={row.quantity}
								onChange={(e) => {
									const updated = [...tools];
									updated[i] = { ...row, quantity: Number(e.target.value) };
									onToolsChange(updated);
								}}
								className="field-input w-20 text-sm"
								aria-label={`Herramienta, fila ${i + 1} — cantidad`}
							/>
							<button
								type="button"
								onClick={() => {
									const updated = [...tools];
									updated[i] = { ...row, available: !row.available };
									onToolsChange(updated);
								}}
								aria-label={`Herramienta, fila ${i + 1} — cambiar disponibilidad`}
								className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
									row.available
										? "bg-success-bg text-brand-annotate hover:bg-green-200"
										: "bg-surface-soft text-steel hover:bg-surface-soft"
								}`}
							>
								{row.available ? (
									<CheckCircle className="size-3" />
								) : (
									<XCircle className="size-3" />
								)}
								{row.available ? "Sí" : "No"}
							</button>
						</>
					)}
				/>
			</CollapsibleSection>

			{/* Equipment section */}
			<CollapsibleSection
				icon={<Zap className="size-4" />}
				title="Equipos"
				count={equipment.length}
				expanded={expandedSections.equipment}
				onToggle={() => onToggleSection("equipment")}
			>
				<ResourceTable
					rows={equipment}
					columns={["Equipo", "Cant.", "Disponible", "Certif."]}
					onAdd={() => onEquipmentChange([...equipment, emptyEquipment()])}
					onRemove={(i) => onEquipmentChange(equipment.filter((_, idx) => idx !== i))}
					renderRow={(row: PlanningEquipment, i) => (
						<>
							<input
								type="text"
								value={row.name}
								onChange={(e) => {
									const updated = [...equipment];
									updated[i] = { ...row, name: e.target.value };
									onEquipmentChange(updated);
								}}
								placeholder="Nombre del equipo"
								className="field-input text-sm"
								aria-label={`Equipo, fila ${i + 1} — nombre`}
							/>
							<input
								type="number"
								min={1}
								value={row.quantity}
								onChange={(e) => {
									const updated = [...equipment];
									updated[i] = { ...row, quantity: Number(e.target.value) };
									onEquipmentChange(updated);
								}}
								className="field-input w-20 text-sm"
								aria-label={`Equipo, fila ${i + 1} — cantidad`}
							/>
							<button
								type="button"
								onClick={() => {
									const updated = [...equipment];
									updated[i] = { ...row, available: !row.available };
									onEquipmentChange(updated);
								}}
								aria-label={`Equipo, fila ${i + 1} — cambiar disponibilidad`}
								className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
									row.available ? "bg-success-bg text-brand-annotate" : "bg-surface-soft text-steel"
								}`}
							>
								{row.available ? "Sí" : "No"}
							</button>
							<button
								type="button"
								onClick={() => {
									const updated = [...equipment];
									updated[i] = {
										...row,
										certificateRequired: !row.certificateRequired,
									};
									onEquipmentChange(updated);
								}}
								aria-label={`Equipo, fila ${i + 1} — certificado requerido`}
								className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
									row.certificateRequired
										? "bg-amber-100 text-brand-warn"
										: "bg-surface-soft text-steel"
								}`}
							>
								{row.certificateRequired ? "Sí" : "No"}
							</button>
						</>
					)}
				/>
			</CollapsibleSection>
		</>
	);
}
