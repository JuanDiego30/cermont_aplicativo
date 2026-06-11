/**
 * Kit Rules — Pure domain logic for kit lifecycle, readiness, and safety
 *
 * All functions are pure: no side effects, no I/O, no database calls.
 * These rules are consumed by the backend service layer and can be tested
 * in isolation without any infrastructure.
 */

export type KitStatus = "draft" | "active" | "archived" | "voided";
export type KitRiskLevel = "low" | "medium" | "high" | "critical";

export interface KitDomainModel {
	id: string;
	name: string;
	status: KitStatus;
	usageCount: number;
	isDefault: boolean;
	version: number;
	tools: KitItemDomainModel[];
	electricalTools: KitItemDomainModel[];
	constructionEquipment: KitItemDomainModel[];
	heightSafetyKit: KitItemDomainModel[];
	materials: KitItemDomainModel[];
	epp: KitItemDomainModel[];
	instruments: KitItemDomainModel[];
	vehicles: KitItemDomainModel[];
	documents: KitDocumentRequirementDomainModel[];
	checklists: KitChecklistRequirementDomainModel[];
	readinessRules: KitReadinessRuleDomainModel[];
	requiredCertifications: string[];
	requiredPermits: string[];
	requiredAst: boolean;
	riskLevel: KitRiskLevel;
	estimatedDurationHours?: number;
}

export interface KitItemDomainModel {
	id?: string;
	category: string;
	name: string;
	quantity: number;
	unit: string;
	isCritical: boolean;
	isOptional: boolean;
	requiresCertification: boolean;
}

export interface KitDocumentRequirementDomainModel {
	id?: string;
	name: string;
	isRequired: boolean;
}

export interface KitChecklistRequirementDomainModel {
	id?: string;
	name: string;
	isRequired: boolean;
}

export interface KitReadinessRuleDomainModel {
	id?: string;
	name: string;
	condition: string;
	severity: "warning" | "blocker";
	active: boolean;
}

// ─── Delete Rules ──────────────────────────────────────────────────────────

export type DeleteKitDecision =
	| { allowed: true; method: "physical" }
	| { allowed: true; method: "archive"; reasonRequired: boolean }
	| { allowed: false; reason: string };

/**
 * Determines whether a kit can be deleted and how.
 *
 * Rules:
 * - draft + unused → physical delete allowed
 * - active + unused → physical delete with strong confirmation
 * - used in planning/execution → archive only, never physical delete
 * - already archived/voided → no action needed
 */
export function canDeleteKit(kit: KitDomainModel): DeleteKitDecision {
	if (kit.status === "voided") {
		return { allowed: false, reason: "El kit ya está anulado." };
	}

	if (kit.status === "archived") {
		return {
			allowed: false,
			reason: "El kit ya está archivado. Puedes restaurarlo si es necesario.",
		};
	}

	if (kit.usageCount > 0) {
		return {
			allowed: true,
			method: "archive",
			reasonRequired: true,
		};
	}

	if (kit.status === "draft") {
		return { allowed: true, method: "physical" };
	}

	// active + unused → physical delete with confirmation
	return { allowed: true, method: "physical" };
}

// ─── Archive / Restore Rules ───────────────────────────────────────────────

export type ArchiveKitDecision =
	| { allowed: true; reasonRequired: boolean }
	| { allowed: false; reason: string };

export function canArchiveKit(kit: KitDomainModel): ArchiveKitDecision {
	if (kit.status === "archived") {
		return { allowed: false, reason: "El kit ya está archivado." };
	}
	if (kit.status === "voided") {
		return { allowed: false, reason: "No se puede archivar un kit anulado." };
	}
	if (kit.usageCount > 0) {
		return { allowed: true, reasonRequired: true };
	}
	return { allowed: true, reasonRequired: false };
}

export function canRestoreKit(kit: KitDomainModel): boolean {
	return kit.status === "archived";
}

export function canActivateKit(kit: KitDomainModel): boolean {
	return kit.status === "draft" || kit.status === "archived";
}

// ─── Applying Kit to Planning ──────────────────────────────────────────────

export type ApplyKitDecision =
	| { allowed: true; warnings: string[] }
	| { allowed: false; blockers: string[] };

export function canApplyKitToPlanning(
	kit: KitDomainModel,
	planningHasItems: { tools: number; materials: number; epp: number },
): ApplyKitDecision {
	const blockers: string[] = [];
	const warnings: string[] = [];

	if (kit.status !== "active") {
		blockers.push(`El kit está en estado "${kit.status}". Solo kits activos pueden aplicarse.`);
	}

	if (kit.version === 0) {
		blockers.push("El kit no tiene una versión válida.");
	}

	const criticalItems = getCriticalItemCount(kit);
	if (criticalItems === 0) {
		warnings.push("El kit no tiene ítems críticos definidos. Revisa la configuración.");
	}

	if (kit.epp.length === 0 && kit.riskLevel !== "low") {
		warnings.push(
			`El nivel de riesgo es "${kit.riskLevel}" pero no hay EPP configurado. Se recomienda agregar equipos de protección.`,
		);
	}

	if (kit.requiredAst && !planningHasItems.tools) {
		blockers.push("Se requiere AST pero no hay herramientas configuradas en la planeación.");
	}

	if (blockers.length > 0) {
		return { allowed: false, blockers };
	}

	return { allowed: true, warnings };
}

