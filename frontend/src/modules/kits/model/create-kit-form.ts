import { type CreateKitInput, CreateKitSchema, type KitItem } from "@cermont/shared-types";

const DEFAULT_KIT_ITEM: Omit<KitItem, "category"> = {
	name: "",
	quantity: 1,
	unit: "unidad",
	isCritical: false,
	isOptional: false,
	requiresCertification: false,
	calibrationRequired: false,
};

export function createKitItem(category: KitItem["category"], isCritical = false): KitItem {
	return { ...DEFAULT_KIT_ITEM, category, isCritical };
}

export function createInitialKitValues(): CreateKitInput {
	return {
		name: "",
		description: "",
		activityType: "electrico",
		status: "draft",
		isDefault: false,
		tags: [],
		riskLevel: "low",
		tools: [createKitItem("tool")],
		electricalTools: [],
		constructionEquipment: [],
		heightSafetyKit: [],
		materials: [],
		epp: [],
		instruments: [],
		vehicles: [],
		documents: [],
		attachments: [],
		checklists: [],
		readinessRules: [],
		requiredCertifications: [],
		requiredPermits: [],
		requiredAst: false,
		requiredEvidenceTypes: [],
	};
}

export function parseCreateKitInput(values: CreateKitInput): CreateKitInput {
	return CreateKitSchema.parse(values);
}
