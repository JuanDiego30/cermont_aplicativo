/**
 * Cost Suggestion Engine Service
 *
 * Deterministic cost calculation engine for the Cost Proposal Assistant.
 * Uses the CostCatalogItem collection for price lookups with hardcoded
 * fallbacks when the catalog lacks entries.
 *
 * Reference: docs/PROMPTS/ASSISTANT_COST_PROPOSAL_PROMPT.md
 * Reference: docs/plans/PLAN_COST_PROPOSAL_ASSISTANT.md
 */

import type {
	CostCategory,
	CostProposalActivityType,
	CostProposalBudgetComparison,
	CostProposalInput,
	CostProposalLineItem,
	CostProposalResult,
	CostProposalSubtotals,
} from "@cermont/shared-types";
import { CostCatalogItem } from "../../models";
import type { ICostCatalogItemDocument } from "../../models/CostCatalogItem";

// ─── Constants ────────────────────────────────────────────────────────────────

const COP_ROUNDING = 1000; // Round to nearest thousand COP
const DEFAULT_TAX_RATE = 0.19; // IVA 19%
const DEFAULT_HOURS_PER_DAY = 8;
const VIATICO_PER_DAY = 45_000; // COP per person per day

/** Labor rates in COP/hour - configurable per role */
const LABOR_RATES: Record<string, { base: number; nightPremium: number }> = {
	field_technician: { base: 30_000, nightPremium: 0.35 },
	certified_height_technician: { base: 40_000, nightPremium: 0.35 },
	supervisor: { base: 50_000, nightPremium: 0.35 },
	engineer: { base: 65_000, nightPremium: 0.35 },
};

/** Equipment daily rental rates in COP */
const EQUIPMENT_RATES: Record<string, number> = {
	taladro_percutor: 50_000,
	llave_dinamometrica: 40_000,
	nivel_laser: 35_000,
	andamio_canasta: 120_000,
	equipo_soldadura: 80_000,
	epp_altura: 25_000, // per person per day
};

