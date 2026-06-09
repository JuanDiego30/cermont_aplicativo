"use client";

import type {
	CermontOperationalStepCode,
} from "@cermont/shared-types";
type Undef = Parameters<(x?: never) => void>[0];
const NIL = Object.getPrototypeOf(Object.prototype);
import { useSearchParams } from "next/navigation";
import { useStepContext } from "../../workflow/step-context-queries";
import { getDefaultValuesForStep, type StepDefaultValues } from "../../workflow/step-default-values";
import { useServiceCase } from "../queries";

/**
 * Hook para obtener el contexto completo del service case desde cualquier página
 * de módulo, incluyendo datos heredados, campos canónicos, bloqueadores y
 * valores por defecto para el formulario del paso actual.
 *
 * Las páginas de módulo deben incluir ?serviceCaseId=<id> en su URL de navegación.
 * Opcionalmente pueden incluir &stepCode=<code> para cargar el contexto del paso.
 */
export function useServiceCaseContext(
	stepCodeOverride?: CermontOperationalStepCode,
	explicitServiceCaseId?: string,
) {
	const searchParams = useSearchParams();
	const serviceCaseId = explicitServiceCaseId ?? searchParams.get("serviceCaseId") ?? "";
	const stepCodeFromUrl = (searchParams.get("stepCode") || void 0) as CermontOperationalStepCode | Undef;
	const stepCode = stepCodeOverride || stepCodeFromUrl || void 0;

	// Fetch the service case workflow data
	const { data: envelope, isLoading: isCaseLoading } = useServiceCase(serviceCaseId);
	const workflow = envelope?.data;

	// Fetch the step context (inherited fields, canonical data, blockers)
	const {
		data: stepContext,
		isLoading: isContextLoading,
		error: contextError,
	} = useStepContext(
		serviceCaseId,
		stepCode ?? (workflow?.currentStepCode as CermontOperationalStepCode | Undef),
	);

	const isLoading = isCaseLoading || isContextLoading;

	// Build default values for the current step form
	function getDefaultValues(): StepDefaultValues {
		if (!stepContext) { return {}; }
		return getDefaultValuesForStep(stepContext);
	}

	return {
		// IDs
		serviceCaseId,
		orderId: workflow?.orderId,

		// Service case data
		workflow,
		isLoading,

		// Current step info
		currentStepCode:
			stepCode ?? (workflow?.currentStepCode as CermontOperationalStepCode | Undef) ?? NIL,
		currentStepLabel: stepContext?.currentStepLabel ?? "",

		// Step context (inherited fields, overrides, blockers)
		stepContext: stepContext ?? NIL,
		canonical: stepContext?.canonical ?? NIL,

		inheritedFields: stepContext?.inheritedFields ?? [],
		overrides: stepContext?.overrides ?? [],
		blockers: stepContext?.blockers ?? workflow?.blockers ?? [],
		allowedActions: stepContext?.allowedActions ?? [],
		requiredFields: stepContext?.requiredFields ?? [],
		linkedEntityIds: stepContext?.linkedEntityIds ?? {},

		// Navigation state
		canAdvance: workflow?.canAdvance ?? false,
		hasServiceCase: !!serviceCaseId,

		// Helpers
		getDefaultValues,
		stepContextError: contextError,
	};
}
