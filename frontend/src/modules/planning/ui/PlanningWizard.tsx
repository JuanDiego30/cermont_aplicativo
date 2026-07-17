"use client";

import type {
	CreatePlanningPacketInput,
	PlanningResponsible,
} from "@cermont/shared-types";
import { ArrowLeft, ArrowRight, CheckCircle, Save } from "lucide-react";
import { useReducer, useState } from "react";
import { getDefaultResponsibles } from "../helpers/planning-signatures.helpers";
import {
	createInitialPlanningWizardState,
	planningWizardReducer,
	type PlanningWizardStep,
} from "./planning-wizard.reducer";
import { CertificationsStep } from "./steps/CertificationsStep";
import { ResourcesStep } from "./steps/ResourcesStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SafetyStep } from "./steps/SafetyStep";
import { ScheduleStep } from "./steps/ScheduleStep";

interface PlanningWizardProps {
	workOrderId: string;
	inheritedLocation?: string;
	inheritedWorkTypeName?: string;
	onSubmit: (data: CreatePlanningPacketInput) => void;
	isPending: boolean;
	errorMessage?: string | null;
}

const STEP_HEADERS = [
	{ step: 1, label: "Cronograma" },
	{ step: 2, label: "Recursos" },
	{ step: 3, label: "Seguridad" },
	{ step: 4, label: "Certificaciones" },
	{ step: 5, label: "Revisión" },
] as const;

const NEXT_STEP: Record<PlanningWizardStep, PlanningWizardStep> = {
	1: 2,
	2: 3,
	3: 4,
	4: 5,
	5: 5,
};

const PREVIOUS_STEP: Record<PlanningWizardStep, PlanningWizardStep> = {
	1: 1,
	2: 1,
	3: 2,
	4: 3,
	5: 4,
};