/** Transport cost per trip by location type */
const TRANSPORT_RATES: Record<string, number> = {
	urban: 50_000,
	rural: 85_000,
	remote: 120_000,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundToK(value: number): number {
	return Math.round(value / COP_ROUNDING) * COP_ROUNDING;
}

function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

function _safeNumber(value: number | undefined | null): number {
	return Number(value ?? 0);
}

// ─── Catalog Lookup ───────────────────────────────────────────────────────────

interface CatalogLookupEntry {
	code: string;
	name: string;
	category: string;
	unit: string;
	unitPrice: number;
}

async function loadCatalogForCategory(
	category: ICostCatalogItemDocument["category"],
): Promise<CatalogLookupEntry[]> {
	const filter: { isActive: boolean; category: ICostCatalogItemDocument["category"] } = {
		isActive: true,
		category,
	};
	const items = await CostCatalogItem.find(filter)
		.sort({ unitPrice: 1 })
		.lean<ICostCatalogItemDocument[]>();

	return items.map((item) => ({
		code: item.code,
		name: item.name,
		category: item.category,
		unit: item.unit,
		unitPrice: Number(item.unitPrice ?? 0),
	}));
}

// ─── Material Calculator ──────────────────────────────────────────────────────

interface MaterialTemplate {
	name: string;
	unit: string;
	defaultPrice: number;
	computeQty(input: CostProposalInput): number;
}

/**
 * Activity-specific material templates.
 * Quantity formulas derived from the Cost Proposal Prompt examples.
 */
const ACTIVITY_MATERIALS: Record<CostProposalActivityType, MaterialTemplate[]> = {
	lifeline_horizontal: [
		{
			name: 'Cable acero 3/8"',
			unit: "m",
			defaultPrice: 22_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 1.1); // 10% waste
			},
		},
		{
			name: "Anclaje AB400",
			unit: "un",
			defaultPrice: 85_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				// Roughly 1 anchor every 5 meters, minimum 4
				return Math.max(4, Math.ceil(meters / 5));
			},
		},
		{
			name: "Conector horquilla",
			unit: "un",
			defaultPrice: 8_500,
			computeQty: (input) => {
				const anchors = ACTIVITY_MATERIALS.lifeline_horizontal[1].computeQty(input);
				return anchors * 2;
			},
		},
		{
			name: "Tensor línea vida",
			unit: "un",
			defaultPrice: 45_000,
			computeQty: () => 2,
		},
		{
			name: "Abrazadera cable",
			unit: "un",
			defaultPrice: 3_200,
			computeQty: (input) => {
				const anchors = ACTIVITY_MATERIALS.lifeline_horizontal[1].computeQty(input);
				return anchors * 2;
			},
		},
	],
	lifeline_vertical: [
		{
			name: 'Cable acero 3/8"',
			unit: "m",
			defaultPrice: 22_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 1.15); // 15% waste for vertical runs
			},
		},
		{
			name: "Anclaje AB400",
			unit: "un",
			defaultPrice: 85_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.max(4, Math.ceil(meters / 3)); // Tighter spacing for vertical
			},
		},
		{
			name: "Conector horquilla",
			unit: "un",
			defaultPrice: 8_500,
			computeQty: (input) => {
				const anchors = ACTIVITY_MATERIALS.lifeline_vertical[1].computeQty(input);
				return anchors * 2;
			},
		},
		{
			name: "Tensor línea vida",
			unit: "un",
			defaultPrice: 45_000,
			computeQty: () => 1,
		},
		{
			name: "Abrazadera cable",
			unit: "un",
			defaultPrice: 3_200,
			computeQty: (input) => {
				const anchors = ACTIVITY_MATERIALS.lifeline_vertical[1].computeQty(input);
				return anchors * 2;
			},
		},
		{
			name: "Dispositivo anticaídas vertical",
			unit: "un",
			defaultPrice: 180_000,
			computeQty: (input) => input.technicians,
		},
	],
	cctv_installation: [
		{
			name: "Cámara CCTV",
			unit: "un",
			defaultPrice: 450_000,
			computeQty: (input) => input.measurements?.find((m) => m.unit === "un")?.value ?? 1,
		},
		{
			name: "Cable UTP exterior",
			unit: "m",
			defaultPrice: 3_500,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 1.05);
			},
		},
		{
			name: "Conector RJ45",
			unit: "un",
			defaultPrice: 2_500,
			computeQty: (input) => {
				const cameras = input.measurements?.find((m) => m.unit === "un")?.value ?? 1;
				return cameras * 2;
			},
		},
		{
			name: "Fuente de poder 12V",
			unit: "un",
			defaultPrice: 65_000,
			computeQty: (input) => input.measurements?.find((m) => m.unit === "un")?.value ?? 1,
		},
		{
			name: "DVR/NVR",
			unit: "un",
			defaultPrice: 850_000,
			computeQty: () => 1,
		},
	],
	cctv_maintenance: [
		{
			name: "Kit limpieza lentes",
			unit: "kit",
			defaultPrice: 35_000,
			computeQty: (input) => Math.ceil(input.technicians / 2),
		},
		{
			name: "Conector RJ45",
			unit: "un",
			defaultPrice: 2_500,
			computeQty: () => 4,
		},
		{
			name: "Cinta aislante",
			unit: "rollo",
			defaultPrice: 8_000,
			computeQty: () => 2,
		},
	],
	anchor_installation: [
		{
			name: "Anclaje químico HIT-RE 500",
			unit: "un",
			defaultPrice: 35_000,
			computeQty: (input) => input.measurements?.find((m) => m.unit === "un")?.value ?? 4,
		},
		{
			name: 'Varilla roscada 5/8"',
			unit: "un",
			defaultPrice: 18_000,
			computeQty: (input) => input.measurements?.find((m) => m.unit === "un")?.value ?? 4,
		},
		{
			name: "Resina epóxica",
			unit: "cartucho",
			defaultPrice: 45_000,
			computeQty: (input) => {
				const anchors = input.measurements?.find((m) => m.unit === "un")?.value ?? 4;
				return Math.ceil(anchors / 4);
			},
		},
	],
	anchor_inspection: [
		{
			name: "Kit prueba de tensión",
			unit: "kit",
			defaultPrice: 120_000,
			computeQty: () => 1,
		},
		{
			name: "Marcador permanente industrial",
			unit: "un",
			defaultPrice: 8_000,
			computeQty: () => 2,
		},
	],
	structural_inspection: [
		{
			name: "Kit inspección visual",
			unit: "kit",
			defaultPrice: 85_000,
			computeQty: () => 1,
		},
		{
			name: "Medidor de espesores",
			unit: "día",
			defaultPrice: 75_000,
			computeQty: (input) => input.estimatedDuration.days,
		},
	],
	safety_inspection: [
		{
			name: "Formato checklist SGSST",
			unit: "kit",
			defaultPrice: 20_000,
			computeQty: () => 1,
		},
		{
			name: "Medidor de gases portátil",
			unit: "día",
			defaultPrice: 90_000,
			computeQty: (input) => input.estimatedDuration.days,
		},
	],
	electrical: [
		{
			name: "Cable THHN #12",
			unit: "m",
			defaultPrice: 4_500,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 1.05);
			},
		},
		{
			name: "Breaker termomagnético",
			unit: "un",
			defaultPrice: 35_000,
			computeQty: () => 1,
		},
		{
			name: "Tubo conduit PVC",
			unit: "m",
			defaultPrice: 6_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 0.5);
			},
		},
	],
	refrigeration: [
		{
			name: "Gas refrigerante R410A",
			unit: "kg",
			defaultPrice: 85_000,
			computeQty: () => 2,
		},
		{
			name: "Filtro secador",
			unit: "un",
			defaultPrice: 35_000,
			computeQty: () => 1,
		},
		{
			name: 'Tubería de cobre 3/8"',
			unit: "m",
			defaultPrice: 22_000,
			computeQty: (input) => {
				const meters = input.measurements?.find((m) => m.unit === "m")?.value ?? 0;
				return Math.ceil(meters * 1.05);
			},
		},
	],
	civil_works: [
		{
			name: "Cemento gris 50kg",
			unit: "bulto",
			defaultPrice: 38_000,
			computeQty: (input) => {
				const m3 = input.measurements?.find((m) => m.unit === "m3")?.value ?? 0;
				return Math.max(1, Math.ceil(m3 * 7));
			},
		},
		{
			name: "Arena de río",
			unit: "m3",
			defaultPrice: 65_000,
			computeQty: (input) => {
				const m3 = input.measurements?.find((m) => m.unit === "m3")?.value ?? 0;
				return Math.ceil(m3 * 0.5);
			},
		},
		{
			name: 'Varilla corrugada 1/2"',
			unit: "un",
			defaultPrice: 25_000,
			computeQty: (input) => {
				const m3 = input.measurements?.find((m) => m.unit === "m3")?.value ?? 0;
				return Math.ceil(m3 * 15);
			},
		},
	],
	general_maintenance: [
		{
			name: "Kit herramientas básico",
			unit: "kit",
			defaultPrice: 150_000,
			computeQty: () => 1,
		},
		{
			name: "Lubricante industrial",
			unit: "gal",
			defaultPrice: 45_000,
			computeQty: () => 1,
		},
		{
			name: "Trapo industrial",
			unit: "kg",
			defaultPrice: 12_000,
			computeQty: () => 2,
		},
	],
	other: [
		{
			name: "Materiales varios",
			unit: "lote",
			defaultPrice: 200_000,
			computeQty: () => 1,
		},
	],
};

