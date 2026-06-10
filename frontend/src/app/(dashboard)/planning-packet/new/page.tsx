"use client";

import type {
	CreatePlanningPacketInput,
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Loader2,
	Package,
	Plus,
	Save,
	Search,
	Shield,
	Trash2,
	Users,
	Wrench,
	XCircle,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { type FormEvent, Suspense, useRef, useState } from "react";
import { useCreatePlanningPacket } from "@/modules/planning/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { useServiceCaseList } from "@/modules/service-cases/queries";

// ─── Work type → kit suggestion mapping ─────────────────────────────────────
const KIT_SUGGESTIONS: Record<
	string,
	{
		label: string;
		tools: PlanningTool[];
		materials: PlanningResourceLine[];
		safetyElements: PlanningResourceLine[];
		ppe: string[];
	}
> = {
	cctv: {
		label: "Kit CCTV — Mantenimiento preventivo",
		tools: [
			{ name: "Multímetro digital", quantity: 1, available: false },
			{ name: "Destornilladores juego", quantity: 1, available: false },
			{ name: "Cámara de inspección", quantity: 1, available: false },
			{ name: "Limpiador óptico", quantity: 1, available: false },
			{ name: "Cable UTP y ponchadora", quantity: 1, available: false },
			{ name: "Escalera de fibra 8m", quantity: 1, available: false },
		],
		materials: [
			{ description: "Terminales BNC", quantity: 10, unit: "und" },
			{ description: "Cinta aislante", quantity: 2, unit: "rollo" },
			{ description: "Bridas plásticas 15cm", quantity: 20, unit: "und" },
			{ description: "Silicona impermeabilizante", quantity: 1, unit: "und" },
		],
		safetyElements: [
			{ description: "Casco dieléctrico", quantity: 2, unit: "und" },
			{ description: "Guantes dieléctricos clase 0", quantity: 2, unit: "par" },
			{ description: "Botas dieléctricas", quantity: 2, unit: "par" },
			{ description: "Arnés de seguridad completo", quantity: 2, unit: "und" },
			{ description: "Gafas de seguridad", quantity: 2, unit: "und" },
		],
		ppe: [
			"Casco dieléctrico",
			"Guantes dieléctricos",
			"Botas dieléctricas",
			"Arnés (trabajo en altura)",
			"Gafas de seguridad",
		],
	},
	lineas_de_vida: {
		label: "Kit Líneas de vida verticales",
		tools: [
			{ name: "Torquímetro", quantity: 1, available: false },
			{ name: "Medidor de tensión de cable", quantity: 1, available: false },
			{ name: "Calibrador vernier", quantity: 1, available: false },
			{ name: "Llave allen set", quantity: 1, available: false },
			{ name: "Cámara fotográfica", quantity: 1, available: false },
		],
		materials: [
			{ description: "Pernos de acero inox M10×50", quantity: 20, unit: "und" },
			{ description: "Tuercas M10 inox", quantity: 20, unit: "und" },
			{ description: "Arandelas planas M10 inox", quantity: 40, unit: "und" },
			{ description: "Grasa de protección anticorrosión", quantity: 1, unit: "und" },
		],
		safetyElements: [
			{ description: "Casco dieléctrico", quantity: 2, unit: "und" },
			{ description: "Arnés de seguridad tipo X", quantity: 2, unit: "und" },
			{ description: "Eslinga de posicionamiento 1.2m", quantity: 2, unit: "und" },
			{ description: "Conector absorbedor de impacto", quantity: 2, unit: "und" },
			{ description: "Botas con puntera metálica", quantity: 2, unit: "par" },
		],
		ppe: [
			"Casco con barbiquejo",
			"Arnés tipo X certificado",
			"Eslinga de posicionamiento",
			"Absorbedor de impacto",
			"Botas con puntera",
		],
	},
	electricidad: {
		label: "Kit Eléctrico general",
		tools: [
			{ name: "Pinza amperimétrica", quantity: 1, available: false },
			{ name: "Megger o megóhmetro", quantity: 1, available: false },
			{ name: "Detector de tensión", quantity: 1, available: false },
			{ name: "Juego de llaves torx", quantity: 1, available: false },
			{ name: "Escalera dieléctrica", quantity: 1, available: false },
		],
		materials: [
			{ description: "Terminales preaislados juego", quantity: 1, unit: "juego" },
			{ description: "Cable AWG 12 THHN", quantity: 10, unit: "mt" },
			{ description: "Interruptores termomagnéticos 20A", quantity: 2, unit: "und" },
		],
		safetyElements: [
			{ description: "Casco dieléctrico clase E", quantity: 2, unit: "und" },
			{ description: "Guantes dieléctricos clase 2", quantity: 2, unit: "par" },
			{ description: "Tapete dieléctrico", quantity: 1, unit: "und" },
			{ description: "Lentes UV", quantity: 2, unit: "und" },
		],
		ppe: [
			"Casco dieléctrico clase E",
			"Guantes clase 2",
			"Tapete dieléctrico",
			"Lentes UV",
			"Ropa ignífuga",
		],
	},
};

const BUSINESS_UNIT_OPTIONS: Array<{ value: PlanningBusinessUnit; label: string }> = [
	{ value: "IT", label: "IT" },
	{ value: "MNT", label: "MNT" },
	{ value: "SC", label: "SC" },
	{ value: "GEN", label: "GEN" },
	{ value: "OTHER", label: "Otros" },
];

function emptyMaterial(): PlanningResourceLine {
	return { description: "", quantity: 1, unit: "und" };
}
function emptyTool(): PlanningTool {
	return { name: "", quantity: 1, available: false };
}
function emptyEquipment(): PlanningEquipment {
	return { name: "", quantity: 1, available: false, certificateRequired: false };
}
function emptySafetyEl(): PlanningResourceLine {
	return { description: "", quantity: 1, unit: "und" };
}

export default function PlanningPacketNewPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-12">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			}
		>
			<PlanningPacketNewPageContent />
		</Suspense>
	);
}