export function PlanningWizard({
	workOrderId,
	inheritedLocation,
	inheritedWorkTypeName,
	onSubmit,
	isPending,
	errorMessage,
}: PlanningWizardProps) {
	const [state, dispatch] = useReducer(
		planningWizardReducer,
		inheritedLocation,
		createInitialPlanningWizardState,
	);

	// Responsibles Signature list
	const [responsibles] = useState<PlanningResponsible[]>(getDefaultResponsibles);

	// Step validation
	const getStepError = (): string | undefined => {
		if (state.currentStep === 1) {
			if (!state.responsibleName.trim()) {
				return "El nombre del responsable es obligatorio.";
			}
			if (!state.place.trim()) {
				return "El lugar de la obra es obligatorio.";
			}
			if (!state.plannedDate) {
				return "La fecha de ejecución es obligatoria.";
			}
			if (!state.scope || state.scope.trim().length < 20) {
				return `El alcance de la obra debe tener al menos 20 caracteres (actual: ${state.scope.trim().length}).`;
			}
		}
		return undefined;
	};

	const stepError = getStepError();

	const handleNext = () => {
		if (stepError) {
			return;
		}
		if (state.currentStep < 5) {
			dispatch({ type: "SET_STEP", payload: NEXT_STEP[state.currentStep] });
		}
	};

	const handleBack = () => {
		if (state.currentStep > 1) {
			dispatch({ type: "SET_STEP", payload: PREVIOUS_STEP[state.currentStep] });
		}
	};

	const handleSave = () => {
		// Sync the responsible inspector name into responsibles array if needed
		const updatedResponsibles = [...responsibles];
		const residentIdx = updatedResponsibles.findIndex((r) => r.role === "ingeniero_residente");
			if (residentIdx >= 0 && state.responsibleName) {
				updatedResponsibles[residentIdx] = {
					...updatedResponsibles[residentIdx],
					name: state.responsibleName,
				status: "assigned",
			};
		}

			onSubmit({
				workOrderId,
				responsibleInspectorName: state.responsibleName.trim() || undefined,
				place: state.place.trim() || undefined,
				plannedDate: state.plannedDate ? new Date(state.plannedDate).toISOString() : undefined,
				businessUnit: state.businessUnit,
				scope: state.scope.trim(),
				materials: state.materials.filter((m) => m.description.trim()),
				tools: state.tools.filter((t) => t.name.trim()),
				equipment: state.equipment.filter((e) => e.name.trim()),
				safetyElements: state.safetyElements.filter((s) => s.description.trim()),
				workerRequirements: state.workerReqs,
				responsibles: updatedResponsibles,
				requiredCertifications: state.certifications,
				astRequired: state.astRequired,
				ptwRequired: state.ptwRequired,
				planningNotes: state.planningNotes.trim() || undefined,
			});
	};
	return (
		<div className="space-y-6">
			{/* Progress Stepper */}
			<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm">
				<div className="flex items-center justify-between">
						{STEP_HEADERS.map((hdr, idx) => {
							const isCompleted = state.currentStep > hdr.step;
							const isActive = state.currentStep === hdr.step;
						return (
							<div key={hdr.step} className="flex items-center flex-1 last:flex-none">
								<div className="flex items-center gap-2">
									<div
										className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border-2 ${
											isCompleted
												? "bg-[var(--color-success-bg)] border-[var(--color-success)] text-[var(--color-success)]"
												: isActive
													? "border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)] ring-4 ring-[var(--color-brand)]/10"
													: "border-[var(--border-subtle)] text-[var(--text-muted)]"
										}`}
									>
										{isCompleted ? <CheckCircle className="size-4.5" /> : hdr.step}
									</div>
									<span
										className={`hidden sm:inline text-xs font-semibold ${
											isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
										}`}
									>
										{hdr.label}
									</span>
								</div>
									{idx < STEP_HEADERS.length - 1 && (
									<div
										className={`mx-4 h-0.5 flex-1 transition-all duration-300 ${
											isCompleted ? "bg-[var(--color-success)]" : "bg-[var(--border-subtle)]"
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Main Error Banner */}
			{(errorMessage || stepError) && (
				<div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]/20 p-4 text-xs text-[var(--color-danger)] font-medium flex items-center gap-2">
					<span className="font-bold uppercase">Aviso:</span>
					<span>{stepError || errorMessage}</span>
				</div>
			)}

			{/* Step Components */}
			<div className="min-h-[300px]">
					{state.currentStep === 1 && (
					<ScheduleStep
							place={state.place}
							onPlaceChange={(value) => dispatch({ type: "SET_FIELD", payload: { field: "place", value } })}
							plannedDate={state.plannedDate}
							onPlannedDateChange={(value) => dispatch({ type: "SET_FIELD", payload: { field: "plannedDate", value } })}
							businessUnit={state.businessUnit}
							onBusinessUnitChange={(value) => dispatch({ type: "SET_BUSINESS_UNIT", payload: value })}
							responsibleName={state.responsibleName}
							onResponsibleNameChange={(value) => dispatch({ type: "SET_FIELD", payload: { field: "responsibleName", value } })}
							scope={state.scope}
							onScopeChange={(value) => dispatch({ type: "SET_FIELD", payload: { field: "scope", value } })}
							materials={state.materials}
							tools={state.tools}
							equipment={state.equipment}
							safetyElements={state.safetyElements}
							workerReqs={state.workerReqs}
							astRequired={state.astRequired}
							ptwRequired={state.ptwRequired}
							requiredSignatureCount={responsibles.length}
							inheritedLocation={inheritedLocation}
						inheritedWorkTypeName={inheritedWorkTypeName}
					/>
				)}

					{state.currentStep === 2 && (
					<ResourcesStep
							materials={state.materials}
							onMaterialsChange={(value) => dispatch({ type: "SET_MATERIALS", payload: value })}
							tools={state.tools}
							onToolsChange={(value) => dispatch({ type: "SET_TOOLS", payload: value })}
							equipment={state.equipment}
							onEquipmentChange={(value) => dispatch({ type: "SET_EQUIPMENT", payload: value })}
							safetyElements={state.safetyElements}
							onSafetyElementsChange={(value) => dispatch({ type: "SET_SAFETY_ELEMENTS", payload: value })}
							workerReqs={state.workerReqs}
							onWorkerReqsChange={(value) => dispatch({ type: "SET_WORKER_REQS", payload: value })}
					/>
				)}

					{state.currentStep === 3 && (
					<SafetyStep
							astRequired={state.astRequired}
							onAstRequiredChange={(value) => dispatch({ type: "SET_BOOLEAN", payload: { field: "astRequired", value } })}
							ptwRequired={state.ptwRequired}
							onPtwRequiredChange={(value) => dispatch({ type: "SET_BOOLEAN", payload: { field: "ptwRequired", value } })}
							planningNotes={state.planningNotes}
							onPlanningNotesChange={(value) => dispatch({ type: "SET_FIELD", payload: { field: "planningNotes", value } })}
					/>
				)}

					{state.currentStep === 4 && (
					<CertificationsStep
							certifications={state.certifications}
							onCertificationsChange={(value) => dispatch({ type: "SET_CERTIFICATIONS", payload: value })}
					/>
				)}

					{state.currentStep === 5 && (
					<ReviewStep
							place={state.place}
							plannedDate={state.plannedDate}
							businessUnit={state.businessUnit}
							responsibleName={state.responsibleName}
							scope={state.scope}
							materials={state.materials}
							tools={state.tools}
							equipment={state.equipment}
							safetyElements={state.safetyElements}
							workerReqs={state.workerReqs}
						responsibles={responsibles}
							certifications={state.certifications}
							astRequired={state.astRequired}
							ptwRequired={state.ptwRequired}
							planningNotes={state.planningNotes}
					/>
				)}
			</div>

			{/* Wizard Footer Controls */}
			<div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-6">
				<button
					type="button"
					onClick={handleBack}
						disabled={state.currentStep === 1 || isPending}
					className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<ArrowLeft className="size-4" /> Anterior
				</button>

					{state.currentStep < 5 ? (
					<button
						type="button"
						onClick={handleNext}
						disabled={!!stepError || isPending}
						className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-green-deep)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
					>
						Siguiente <ArrowRight className="size-4" />
					</button>
				) : (
					<button
						type="button"
						onClick={handleSave}
						disabled={isPending}
						className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-green-deep)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
					>
						{isPending ? (
							<span className="flex items-center gap-2">Guardando...</span>
						) : (
							<>
								<Save className="size-4" /> Guardar Planeación
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}