// ─── Material Calculation ─────────────────────────────────────────────────────

function calculateMaterials(
	input: CostProposalInput,
	_catalogItems: CatalogLookupEntry[],
): CostProposalLineItem[] {
	const items: CostProposalLineItem[] = [];

	// If user provided materials, use those directly
	if (input.materials && input.materials.length > 0) {
		for (const mat of input.materials) {
			const unitPrice = mat.estimatedPrice ?? 0;
			const total = roundMoney(mat.quantity * unitPrice);
			items.push({
				category: "materials" as CostCategory,
				item: mat.name,
				quantity: mat.quantity,
				unit: mat.unit,
				unitPrice,
				total,
				source: mat.estimatedPrice ? "user_provided" : "estimated",
			});
		}
		return items;
	}

	// Auto-generate from activity templates
	const templates = ACTIVITY_MATERIALS[input.activityType] ?? ACTIVITY_MATERIALS.other;

	for (const template of templates) {
		const quantity = template.computeQty(input);
		if (quantity <= 0) {
			continue;
		}

		const unitPrice = template.defaultPrice;
		const total = roundMoney(quantity * unitPrice);

		items.push({
			category: "materials" as CostCategory,
			item: template.name,
			quantity,
			unit: template.unit,
			unitPrice,
			total,
			source: "estimated",
		});
	}

	return items;
}