/** Detects kit suggestion from work type string — pure function, module-scope */
function detectKitFromWorkType(workType: string): string {
	const wt = workType.toLowerCase();
	if (wt.includes("cctv") || wt.includes("camara") || wt.includes("vigilancia")) {
		return "cctv";
	}
	if (wt.includes("linea") || wt.includes("vida") || wt.includes("lifeline")) {
		return "lineas_de_vida";
	}
	if (wt.includes("electric") || wt.includes("eléctric")) {
		return "electricidad";
	}
	return "";
}

function PlanningPacketNewPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get("serviceCaseId") ?? "");
	const [showCaseSelector, setShowCaseSelector] = useState(!selectedCaseId);

	const { data: casesData, isLoading: isCasesLoading } = useServiceCaseList();
	const {
		workflow,
		inheritedFields,
		isLoading: isContextLoading,
	} = useServiceCaseContext("step_05_planning", selectedCaseId);

	// Form state
	const [place, setPlace] = useState("");
	const [businessUnit, setBusinessUnit] = useState<PlanningBusinessUnit>("GEN");
	const [scope, setScope] = useState("");
	const [plannedDate, setPlannedDate] = useState("");
	const [responsibleName, setResponsibleName] = useState("");
	const [kitSuggestionKey] = useState("");
	const [materials, setMaterials] = useState<PlanningResourceLine[]>([]);
	const [tools, setTools] = useState<PlanningTool[]>([]);
	const [equipment, setEquipment] = useState<PlanningEquipment[]>([]);
	const [safetyElements, setSafetyElements] = useState<PlanningResourceLine[]>([]);
	const [workerReqs, setWorkerReqs] = useState<WorkerRequirements>({
		electricistas: 0,
		tecnicosTelecomunicacion: 0,
		instrumentistas: 0,
		obreros: 0,
	});
	const [astRequired, setAstRequired] = useState(true);
	const [ptwRequired, setPtwRequired] = useState(true);
	const [planningNotes, setPlanningNotes] = useState("");
	const [formError, setFormError] = useState("");

	// Expanded sections
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		tools: true,
		materials: true,
		equipment: false,
		safety: true,
		crew: true,
		docs: false,
	});

	const createMutation = useCreatePlanningPacket();

	const inheritedClientName = inheritedFields.find((f) => f.key === "clientName")?.value ?? "";
	const inheritedLocation = inheritedFields.find((f) => f.key === "location")?.value ?? "";
	const inheritedWorkTypeName = inheritedFields.find((f) => f.key === "workTypeName")?.value ?? "";
	const inheritedScope = inheritedFields.find((f) => f.key === "approvedScope")?.value ?? "";
	const orderId = workflow?.orderId ?? "";

	function toggleSection(key: string) {
		setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function applyKitSuggestion(key: string) {
		const kit = KIT_SUGGESTIONS[key];
		if (!kit) {
			return;
		}
		setTools(kit.tools.map((t) => ({ ...t })));
		setMaterials(kit.materials.map((m) => ({ ...m })));
		setSafetyElements(kit.safetyElements.map((s) => ({ ...s })));
		if (inheritedWorkTypeName && !scope) {
			setScope(
				inheritedScope || `Mantenimiento de ${inheritedWorkTypeName} — ${inheritedLocation}`,
			);
		}
	}

	// Auto-suggest kit when inherited work type arrives
	const autoSuggestedKey = inheritedWorkTypeName
		? detectKitFromWorkType(inheritedWorkTypeName)
		: "";

	// Initialize scope from inherited fields if empty
	if (inheritedScope && !scope && !isContextLoading) {
		setScope(inheritedScope);
	}
	if (inheritedLocation && !place && !isContextLoading) {
		setPlace(inheritedLocation);
	}

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setFormError("");

		if (!orderId) {
			setFormError(
				"Este caso de servicio no tiene una orden de trabajo vinculada. Complete los pasos previos (propuesta y PO) primero.",
			);
			return;
		}

		if (!scope || scope.trim().length < 20) {
			setFormError("El alcance debe tener al menos 20 caracteres.");
			return;
		}

		const payload: CreatePlanningPacketInput = {
			workOrderId: orderId,
			responsibleInspectorName: responsibleName.trim() || undefined,
			place: place.trim() || undefined,
			plannedDate: plannedDate ? new Date(plannedDate).toISOString() : undefined,
			businessUnit,
			scope: scope.trim(),
			materials: materials.filter((m) => m.description.trim()),
			tools: tools.filter((t) => t.name.trim()),
			equipment: equipment.filter((e) => e.name.trim()),
			safetyElements: safetyElements.filter((s) => s.description.trim()),
			workerRequirements: workerReqs,
			astRequired,
			ptwRequired,
			planningNotes: planningNotes.trim() || undefined,
		};

		createMutation.mutate(payload, {
			onSuccess: (response) => {
				const id = (response as { data?: { _id?: string } }).data?._id;
				if (id) {
					router.push(`/planning-packet/${id}?serviceCaseId=${selectedCaseId}`);
				} else {
					router.push(`/service-cases/${selectedCaseId}`);
				}
			},
			onError: (err) => {
				setFormError((err as Error).message || "Error al crear la planeación.");
			},
		});
	}

	// ─── Case Selector ─────────────────────────────────────────────────────────
	if (showCaseSelector) {
		return (
			<section className="space-y-6" aria-labelledby="planning-select-title">
				<header className="space-y-3">
					<Link
						href="/service-cases"
						className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
					>
						<ArrowLeft className="size-4" />
						Volver a casos
					</Link>
					<div>
						<p className="text-sm font-medium text-[var(--color-brand)]">Paso 5 / Planeación</p>
						<h1
							id="planning-select-title"
							className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
						>
							Seleccionar caso de servicio
						</h1>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							Seleccione el caso con orden de compra aprobada para iniciar la planeación.
						</p>
					</div>
				</header>

				{isCasesLoading ? (
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
					</div>
				) : (
					<div className="grid gap-3">
						{(casesData?.items ?? []).length === 0 ? (
							<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center">
								<Search className="mx-auto size-8 text-[var(--text-muted)]" />
								<p className="mt-3 text-sm text-[var(--text-secondary)]">
									No hay casos disponibles con PO aprobada.
								</p>
							</div>
						) : (
							(casesData?.items ?? []).map((c) => (
								<button
									key={c._id}
									type="button"
									onClick={() => {
										setSelectedCaseId(c._id);
										setShowCaseSelector(false);
									}}
									className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-left transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
								>
									<div>
										<p className="font-semibold text-[var(--text-primary)]">{c.clientName}</p>
										<p className="mt-0.5 text-sm text-[var(--text-muted)]">
											{c.code} · {c.currentStage}
										</p>
									</div>
									<span className="text-sm font-medium text-[var(--color-brand)]">
										Seleccionar →
									</span>
								</button>
							))
						)}
					</div>
				)}
			</section>
		);
	}

	// ─── Planning Form ──────────────────────────────────────────────────────────
	return (
		<section className="space-y-6" aria-labelledby="planning-new-title">
			<header className="space-y-3">
				<div className="flex items-center justify-between">
					<Link
						href="/service-cases"
						className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
					>
						<ArrowLeft className="size-4" />
						Volver a casos
					</Link>
					<button
						type="button"
						onClick={() => setShowCaseSelector(true)}
						className="text-sm font-medium text-[var(--color-brand)] underline"
					>
						Cambiar caso
					</button>
				</div>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 5 / Planeación</p>
					<h1
						id="planning-new-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Planeación de obra
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{inheritedClientName
							? `${inheritedClientName} · ${inheritedLocation}`
							: "Complete la planeación antes de iniciar ejecución en campo."}
					</p>
				</div>
			</header>

			{isContextLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			) : (
				<>
					{/* Inherited context banner */}
					{inheritedFields.length > 0 && (
						<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
							<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
								Datos heredados del caso
							</p>
							<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{inheritedFields.map((f) => (
									<div key={f.key} className="rounded-[var(--radius-md)] bg-white/70 px-3 py-2">
										<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
											{f.label}
										</p>
										<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)] truncate">
											{f.value}
										</p>
										<p className="text-[9px] text-[var(--color-brand)]">↑ {f.sourceStepLabel}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Kit suggestion banner */}
					{(autoSuggestedKey || kitSuggestionKey) && (
						<div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-sm font-semibold text-amber-900">
										Kit típico sugerido para: {inheritedWorkTypeName}
									</p>
									<p className="mt-0.5 text-xs text-amber-700">
										{KIT_SUGGESTIONS[autoSuggestedKey || kitSuggestionKey]?.label}
									</p>
								</div>
								<button
									type="button"
									onClick={() => applyKitSuggestion(autoSuggestedKey || kitSuggestionKey)}
									className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
								>
									<Package className="size-3.5" />
									Aplicar kit
								</button>
							</div>
						</div>
					)}

					{/* Errors */}
					{(formError || createMutation.isError) && (
						<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
							<AlertTriangle className="mt-0.5 size-4 shrink-0" />
							<p>{formError || "No se pudo crear la planeación."}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* General data */}
						<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
							<h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
								Datos generales
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField label="Responsable de inspección" required htmlFor="responsible-name">
									<input
										id="responsible-name"
										type="text"
										value={responsibleName}
										onChange={(e) => setResponsibleName(e.target.value)}
										placeholder="ING. RESIDENTE / SUPERVISOR"
										className="field-input"
									/>
								</FormField>
								<FormField label="Lugar / sitio" required htmlFor="place">
									<input
										id="place"
										type="text"
										value={place}
										onChange={(e) => setPlace(e.target.value)}
										placeholder={inheritedLocation || "Ubicación de ejecución"}
										className="field-input"
									/>
								</FormField>
								<FormField label="Fecha planeada" htmlFor="planned-date">
									<input
										id="planned-date"
										type="datetime-local"
										value={plannedDate}
										onChange={(e) => setPlannedDate(e.target.value)}
										className="field-input"
									/>
								</FormField>
								<FormField label="Unidad de negocio" required>
									<select
										id="businessUnit"
										value={businessUnit}
										onChange={(e) => setBusinessUnit(e.target.value as PlanningBusinessUnit)}
										className="field-input"
										aria-label="Unidad de negocio"
									>
										{BUSINESS_UNIT_OPTIONS.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</FormField>
							</div>
							<div className="mt-4">
								<FormField label="Alcance de la actividad" required htmlFor="scope">
									<textarea
										id="scope"
										value={scope}
										onChange={(e) => setScope(e.target.value)}
										rows={3}
										placeholder="Descripción detallada del alcance de la obra/actividad..."
										className="field-input resize-none"
									/>
									<p className="mt-1 text-xs text-[var(--text-muted)]">
										Mínimo 20 caracteres. {scope.length}/3000
									</p>
								</FormField>
							</div>
						</div>

						{/* Materials section */}
						<CollapsibleSection
							icon={<Package className="size-4" />}
							title="Materiales"
							count={materials.length}
							expanded={expandedSections.materials}
							onToggle={() => toggleSection("materials")}
						>
							<ResourceTable
								rows={materials}
								columns={["Descripción", "Cantidad", "Unidad"]}
								onAdd={() => setMaterials((prev) => [...prev, emptyMaterial()])}
								onRemove={(i) => setMaterials((prev) => prev.filter((_, idx) => idx !== i))}
								renderRow={(row, i) => (
									<>
										<input
											type="text"
											value={row.description}
											onChange={(e) => {
												const updated = [...materials];
												updated[i] = { ...row, description: e.target.value };
												setMaterials(updated);
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
												setMaterials(updated);
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
												setMaterials(updated);
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
							onToggle={() => toggleSection("tools")}
						>
							<ResourceTable
								rows={tools}
								columns={["Herramienta", "Cant.", "Disponible"]}
								onAdd={() => setTools((prev) => [...prev, emptyTool()])}
								onRemove={(i) => setTools((prev) => prev.filter((_, idx) => idx !== i))}
								renderRow={(row, i) => (
									<>
										<input
											type="text"
											value={row.name}
											onChange={(e) => {
												const updated = [...tools];
												updated[i] = { ...row, name: e.target.value };
												setTools(updated);
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
												setTools(updated);
											}}
											className="field-input w-20 text-sm"
											aria-label={`Herramienta, fila ${i + 1} — cantidad`}
										/>
										<button
											type="button"
											onClick={() => {
												const updated = [...tools];
												updated[i] = { ...row, available: !row.available };
												setTools(updated);
											}}
											aria-label={`Herramienta, fila ${i + 1} — cambiar disponibilidad`}
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
												row.available
													? "bg-green-100 text-green-700 hover:bg-green-200"
													: "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
							onToggle={() => toggleSection("equipment")}
						>
							<ResourceTable
								rows={equipment}
								columns={["Equipo", "Cant.", "Disponible", "Certif."]}
								onAdd={() => setEquipment((prev) => [...prev, emptyEquipment()])}
								onRemove={(i) => setEquipment((prev) => prev.filter((_, idx) => idx !== i))}
								renderRow={(row, i) => (
									<>
										<input
											type="text"
											value={row.name}
											onChange={(e) => {
												const updated = [...equipment];
												updated[i] = { ...row, name: e.target.value };
												setEquipment(updated);
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
												setEquipment(updated);
											}}
											className="field-input w-20 text-sm"
											aria-label={`Equipo, fila ${i + 1} — cantidad`}
										/>
										<button
											type="button"
											onClick={() => {
												const updated = [...equipment];
												updated[i] = { ...row, available: !row.available };
												setEquipment(updated);
											}}
											aria-label={`Equipo, fila ${i + 1} — cambiar disponibilidad`}
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
												row.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
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
												setEquipment(updated);
											}}
											aria-label={`Equipo, fila ${i + 1} — certificado requerido`}
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
												row.certificateRequired
													? "bg-amber-100 text-amber-700"
													: "bg-gray-100 text-gray-500"
											}`}
										>
											{row.certificateRequired ? "Sí" : "No"}
										</button>
									</>
								)}
							/>
						</CollapsibleSection>

						{/* Safety elements */}
						<CollapsibleSection
							icon={<Shield className="size-4" />}
							title="Elementos de seguridad (EPP)"
							count={safetyElements.length}
							expanded={expandedSections.safety}
							onToggle={() => toggleSection("safety")}
						>
							<ResourceTable
								rows={safetyElements}
								columns={["Descripción", "Cantidad", "Unidad"]}
								onAdd={() => setSafetyElements((prev) => [...prev, emptySafetyEl()])}
								onRemove={(i) => setSafetyElements((prev) => prev.filter((_, idx) => idx !== i))}
								renderRow={(row, i) => (
									<>
										<input
											type="text"
											value={row.description}
											onChange={(e) => {
												const updated = [...safetyElements];
												updated[i] = { ...row, description: e.target.value };
												setSafetyElements(updated);
											}}
											placeholder="EPP / Elemento de seguridad"
											className="field-input text-sm"
											aria-label={`EPP, fila ${i + 1} — descripción`}
										/>
										<input
											type="number"
											min={1}
											value={row.quantity}
											onChange={(e) => {
												const updated = [...safetyElements];
												updated[i] = { ...row, quantity: Number(e.target.value) };
												setSafetyElements(updated);
											}}
											className="field-input w-20 text-sm"
											aria-label={`EPP, fila ${i + 1} — cantidad`}
										/>
										<input
											type="text"
											value={row.unit ?? "und"}
											onChange={(e) => {
												const updated = [...safetyElements];
												updated[i] = { ...row, unit: e.target.value };
												setSafetyElements(updated);
											}}
											placeholder="und"
											className="field-input w-20 text-sm"
											aria-label={`EPP, fila ${i + 1} — unidad`}
										/>
									</>
								)}
							/>
						</CollapsibleSection>

						{/* Crew requirements */}
						<CollapsibleSection
							icon={<Users className="size-4" />}
							title="Número de trabajadores"
							expanded={expandedSections.crew}
							onToggle={() => toggleSection("crew")}
						>
							<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
								{(
									[
										{
											key: "electricistas" as keyof WorkerRequirements,
											label: "Electricistas",
										},
										{
											key: "tecnicosTelecomunicacion" as keyof WorkerRequirements,
											label: "Téc. Telecomunicación",
										},
										{
											key: "instrumentistas" as keyof WorkerRequirements,
											label: "Instrumentistas",
										},
										{ key: "obreros" as keyof WorkerRequirements, label: "Obreros" },
									] satisfies Array<{ key: keyof WorkerRequirements; label: string }>
								).map(({ key, label }) => (
									<FormField key={key} label={label} htmlFor={`worker-${key}`}>
										<input
											id={`worker-${key}`}
											type="number"
											min={0}
											max={50}
											value={workerReqs[key]}
											onChange={(e) =>
												setWorkerReqs((prev) => ({
													...prev,
													[key]: Number(e.target.value),
												}))
											}
											className="field-input w-full"
										/>
									</FormField>
								))}
							</div>
						</CollapsibleSection>

						{/* Documents required */}
						<CollapsibleSection
							icon={<Shield className="size-4" />}
							title="Documentos de apoyo requeridos"
							expanded={expandedSections.docs}
							onToggle={() => toggleSection("docs")}
						>
							<div className="grid gap-3 sm:grid-cols-2">
								<label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3 cursor-pointer">
									<input
										type="checkbox"
										checked={astRequired}
										onChange={(e) => setAstRequired(e.target.checked)}
										className="size-4 rounded"
									/>
									<div>
										<p className="text-sm font-medium text-[var(--text-primary)]">
											ATS (Análisis de Trabajo Seguro)
										</p>
										<p className="text-xs text-[var(--text-muted)]">
											Requerido para tareas de riesgo
										</p>
									</div>
								</label>
								<label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3 cursor-pointer">
									<input
										type="checkbox"
										checked={ptwRequired}
										onChange={(e) => setPtwRequired(e.target.checked)}
										className="size-4 rounded"
									/>
									<div>
										<p className="text-sm font-medium text-[var(--text-primary)]">
											PTW (Permiso de Trabajo)
										</p>
										<p className="text-xs text-[var(--text-muted)]">Permiso formal de trabajo</p>
									</div>
								</label>
							</div>
						</CollapsibleSection>

						{/* Notes */}
						<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
							<FormField label="Observaciones adicionales" htmlFor="planning-notes">
								<textarea
									id="planning-notes"
									value={planningNotes}
									onChange={(e) => setPlanningNotes(e.target.value)}
									rows={3}
									placeholder="Notas, consideraciones especiales, restricciones del sitio..."
									className="field-input resize-none"
								/>
							</FormField>
						</div>

						{/* Readiness summary */}
						<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-4">
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
								Resumen de readiness
							</p>
							<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
								<ReadinessBadge
									label="Materiales"
									ready={materials.length > 0}
									count={materials.length}
								/>
								<ReadinessBadge
									label="Herramientas"
									ready={tools.length > 0}
									count={tools.length}
								/>
								<ReadinessBadge
									label="EPP"
									ready={safetyElements.length > 0}
									count={safetyElements.length}
								/>
								<ReadinessBadge
									label="Trabajadores"
									ready={Object.values(workerReqs).some((v) => v > 0)}
									count={Object.values(workerReqs).reduce((a, b) => a + b, 0)}
								/>
							</div>
						</div>

						{/* Submit */}
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
							<button
								type="button"
								onClick={() => setShowCaseSelector(true)}
								className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 text-sm font-medium text-[var(--text-primary)]"
							>
								Cambiar caso
							</button>
							<div className="flex gap-3">
								{selectedCaseId && (
									<Link
										href={`/service-cases/${selectedCaseId}`}
										className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 text-sm font-medium text-[var(--text-primary)]"
									>
										Ver caso
									</Link>
								)}
								<button
									type="submit"
									disabled={createMutation.isPending}
									className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
								>
									{createMutation.isPending ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Save className="size-4" />
									)}
									Guardar planeación
								</button>
							</div>
						</div>
					</form>
				</>
			)}
		</section>
	);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// react-doctor(false-positive): control-has-associated-label — los inputs envueltos
// por FormField SÍ tienen <label htmlFor> asociado (renderizado aquí); el análisis
// estático no traza la asociación a través del wrapper.
function FormField({
	label,
	required,
	htmlFor,
	children,
}: {
	label: string;
	required?: boolean;
	htmlFor?: string;
	children: ReactNode;
}) {
	const labelEl = (
		<>
			{label}
			{required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
		</>
	);
	return (
		<div className="grid gap-1.5">
			{htmlFor ? (
				<label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text-primary)]">
					{labelEl}
				</label>
			) : (
				<span className="text-sm font-medium text-[var(--text-primary)]">{labelEl}</span>
			)}
			{children}
		</div>
	);
}

function CollapsibleSection({
	icon,
	title,
	count,
	expanded,
	onToggle,
	children,
}: {
	icon: ReactNode;
	title: string;
	count?: number;
	expanded: boolean;
	onToggle: () => void;
	children: ReactNode;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between p-4 text-left"
			>
				<span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-primary)]">
					<span className="text-[var(--color-brand)]">{icon}</span>
					{title}
					{count !== undefined && count > 0 && (
						<span className="rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-brand)]">
							{count}
						</span>
					)}
				</span>
				{expanded ? (
					<ChevronUp className="size-4 text-[var(--text-muted)]" />
				) : (
					<ChevronDown className="size-4 text-[var(--text-muted)]" />
				)}
			</button>
			{expanded && <div className="border-t border-[var(--border-subtle)] p-4">{children}</div>}
		</div>
	);
}

/** Named wrapper for a single ResourceTable row — avoids inline render calls */
function ResourceTableRow<T>({
	row,
	index: i,
	renderRow,
	onRemove,
}: {
	row: T;
	index: number;
	renderRow: (row: T, index: number) => ReactNode;
	onRemove: (index: number) => void;
}) {
	// Hoisted: renderRow es factory de celdas (ReactNode), no componente — no remonta
	const cells = renderRow(row, i);
	return (
		<tr className="group">
			{cells}
			<td className="pl-2 py-1.5">
				<button
					type="button"
					onClick={() => onRemove(i)}
					className="rounded p-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
				>
					<Trash2 className="size-3.5" />
				</button>
			</td>
		</tr>
	);
}

function ResourceTable<T>({
	rows,
	columns,
	onAdd,
	onRemove,
	renderRow,
}: {
	rows: T[];
	columns: string[];
	onAdd: () => void;
	onRemove: (index: number) => void;
	renderRow: (row: T, index: number) => ReactNode;
}) {
	// Stable key per position — generated once per row slot, survives re-renders
	const stableKeys = useRef<string[]>([]);
	if (stableKeys.current.length < rows.length) {
		for (let i = stableKeys.current.length; i < rows.length; i++) {
			stableKeys.current.push(
				typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
			);
		}
	}
	if (stableKeys.current.length > rows.length) {
		stableKeys.current.length = rows.length;
	}

	return (
		<div className="space-y-2">
			{rows.length > 0 && (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border-subtle)]">
								{columns.map((col) => (
									<th
										key={col}
										scope="col"
										className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]"
									>
										{col}
									</th>
								))}
								<th scope="col" className="pb-2 w-8">
									<span className="sr-only">Acciones</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{rows.map((row, i) => (
								<ResourceTableRow
									key={stableKeys.current[i]}
									row={row}
									index={i}
									renderRow={renderRow}
									onRemove={onRemove}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}
			<button
				type="button"
				onClick={onAdd}
				className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
			>
				<Plus className="size-3.5" />
				Agregar fila
			</button>
		</div>
	);
}

function ReadinessBadge({ label, ready, count }: { label: string; ready: boolean; count: number }) {
	return (
		<div
			className={`flex items-center gap-2 rounded-[var(--radius-md)] border p-2.5 ${
				ready
					? "border-green-200 bg-green-50"
					: "border-[var(--border-default)] bg-[var(--surface-primary)]"
			}`}
		>
			{ready ? (
				<CheckCircle className="size-4 text-green-600 shrink-0" />
			) : (
				<XCircle className="size-4 text-[var(--text-muted)] shrink-0" />
			)}
			<div>
				<p className="text-xs font-medium text-[var(--text-primary)]">{label}</p>
				<p className="text-[10px] text-[var(--text-muted)]">{count} registros</p>
			</div>
		</div>
	);
}
