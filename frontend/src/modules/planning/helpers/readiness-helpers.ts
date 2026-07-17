import type {
	CrewMember,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningResponsible,
	PlanningTool,
	SupportDocument,
	WorkerRequirements,
} from "@cermont/shared-types";

interface RequiredCertification {
	certificationId?: string;
	name: string;
	requiredForRoles?: string[];
	verified?: boolean;
	expiresAt?: string;
}

export interface ReadinessCheck {
	key: string;
	label: string;
	passed: boolean;
	message: string;
	severity: "blocking" | "warning" | "info";
}

export interface ReadinessState {
	checks: ReadinessCheck[];
	passed: number;
	total: number;
	blocking: number;
	allPassed: boolean;
	score: number;
}

interface ReadinessInput {
	place: string;
	plannedDate: string;
	scope: string;
	materials: PlanningResourceLine[];
	tools: PlanningTool[];
	equipment: PlanningEquipment[];
	safetyElements: PlanningResourceLine[];
	workerReqs: WorkerRequirements;
	responsibles: PlanningResponsible[];
	crew?: CrewMember[];
	certifications?: RequiredCertification[];
	supportDocuments?: SupportDocument[];
	astRequired: boolean;
	ptwRequired: boolean;
	schedule?: { plannedStartAt?: string; plannedEndAt?: string };
}

const MIN_SCOPE_LENGTH = 20;
const RECOMMENDED_WORKER_COUNT = 2;

export function computeReadiness(state: ReadinessInput): ReadinessState {
	const checks: ReadinessCheck[] = [];

	checks.push({
		key: "place",
		label: "Lugar de trabajo definido",
		passed: state.place.trim().length > 0,
		message: state.place.trim() ? `Lugar: ${state.place}` : "Defina el lugar de la obra",
		severity: "blocking",
	});
	checks.push({
		key: "date",
		label: "Fecha planeada definida",
		passed: !!state.plannedDate || !!state.schedule?.plannedStartAt,
		message:
			state.plannedDate || state.schedule?.plannedStartAt
				? "Fecha definida"
				: "Seleccione la fecha de ejecución",
		severity: "blocking",
	});
	checks.push({
		key: "scope",
		label: "Alcance definido y completo",
		passed: state.scope.trim().length >= MIN_SCOPE_LENGTH,
		message:
			state.scope.trim().length >= MIN_SCOPE_LENGTH
				? `Alcance (${state.scope.length} caracteres)`
				: `Alcance debe tener al menos ${MIN_SCOPE_LENGTH} caracteres (actual: ${state.scope.trim().length})`,
		severity: "blocking",
	});

	const hasSchedule = !!(state.schedule?.plannedStartAt && state.schedule?.plannedEndAt);
	checks.push({
		key: "schedule_window",
		label: "Ventana de ejecución definida",
		passed: hasSchedule,
		message: hasSchedule
			? `Inicio: ${state.schedule?.plannedStartAt?.slice(0, 10)} — Fin: ${state.schedule?.plannedEndAt?.slice(0, 10)}`
			: "Defina la ventana de inicio y fin",
		severity: "blocking",
	});

	const hasTools = state.tools.some((t) => t.name.trim().length > 0);
	checks.push({
		key: "tools",
		label: "Herramientas definidas",
		passed: hasTools,
		message: hasTools
			? `${state.tools.filter((t) => t.name.trim()).length} herramienta(s) definida(s)`
			: "No hay herramientas — se recomienda al menos una",
		severity: hasTools ? "info" : "warning",
	});

	const hasMaterials = state.materials.some((m) => m.description.trim().length > 0);
	checks.push({
		key: "materials",
		label: "Materiales definidos",
		passed: hasMaterials,
		message: hasMaterials
			? `${state.materials.filter((m) => m.description.trim()).length} material(es) definido(s)`
			: "No hay materiales definidos",
		severity: "warning",
	});

	const hasSafety = state.safetyElements.some((s) => s.description.trim().length > 0);
	checks.push({
		key: "safety_elements",
		label: "Elementos de seguridad (EPP) definidos",
		passed: hasSafety,
		message: hasSafety
			? `${state.safetyElements.filter((s) => s.description.trim()).length} elemento(s) de seguridad`
			: "No hay EPP definidos — requisito obligatorio para campo",
		severity: "warning",
	});

	const totalWorkers =
		(state.workerReqs.electricistas ?? 0) +
		(state.workerReqs.tecnicosTelecomunicacion ?? 0) +
		(state.workerReqs.instrumentistas ?? 0) +
		(state.workerReqs.obreros ?? 0);
	checks.push({
		key: "workers",
		label: "Personal requerido definido",
		passed: totalWorkers >= RECOMMENDED_WORKER_COUNT,
		message:
			totalWorkers >= RECOMMENDED_WORKER_COUNT
				? `${totalWorkers} trabajador(es) asignado(s)`
				: `Asigne al menos ${RECOMMENDED_WORKER_COUNT} trabajador(es) (actual: ${totalWorkers})`,
		severity: "warning",
	});

	const crewCount = state.crew?.length ?? 0;
	checks.push({
		key: "crew_assigned",
		label: "Cuadrilla asignada",
		passed: crewCount > 0,
		message:
			crewCount > 0
				? `${crewCount} miembro(s) en cuadrilla`
				: "No hay miembros de cuadrilla asignados",
		severity: "blocking",
	});

	const hasSignatures = state.responsibles.some((r) => r.name && r.name.trim().length > 0);
	checks.push({
		key: "signatures",
		label: "Responsables / Firmas asignadas",
		passed: hasSignatures,
		message: hasSignatures
			? `${state.responsibles.filter((r) => r.name?.trim()).length} responsable(s) asignado(s)`
			: "Asigne al menos un responsable con firma",
		severity: "blocking",
	});

	const hasCertifications = (state.certifications?.length ?? 0) > 0;
	const verifiedCerts = state.certifications?.filter((c) => c.verified).length ?? 0;
	checks.push({
		key: "certifications",
		label: "Certificaciones de equipos/personal",
		passed: hasCertifications && verifiedCerts >= (state.certifications?.length ?? 0),
		message: hasCertifications
			? `${verifiedCerts}/${state.certifications?.length} certificaciones verificadas`
			: "No hay certificaciones registradas",
		severity: "blocking",
	});

	if (state.astRequired) {
		checks.push({
			key: "ast",
			label: "AST (Análisis Seguro de Trabajo) requerido",
			passed: true,
			message: "AST habilitado — debe completarse antes de ejecutar",
			severity: "info",
		});
	}
	if (state.ptwRequired) {
		checks.push({
			key: "ptw",
			label: "PTW (Permiso de Trabajo) requerido",
			passed: true,
			message: "PTW habilitado — debe gestionarse antes de ejecutar",
			severity: "info",
		});
	}

	const total = checks.length;
	const passed = checks.filter((c) => c.passed).length;
	const blocking = checks.filter((c) => c.severity === "blocking" && !c.passed).length;
	const allPassed = blocking === 0;
	const score = Math.round((passed / total) * 100);

	return { checks, passed, total, blocking, allPassed, score };
}