// ─── Labor Calculation ────────────────────────────────────────────────────────

function computeHourlyRate(role: keyof typeof LABOR_RATES, isNightWork: boolean): number {
	const rate = LABOR_RATES[role];
	return isNightWork ? rate.base * (1 + rate.nightPremium) : rate.base;
}

function calculateLabor(input: CostProposalInput): CostProposalLineItem[] {
	const items: CostProposalLineItem[] = [];
	const hoursPerDay = input.estimatedDuration.hoursPerDay ?? DEFAULT_HOURS_PER_DAY;
	const totalHours = input.estimatedDuration.days * hoursPerDay;

	// Techs
	const techRoleKey = input.requiresHeightWork ? "certified_height_technician" : "field_technician";
	const techHourlyRate = computeHourlyRate(techRoleKey, input.nightWork ?? false);
	const techRoleLabel = input.requiresHeightWork
		? "Técnico certificado altura"
		: "Técnico de campo";
	const techHours = totalHours * input.technicians;

	items.push({
		category: "labor" as CostCategory,
		item: `${techRoleLabel} (x${input.technicians})`,
		quantity: techHours,
		unit: "hora",
		unitPrice: techHourlyRate,
		total: roundMoney(techHours * techHourlyRate),
		source: "calculated",
	});

	// Supervisor
	if (input.supervisor) {
		const supHourlyRate = computeHourlyRate("supervisor", input.nightWork ?? false);
		const supTotal = roundMoney(totalHours * supHourlyRate);
		items.push({
			category: "labor" as CostCategory,
			item: "Supervisor",
			quantity: totalHours,
			unit: "hora",
			unitPrice: supHourlyRate,
			total: supTotal,
			source: "calculated",
		});
	}

	// Engineer
	if (input.engineer) {
		const engHourlyRate = computeHourlyRate("engineer", input.nightWork ?? false);
		const engTotal = roundMoney(totalHours * engHourlyRate);
		items.push({
			category: "labor" as CostCategory,
			item: "Ingeniero",
			quantity: totalHours,
			unit: "hora",
			unitPrice: engHourlyRate,
			total: engTotal,
			source: "calculated",
		});
	}

	// Viáticos for rural/remote locations
	if (input.locationType === "rural" || input.locationType === "remote") {
		const totalPeople = input.technicians + (input.supervisor ? 1 : 0) + (input.engineer ? 1 : 0);
		const viaticosTotal = VIATICO_PER_DAY * totalPeople * input.estimatedDuration.days;
		items.push({
			category: "labor" as CostCategory,
			item: `Viáticos (${totalPeople} pers. × ${input.estimatedDuration.days} días)`,
			quantity: totalPeople * input.estimatedDuration.days,
			unit: "día",
			unitPrice: VIATICO_PER_DAY,
			total: viaticosTotal,
			source: "calculated",
			notes: "Incluye alimentación y alojamiento básico",
		});
	}

	return items;
}

// ─── Equipment Calculation ────────────────────────────────────────────────────

interface EquipmentTemplate {
	name: string;
	dailyRate: number;
	quantity: number;
	condition?: (input: CostProposalInput) => boolean;
}

