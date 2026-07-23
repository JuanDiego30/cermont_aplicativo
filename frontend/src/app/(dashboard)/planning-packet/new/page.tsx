"use client";

import type {
	CreatePlanningPacketInput,
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	WorkerRequirements,
} from "@cermont/shared-types";
import { AlertTriangle, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useReducer, useState } from "react";
import { useCreatePlanningPacket } from "@/modules/planning/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { useServiceCaseList } from "@/modules/service-cases/queries";
import { CaseSelector } from "./CaseSelector";
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

// ── Form state reducer ──────────────────────────────────────────────────

type FormState = {
	place: string;
	businessUnit: PlanningBusinessUnit;
	scope: string;
	plannedDate: string;
	responsibleName: string;
	astRequired: boolean;
	ptwRequired: boolean;
	planningNotes: string;
};

type FormAction =
	| { type: "SET_PLACE"; payload: string }
	| { type: "SET_BUSINESS_UNIT"; payload: PlanningBusinessUnit }
	| { type: "SET_SCOPE"; payload: string }
	| { type: "SET_PLANNED_DATE"; payload: string }
	| { type: "SET_RESPONSIBLE_NAME"; payload: string }
	| { type: "SET_AST_REQUIRED"; payload: boolean }
	| { type: "SET_PTW_REQUIRED"; payload: boolean }
	| { type: "SET_PLANNING_NOTES"; payload: string };

function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case "SET_PLACE":
			return { ...state, place: action.payload };
		case "SET_BUSINESS_UNIT":
			return { ...state, businessUnit: action.payload };
		case "SET_SCOPE":
			return { ...state, scope: action.payload };
		case "SET_PLANNED_DATE":
			return { ...state, plannedDate: action.payload };
		case "SET_RESPONSIBLE_NAME":
			return { ...state, responsibleName: action.payload };
		case "SET_AST_REQUIRED":
			return { ...state, astRequired: action.payload };
		case "SET_PTW_REQUIRED":
			return { ...state, ptwRequired: action.payload };
		case "SET_PLANNING_NOTES":
			return { ...state, planningNotes: action.payload };
		default:
			return state;
	}
}

const initialFormState: FormState = {
	place: "",
	businessUnit: "GEN",
	scope: "",
	plannedDate: "",
	responsibleName: "",
	astRequired: true,
	ptwRequired: true,
	planningNotes: "",
};

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
	const kitSuggestionKey = "";
	const [resources, dispatchResources] = useReducer(resourceReducer, initialResourceState);
	const { materials, tools, equipment, safetyElements, workerReqs } = resources;
	const [formState, dispatchForm] = useReducer(formReducer, initialFormState);
	const {
		place,
		businessUnit,
		scope,
		plannedDate,
		responsibleName,
		astRequired,
		ptwRequired,
		planningNotes,
	} = formState;
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
			dispatchForm({
				type: "SET_SCOPE",
				payload:
					inheritedScope || `Mantenimiento de ${inheritedWorkTypeName} — ${inheritedLocation}`,
			});
		}
	}

	// Auto-suggest kit when inherited work type arrives
	const autoSuggestedKey = inheritedWorkTypeName
		? detectKitFromWorkType(inheritedWorkTypeName)
		: "";

	// Initialize scope from inherited fields if empty
	if (inheritedScope && !scope && !isContextLoading) {
		dispatchForm({ type: "SET_SCOPE", payload: inheritedScope });
	}
	if (inheritedLocation && !place && !isContextLoading) {
		dispatchForm({ type: "SET_PLACE", payload: inheritedLocation });
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
			<CaseSelector
				isCasesLoading={isCasesLoading}
				casesData={casesData}
				onSelectCase={(caseId) => {
					setSelectedCaseId(caseId);
					setShowCaseSelector(false);
				}}
			/>
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
					<p className="text-sm font-medium text-slate">Paso 5 / Planeación</p>
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
				onResponsibleNameChange={(v) => dispatchForm({ type: "SET_RESPONSIBLE_NAME", payload: v })}
				place={place}
				onPlaceChange={(v) => dispatchForm({ type: "SET_PLACE", payload: v })}
				plannedDate={plannedDate}
				onPlannedDateChange={(v) => dispatchForm({ type: "SET_PLANNED_DATE", payload: v })}
				businessUnit={businessUnit}
				onBusinessUnitChange={(v) => dispatchForm({ type: "SET_BUSINESS_UNIT", payload: v })}
				scope={scope}
				onScopeChange={(v) => dispatchForm({ type: "SET_SCOPE", payload: v })}
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
					onAstRequiredChange={(v) => dispatchForm({ type: "SET_AST_REQUIRED", payload: v })}
					ptwRequired={ptwRequired}
					onPtwRequiredChange={(v) => dispatchForm({ type: "SET_PTW_REQUIRED", payload: v })}
					planningNotes={planningNotes}
					onPlanningNotesChange={(v) => dispatchForm({ type: "SET_PLANNING_NOTES", payload: v })}
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
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
					<button
						type="button"
						onClick={() => setShowCaseSelector(true)}
						className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
					>
						Cambiar caso
					</button>
					<div className="flex gap-3">
						{selectedCaseId && (
							<Link
								href={`/service-cases/${selectedCaseId}`}
								className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-primary)]"
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
