import type {
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
	RequiredCertification,
	WorkerRequirements,
} from "@cermont/shared-types";

export type PlanningWizardStep = 1 | 2 | 3 | 4 | 5;

export interface PlanningWizardState {
	currentStep: PlanningWizardStep;
	place: string;
	plannedDate: string;
	businessUnit: PlanningBusinessUnit;
	responsibleName: string;
	scope: string;
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	equipment: PlanningEquipment[];
	safetyElements: PlanningResourceLine[];
	workerReqs: WorkerRequirements;
	astRequired: boolean;
	ptwRequired: boolean;
	planningNotes: string;
	certifications: RequiredCertification[];
}

type TextField = "place" | "plannedDate" | "responsibleName" | "scope" | "planningNotes";

export type PlanningWizardAction =
	| { type: "SET_STEP"; payload: PlanningWizardStep }
	| { type: "SET_FIELD"; payload: { field: TextField; value: string } }
	| { type: "SET_BUSINESS_UNIT"; payload: PlanningBusinessUnit }
	| {
			type: "SET_BOOLEAN";
			payload: { field: "astRequired" | "ptwRequired"; value: boolean };
	  }
	| { type: "SET_MATERIALS"; payload: PlanningResourceLine[] }
	| { type: "SET_TOOLS"; payload: PlanningTool[] }
	| { type: "SET_EQUIPMENT"; payload: PlanningEquipment[] }
	| { type: "SET_SAFETY_ELEMENTS"; payload: PlanningResourceLine[] }
	| { type: "SET_WORKER_REQS"; payload: WorkerRequirements }
	| { type: "SET_CERTIFICATIONS"; payload: RequiredCertification[] }
	| { type: "RESET" };

const INITIAL_PLANNING_WIZARD_STATE: PlanningWizardState = {
	currentStep: 1,
	place: "",
	plannedDate: "",
	businessUnit: "GEN",
	responsibleName: "",
	scope: "",
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
	astRequired: true,
	ptwRequired: true,
	planningNotes: "",
	certifications: [],
};

export function createInitialPlanningWizardState(
	inheritedLocation: string | undefined,
): PlanningWizardState {
	return {
		...INITIAL_PLANNING_WIZARD_STATE,
		place: inheritedLocation ?? "",
		materials: [],
		tools: [],
		equipment: [],
		safetyElements: [],
		workerReqs: { ...INITIAL_PLANNING_WIZARD_STATE.workerReqs },
		certifications: [],
	};
}

export function planningWizardReducer(
	state: PlanningWizardState,
	action: PlanningWizardAction,
): PlanningWizardState {
	switch (action.type) {
		case "SET_STEP":
			return { ...state, currentStep: action.payload };
		case "SET_FIELD":
			return { ...state, [action.payload.field]: action.payload.value };
		case "SET_BUSINESS_UNIT":
			return { ...state, businessUnit: action.payload };
		case "SET_BOOLEAN":
			return { ...state, [action.payload.field]: action.payload.value };
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
		case "SET_CERTIFICATIONS":
			return { ...state, certifications: action.payload };
		case "RESET":
			return createInitialPlanningWizardState("");
		default:
			return state;
	}
}