const DEFAULT_EQUIPMENT: EquipmentTemplate[] = [
	{
		name: "Taladro percutor",
		dailyRate: EQUIPMENT_RATES.taladro_percutor,
		quantity: 1,
		condition: (input) =>
			["anchor_installation", "anchor_inspection", "civil_works"].includes(input.activityType),
	},
	{
		name: "Llave dinamométrica",
		dailyRate: EQUIPMENT_RATES.llave_dinamometrica,
		quantity: 1,
		condition: (input) =>
			["lifeline_horizontal", "lifeline_vertical", "anchor_installation"].includes(
				input.activityType,
			),
	},
	{
		name: "Nivel láser",
		dailyRate: EQUIPMENT_RATES.nivel_laser,
		quantity: 1,
		condition: (input) =>
			["lifeline_horizontal", "lifeline_vertical", "civil_works", "cctv_installation"].includes(
				input.activityType,
			),
	},
	{
		name: "Equipo de soldadura",
		dailyRate: EQUIPMENT_RATES.equipo_soldadura,
		quantity: 1,
		condition: (input) => input.requiresHotWork ?? false,
	},
	{
		name: "Andamio / canasta",
		dailyRate: EQUIPMENT_RATES.andamio_canasta,
		quantity: 1,
		condition: (input) =>
			input.requiresHeightWork &&
			["lifeline_horizontal", "lifeline_vertical", "structural_inspection"].includes(
				input.activityType,
			),
	},
];

function calculateEquipment(input: CostProposalInput): CostProposalLineItem[] {
	const items: CostProposalLineItem[] = [];
	const days = input.estimatedDuration.days;

	// EPP for height work
	if (input.requiresHeightWork) {
		const eppDaily = EQUIPMENT_RATES.epp_altura * input.technicians;
		items.push({
			category: "equipment" as CostCategory,
			item: `EPP especializado altura (x${input.technicians})`,
			quantity: days,
			unit: "día",
			unitPrice: eppDaily,
			total: roundMoney(eppDaily * days),
			source: "calculated",
			notes: "Arnés, eslinga, casco, guantes",
		});
	}

	// Activity-specific equipment
	for (const equip of DEFAULT_EQUIPMENT) {
		if (equip.condition && !equip.condition(input)) {
			continue;
		}

		const total = roundMoney(equip.dailyRate * equip.quantity * days);
		items.push({
			category: "equipment" as CostCategory,
			item: equip.name,
			quantity: days * equip.quantity,
			unit: "día",
			unitPrice: equip.dailyRate,
			total,
			source: "calculated",
		});
	}

	return items;
}

// ─── Transport Calculation ────────────────────────────────────────────────────

function calculateTransport(input: CostProposalInput): CostProposalLineItem[] {
	const items: CostProposalLineItem[] = [];
	const tripRate = TRANSPORT_RATES[input.locationType] ?? TRANSPORT_RATES.urban;
	const trips = input.estimatedDuration.days * 2; // Round trip per day

	items.push({
		category: "transport" as CostCategory,
		item: `Transporte (${input.locationType})`,
		quantity: trips,
		unit: "viaje",
		unitPrice: tripRate,
		total: roundMoney(tripRate * trips),
		source: "calculated",
		notes:
			input.locationType === "rural" || input.locationType === "remote"
				? "Incluye combustible y peajes estimados"
				: undefined,
	});

	return items;
}

// ─── Other Costs ──────────────────────────────────────────────────────────────

function calculateOtherCosts(input: CostProposalInput): CostProposalLineItem[] {
	const items: CostProposalLineItem[] = [];

	// Final certification
	if (input.requiresFinalCertification) {
		const certCost =
			input.activityType === "anchor_installation" || input.activityType === "anchor_inspection"
				? 350_000 // Prueba de tensión
				: 250_000; // Certificación estándar

		items.push({
			category: "other" as CostCategory,
			item: "Certificación final / prueba",
			quantity: 1,
			unit: "un",
			unitPrice: certCost,
			total: certCost,
			source: "calculated",
		});
	}

	// Lockout/Tagout
	if (input.requiresLockoutTagout) {
		items.push({
			category: "other" as CostCategory,
			item: "Kit Lockout/Tagout",
			quantity: 1,
			unit: "kit",
			unitPrice: 60_000,
			total: 60_000,
			source: "estimated",
		});
	}

	return items;
}

// ─── Margin Calculation ───────────────────────────────────────────────────────

