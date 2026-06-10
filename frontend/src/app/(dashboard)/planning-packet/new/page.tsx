"use client";

import type {
	CreatePlanningPacketInput,
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import { AlertTriangle, ArrowLeft, Loader2, Save, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useReducer, useState } from "react";
import { useCreatePlanningPacket } from "@/modules/planning/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { useServiceCaseList } from "@/modules/service-cases/queries";
import { detectKitFromWorkType, KIT_SUGGESTIONS } from "./constants";
import type { InheritedFieldDef } from "./PlanningPacketBasicInfo";
import { PlanningPacketBasicInfo } from "./PlanningPacketBasicInfo";
import { PlanningPacketResources } from "./PlanningPacketResources";
import { PlanningPacketSafety } from "./PlanningPacketSafety";
import { PlanningPacketSchedule } from "./PlanningPacketSchedule";

// ── Resource state reducer ─────────────────────────────────────────────

type ResourceState = {
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	equipment: PlanningEquipment[];
	safetyElements: PlanningResourceLine[];
	workerReqs: WorkerRequirements;
};

type ResourceAction =
	| { type: "SET_MATERIALS"; payload: PlanningResourceLine[] }
	| { type: "SET_TOOLS"; payload: PlanningTool[] }
	| { type: "SET_EQUIPMENT"; payload: PlanningEquipment[] }
	| { type: "SET_SAFETY_ELEMENTS"; payload: PlanningResourceLine[] }
	| { type: "SET_WORKER_REQS"; payload: WorkerRequirements }
	| {
			type: "APPLY_KIT";
			payload: {
				tools: PlanningTool[];
				materials: PlanningResourceLine[];
				safetyElements: PlanningResourceLine[];
			};
	  };

const initialResourceState: ResourceState = {
	materials: [],
	tools: [],
	equipment: [],
	safetyElements: [],
	workerReqs: {
		electricistas: 0,
		tecnicosTelecomunicacion: 0,
		instrumentistas: 0,
		obreros: 0,
	},
};

function resourceReducer(state: ResourceState, action: ResourceAction): ResourceState {
	switch (action.type) {
		case "SET_MATERIALS":
			return { ...state, materials: action.payload };
		case "SET_TOOLS":
			return { ...state, tools: action.payload };
		case "SET_EQUIPMENT":
			return { ...state, equipment: action.payload };
		case "SET_SAFETY_ELEMENTS":
			return { ...state, safetyElements: action.payload };
		case "SET_WORKER_REQS":
			return { ...state, workerReqs: action.payload };
		case "APPLY_KIT":
			return {
				...state,
				tools: action.payload.tools.map((t) => ({ ...t })),
				materials: action.payload.materials.map((m) => ({ ...m })),
				safetyElements: action.payload.safetyElements.map((s) => ({ ...s })),
			};
		default:
			return state;
	}
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
	const kitSuggestionKey = "";
	const [resources, dispatchResources] = useReducer(resourceReducer, initialResourceState);
	const { materials, tools, equipment, safetyElements, workerReqs } = resources;
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

	const inheritedClientName =
		inheritedFields.find((f: { key: string }) => f.key === "clientName")?.value ?? "";
	const inheritedLocation =
		inheritedFields.find((f: { key: string }) => f.key === "location")?.value ?? "";
	const inheritedWorkTypeName =
		inheritedFields.find((f: { key: string }) => f.key === "workTypeName")?.value ?? "";
	const inheritedScope =
		inheritedFields.find((f: { key: string }) => f.key === "approvedScope")?.value ?? "";
	const orderId = workflow?.orderId ?? "";

	function toggleSection(key: string) {
		setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function applyKitSuggestion() {
		const key = autoSuggestedKey || kitSuggestionKey;
		const kit = KIT_SUGGESTIONS[key];
		if (!kit) {
			return;
		}
		dispatchResources({
			type: "APPLY_KIT",
			payload: {
				tools: kit.tools,
				materials: kit.materials,
				safetyElements: kit.safetyElements,
			},
		});
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
							(casesData?.items ?? []).map(
								(c: { _id: string; clientName: string; code: string; currentStage: string }) => (
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
								),
							)
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

			<PlanningPacketBasicInfo
				responsibleName={responsibleName}
				onResponsibleNameChange={setResponsibleName}
				place={place}
				onPlaceChange={setPlace}
				plannedDate={plannedDate}
				onPlannedDateChange={setPlannedDate}
				businessUnit={businessUnit}
				onBusinessUnitChange={setBusinessUnit}
				scope={scope}
				onScopeChange={setScope}
				inheritedLocation={inheritedLocation}
				inheritedWorkTypeName={inheritedWorkTypeName}
				isContextLoading={isContextLoading}
				autoSuggestedKey={autoSuggestedKey}
				kitSuggestionKey={kitSuggestionKey}
				onApplyKitSuggestion={applyKitSuggestion}
				inheritedFields={inheritedFields as unknown as InheritedFieldDef[]}
			/>

			{/* Errors */}
			{(formError || createMutation.isError) && (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
					<AlertTriangle className="mt-0.5 size-4 shrink-0" />
					<p>{formError || "No se pudo crear la planeación."}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<PlanningPacketResources
					materials={materials}
					onMaterialsChange={(m) => dispatchResources({ type: "SET_MATERIALS", payload: m })}
					tools={tools}
					onToolsChange={(t) => dispatchResources({ type: "SET_TOOLS", payload: t })}
					equipment={equipment}
					onEquipmentChange={(e) => dispatchResources({ type: "SET_EQUIPMENT", payload: e })}
					expandedSections={expandedSections}
					onToggleSection={toggleSection}
				/>

				<PlanningPacketSafety
					safetyElements={safetyElements}
					onSafetyElementsChange={(s) =>
						dispatchResources({ type: "SET_SAFETY_ELEMENTS", payload: s })
					}
					astRequired={astRequired}
					onAstRequiredChange={setAstRequired}
					ptwRequired={ptwRequired}
					onPtwRequiredChange={setPtwRequired}
					planningNotes={planningNotes}
					onPlanningNotesChange={setPlanningNotes}
					expandedSections={expandedSections}
					onToggleSection={toggleSection}
				/>

				<PlanningPacketSchedule
					workerReqs={workerReqs}
					onWorkerReqsChange={(w) => dispatchResources({ type: "SET_WORKER_REQS", payload: w })}
					materials={materials}
					tools={tools}
					safetyElements={safetyElements}
					expandedSections={expandedSections}
					onToggleSection={toggleSection}
				/>

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
		</section>
	);
}
