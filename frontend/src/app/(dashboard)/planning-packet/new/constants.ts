import type {
	PlanningBusinessUnit,
	PlanningEquipment,
	PlanningResourceLine,
	PlanningTool,
} from "@cermont/shared-types";

// ─── Kit suggestions ────────────────────────────────────────────────────────

export const KIT_SUGGESTIONS: Record<
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

export const BUSINESS_UNIT_OPTIONS: Array<{ value: PlanningBusinessUnit; label: string }> = [
	{ value: "IT_MNT", label: "IT-MNT" },
	{ value: "SC", label: "SC" },
	{ value: "GEN", label: "GEN" },
	{ value: "OTROS", label: "Otros" },
];

export function emptyMaterial(): PlanningResourceLine {
	return { description: "", quantity: 1, unit: "und" };
}
export function emptyTool(): PlanningTool {
	return { name: "", quantity: 1, available: false };
}
export function emptyEquipment(): PlanningEquipment {
	return { name: "", quantity: 1, available: false, certificateRequired: false };
}
export function emptySafetyEl(): PlanningResourceLine {
	return { description: "", quantity: 1, unit: "und" };
}

/** Detects kit suggestion from work type string */
export function detectKitFromWorkType(workType: string): string {
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