function calculateMargin(
	input: CostProposalInput,
	directCost: number,
): { percent: number; amount: number } {
	let baseMarginPercent = 0.2;

	// Risk adjustments
	if (input.requiresHeightWork) {
		baseMarginPercent += 0.05;
	}
	if (input.nightWork) {
		baseMarginPercent += 0.05;
	}
	if (input.locationType === "rural" || input.locationType === "remote") {
		baseMarginPercent += 0.05;
	}
	if (input.requiresFinalCertification) {
		baseMarginPercent += 0.05;
	}

	// Cap and floor
	baseMarginPercent = Math.max(0.15, Math.min(0.35, baseMarginPercent));

	const amount = roundMoney(directCost * baseMarginPercent);

	return { percent: baseMarginPercent, amount };
}

// ─── Tax Calculation ──────────────────────────────────────────────────────────

function calculateTax(_input: CostProposalInput, subtotals: CostProposalSubtotals) {
	// IVA 19% on materials + equipment + transport (taxable base)
	const taxBase = subtotals.materials + subtotals.equipment + subtotals.transport;
	const taxAmount = roundMoney(taxBase * DEFAULT_TAX_RATE);

	return { taxBase, taxAmount, taxRate: DEFAULT_TAX_RATE };
}

// ─── Observations Generator ───────────────────────────────────────────────────

function generateObservations(input: CostProposalInput): string[] {
	const observations: string[] = [];

	if (input.requiresHeightWork) {
		observations.push(
			"Para trabajo en altura, asegurar que los técnicos tengan certificación vigente (medicina preventiva, curso de altura).",
		);
	}

	if (input.locationType === "rural" || input.locationType === "remote") {
		observations.push(
			"Ubicación rural/remota: considerar que el clima puede afectar el cronograma. Verificar acceso vehicular.",
		);
	}

	if (input.nightWork) {
		observations.push(
			"Trabajo nocturno: verificar disponibilidad de iluminación artificial y permisos de ruido.",
		);
	}

	if (input.adverseWeather) {
		observations.push(
			"Condiciones climáticas adversas: considerar EPP para lluvia y plan de contingencia.",
		);
	}

	if (input.requiresHotWork) {
		observations.push(
			"Trabajo en caliente: verificar permisos de fuego y disponibilidad de extintores.",
		);
	}

	if (input.activityType.startsWith("lifeline")) {
		observations.push(
			"No se incluye prueba de tensión post-instalación. Se puede agregar como costo adicional si el cliente la requiere.",
		);
	}

	if (input.activityType.startsWith("anchor")) {
		observations.push(
			"Los precios de anclajes son referenciales; verificar disponibilidad con proveedor antes de enviar propuesta.",
		);
	}

	if (input.clientBudget && input.clientBudget > 0) {
		observations.push("Se incluye comparación con el presupuesto proporcionado por el cliente.");
	}

	return observations;
}

// ─── Suggested Actions Generator ──────────────────────────────────────────────

function generateSuggestedActions(input: CostProposalInput): string[] {
	const actions: string[] = [
		"Verificar precios actuales de materiales con el catálogo de costos y proveedores.",
		"Confirmar disponibilidad del personal técnico para las fechas estimadas.",
	];

	if (input.requiresFinalCertification) {
		actions.push(
			"Confirmar si el cliente requiere certificación final (prueba de tensión, informe técnico firmado).",
		);
	}

	if (input.activityType.startsWith("cctv")) {
		actions.push(
			"Verificar compatibilidad de equipos CCTV con infraestructura existente del cliente.",
		);
	}

	if (input.locationType === "rural" || input.locationType === "remote") {
		actions.push("Coordinar logística de transporte, alimentación y alojamiento del personal.");
	}

	actions.push("Definir forma de pago con el cliente: ¿50% anticipo + 50% contra entrega?");
	actions.push("Incluir en la propuesta exclusiones explícitas (lo que NO incluye el servicio).");

	return actions;
}

// ─── Budget Comparison ────────────────────────────────────────────────────────