// ─── Readiness Calculation ─────────────────────────────────────────────────

export interface ReadinessResult {
	score: number; // 0-100
	status: "ready" | "missing_non_critical" | "missing_critical" | "blocked";
	missingCriticalItems: string[];
	missingNonCriticalItems: string[];
	messages: string[];
}

function checkMissingItems(allItems: KitItemDomainModel[]): {
	missingCritical: string[];
	missingNonCritical: string[];
} {
	const missingCritical: string[] = [];
	const missingNonCritical: string[] = [];

	for (const item of allItems) {
		if (item.isCritical && item.quantity === 0) {
			missingCritical.push(`${item.name} (${item.category})`);
		} else if (!item.isCritical && item.quantity === 0) {
			missingNonCritical.push(`${item.name} (${item.category})`);
		}
	}

	return { missingCritical, missingNonCritical };
}

function calculateReadinessMessages(kit: KitDomainModel, missingCritical: string[]): string[] {
	const msgs: string[] = [];

	if (missingCritical.length > 0) {
		msgs.push(`Faltan ${missingCritical.length} ítem(s) crítico(s): ${missingCritical.join(", ")}`);
	}

	if (kit.epp.length === 0) {
		msgs.push("No hay EPP configurado en el kit.");
	}

	if (kit.requiredCertifications.length > 0 && kit.documents.length === 0) {
		msgs.push("Se requieren certificaciones pero no hay documentos de soporte.");
	}

	if (kit.requiredAst && kit.checklists.length === 0) {
		msgs.push("Se requiere AST pero no hay checklists configurados.");
	}

	if (kit.epp.length === 0 && kit.riskLevel !== "low") {
		msgs.push(
			`BLOQUEO: Riesgo "${kit.riskLevel}" requiere EPP obligatorio. Configura los elementos de protección.`,
		);
	}

	return msgs;
}

function calculateReadinessStatus(
	missingCritical: string[],
	missingNonCritical: string[],
	kit: KitDomainModel,
): ReadinessResult["status"] {
	if (kit.epp.length === 0 && kit.riskLevel !== "low") {
		return "blocked";
	}
	if (missingCritical.length > 0) {
		return "missing_critical";
	}
	if (missingNonCritical.length > 0) {
		return "missing_non_critical";
	}
	return "ready";
}

function getAllKitItemsFlat(kit: KitDomainModel): KitItemDomainModel[] {
	return [
		...kit.tools,
		...kit.electricalTools,
		...kit.constructionEquipment,
		...kit.heightSafetyKit,
		...kit.materials,
		...kit.epp,
		...kit.instruments,
		...kit.vehicles,
	];
}

export function calculateKitReadiness(kit: KitDomainModel): ReadinessResult {
	const allItems = getAllKitItemsFlat(kit);

	if (allItems.length === 0) {
		return {
			score: 0,
			status: "blocked",
			missingCriticalItems: [],
			missingNonCriticalItems: [],
			messages: ["El kit no tiene ningún ítem configurado."],
		};
	}

	const { missingCritical, missingNonCritical } = checkMissingItems(allItems);
	const messages = calculateReadinessMessages(kit, missingCritical);
	const status = calculateReadinessStatus(missingCritical, missingNonCritical, kit);

	// Score calculation
	const totalItems = allItems.length;
	const missingCount = missingCritical.length + missingNonCritical.length;
	const rawScore = totalItems > 0 ? ((totalItems - missingCount) / totalItems) * 100 : 0;
	const score = Math.max(0, Math.round(rawScore));

	return {
		score,
		status,
		missingCriticalItems: missingCritical,
		missingNonCriticalItems: missingNonCritical,
		messages,
	};
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getCriticalItemCount(kit: KitDomainModel): number {
	const allItems = [
		...kit.tools,
		...kit.electricalTools,
		...kit.constructionEquipment,
		...kit.heightSafetyKit,
		...kit.materials,
		...kit.epp,
		...kit.instruments,
		...kit.vehicles,
	];
	return allItems.filter((i) => i.isCritical).length;
}

export function getMissingCriticalKitItems(
	kit: KitDomainModel,
	availableItemNames: string[],
): KitItemDomainModel[] {
	const allItems = [
		...kit.tools,
		...kit.electricalTools,
		...kit.constructionEquipment,
		...kit.heightSafetyKit,
		...kit.materials,
		...kit.epp,
		...kit.instruments,
		...kit.vehicles,
	];

	return allItems.filter(
		(item) =>
			item.isCritical &&
			!availableItemNames.some((name) => name.toLowerCase() === item.name.toLowerCase()),
	);
}

export function getAllKitItems(kit: KitDomainModel): KitItemDomainModel[] {
	return [
		...kit.tools,
		...kit.electricalTools,
		...kit.constructionEquipment,
		...kit.heightSafetyKit,
		...kit.materials,
		...kit.epp,
		...kit.instruments,
		...kit.vehicles,
	];
}