function computeBudgetComparison(
	clientBudget: number,
	totalRounded: number,
): CostProposalBudgetComparison {
	const difference = roundMoney(totalRounded - clientBudget);

	return {
		clientBudget,
		proposedTotal: totalRounded,
		difference,
		differencePercent: roundMoney((difference / clientBudget) * 100),
		isWithinBudget: totalRounded <= clientBudget,
	};
}

// ─── Main Export ──────────────────────────────────────────────────────────────

function buildActivityDescription(input: CostProposalInput): string {
	const typeLabels: Record<CostProposalActivityType, string> = {
		lifeline_horizontal: "Instalación Línea de Vida Horizontal",
		lifeline_vertical: "Instalación Línea de Vida Vertical",
		cctv_installation: "Instalación CCTV",
		cctv_maintenance: "Mantenimiento CCTV",
		anchor_installation: "Instalación de Anclajes",
		anchor_inspection: "Inspección de Anclajes",
		structural_inspection: "Inspección Estructural",
		safety_inspection: "Inspección de Seguridad",
		electrical: "Trabajo Eléctrico",
		refrigeration: "Trabajo de Refrigeración",
		civil_works: "Obra Civil",
		general_maintenance: "Mantenimiento General",
		other: "Actividad de Campo",
	};

	const label = typeLabels[input.activityType] ?? "Actividad";

	const measureStr = input.measurements?.length
		? ` (${input.measurements.map((m) => `${m.value}${m.unit}`).join(", ")})`
		: "";

	return `${label}${measureStr} — ${input.location}`;
}

/**
 * Main entry point: Generate a complete cost proposal suggestion.
 *
 * Uses the CostCatalogItem collection for price lookups,
 * falling back to activity-specific hardcoded prices.
 */
export async function suggestCosts(input: CostProposalInput): Promise<CostProposalResult> {
	// Load relevant catalog entries (non-blocking - catalog may be empty)
	const catalogMaterials = await loadCatalogForCategory("materials");

	// Calculate all cost components
	const materialLines = calculateMaterials(input, catalogMaterials);
	const laborLines = calculateLabor(input);
	const equipmentLines = calculateEquipment(input);
	const transportLines = calculateTransport(input);
	const otherLines = calculateOtherCosts(input);

	// Consolidate by category
	const subtotals: CostProposalSubtotals = {
		materials: materialLines.reduce((sum, item) => sum + item.total, 0),
		labor: laborLines.reduce((sum, item) => sum + item.total, 0),
		equipment: equipmentLines.reduce((sum, item) => sum + item.total, 0),
		transport: transportLines.reduce((sum, item) => sum + item.total, 0),
		other: otherLines.reduce((sum, item) => sum + item.total, 0),
	};

	const directCost = roundMoney(
		subtotals.materials +
			subtotals.labor +
			subtotals.equipment +
			subtotals.transport +
			subtotals.other,
	);

	// Margin
	const margin = calculateMargin(input, directCost);

	// Tax
	const { taxBase, taxAmount, taxRate } = calculateTax(input, subtotals);

	// Totals
	const subtotal = roundMoney(directCost + margin.amount);
	const total = roundMoney(subtotal + taxAmount);
	const totalRounded = roundToK(total);

	// Observations and actions
	const observations = generateObservations(input);
	const suggestedActions = generateSuggestedActions(input);

	// Budget comparison
	const budgetComparison = input.clientBudget
		? computeBudgetComparison(input.clientBudget, totalRounded)
		: undefined;

	const allLineItems: CostProposalLineItem[] = [
		...materialLines,
		...laborLines,
		...equipmentLines,
		...transportLines,
		...otherLines,
	];

	return {
		activityDescription: buildActivityDescription(input),
		generatedAt: new Date().toISOString(),
		lineItems: allLineItems,
		subtotals,
		directCost,
		suggestedMarginPercent: roundMoney(margin.percent * 100),
		suggestedMarginAmount: margin.amount,
		subtotal,
		taxBase,
		taxAmount,
		taxRate,
		total,
		totalRounded,
		observations,
		suggestedActions,
		clientBudgetComparison: budgetComparison
			? { status: "present", value: budgetComparison }
			: { status: "absent" },
	};
}
