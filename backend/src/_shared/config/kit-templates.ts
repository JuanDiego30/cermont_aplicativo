/**
 * Kit Templates — Preconfigurations for Order Materials
 *
 * Centralizes typical material kits (maintenance, inspection, etc.)
 * that can be applied to orders at creation or during execution.
 *
 * Source: DOC-07 — Kit Típicos
 * Structure matches Order.materials schema for consistency.
 */

export interface MaterialItem {
	name: string;
	quantity: number;
	unit: string;
	unitCost?: number;
	delivered?: boolean;
}

export interface KitTemplate {
	id: string;
	name: string;
	description: string;
	type: "maintenance" | "inspection" | "installation" | "repair" | "decommission";
	materials: MaterialItem[];
}

/**
 * Pre-defined maintenance kit
 * Typical for preventive/corrective maintenance orders
 */
const KIT_MAINTENANCE: KitTemplate = {
	id: "kit-maintenance-001",
	name: "Kit Mantenimiento Estándar",
	description: "Materiales y herramientas para mantenimiento preventivo/correctivo",
	type: "maintenance",
	materials: [
		{ name: "Aceite ISO 46", quantity: 2, unit: "galón" },
		{ name: "Filtro de aire primario", quantity: 1, unit: "unidad" },
		{ name: "Filtro de aire secundario", quantity: 1, unit: "unidad" },
		{ name: "Filtro de succción", quantity: 1, unit: "unidad" },
		{ name: "Empaque mecánico", quantity: 1, unit: "juego" },
		{ name: "Anticongelante (si aplica)", quantity: 1, unit: "galón" },
	],
};

/**
 * Pre-defined inspection kit
 * Typical for HSE/safety inspections
 */
const KIT_INSPECTION: KitTemplate = {
	id: "kit-inspection-001",
	name: "Kit Inspección HSE",
	description: "Equipos y formatos para inspección de seguridad y cumplimiento ambiental",
	type: "inspection",
	materials: [
		{ name: "Formato inspección visual", quantity: 3, unit: "unidad" },
		{ name: "Cinta métrica 25m", quantity: 1, unit: "unidad" },
		{ name: "Medidor de presión", quantity: 1, unit: "unidad" },
		{ name: "Termómetro digital", quantity: 1, unit: "unidad" },
		{ name: "Kit de pruebas químicas (opcional)", quantity: 1, unit: "juego" },
	],
};

/**
 * Pre-defined installation kit
 * Typical for equipment installation orders
 */
const KIT_INSTALLATION: KitTemplate = {
	id: "kit-installation-001",
	name: "Kit Instalación",
	description: "Materiales y hardware para instalación de nuevos equipos",
	type: "installation",
	materials: [
		{ name: "Tornillería variada", quantity: 1, unit: "juego" },
		{ name: "Tuercas y arandelas", quantity: 1, unit: "juego" },
		{ name: "Mangueras de conexión", quantity: 5, unit: "metro" },
		{ name: "Sellador industrial", quantity: 1, unit: "litro" },
		{ name: "Cinta teflón", quantity: 2, unit: "rollo" },
		{ name: "Etiquetado/señalización", quantity: 1, unit: "juego" },
	],
};

/**
 * Pre-defined repair kit
 * Typical for emergency repairs
 */
const KIT_REPAIR: KitTemplate = {
	id: "kit-repair-001",
	name: "Kit Reparación de Emergencia",
	description: "Piezas de respuesta rápida para reparaciones de emergencia",
	type: "repair",
	materials: [
		{ name: "Sellos de repuesto", quantity: 5, unit: "unidad" },
		{ name: "Rodamientos variados", quantity: 3, unit: "juego" },
		{ name: "Acoplamiento flexible", quantity: 2, unit: "unidad" },
		{ name: "Soldadura especial (si aplica)", quantity: 1, unit: "kg" },
		{ name: "Lubricante de emergencia", quantity: 2, unit: "litro" },
	],
};

/**
 * Pre-defined decommission kit
 * Typical for equipment removal and disposal
 */
const KIT_DECOMMISSION: KitTemplate = {
	id: "kit-decommission-001",
	name: "Kit Descomisionamiento",
	description: "Materiales para desmantelamiento seguro y disposición de equipos",
	type: "decommission",
	materials: [
		{ name: "Bidones para fluido residual", quantity: 5, unit: "unidad" },
		{ name: "Bolsas de residuo (industrial)", quantity: 10, unit: "unidad" },
		{ name: "Etiquetas de residuo peligroso", quantity: 1, unit: "juego" },
		{ name: "Equipo de protección (overoles, guantes)", quantity: 3, unit: "juego" },
		{ name: "Certificado de disposición", quantity: 1, unit: "unidad" },
	],
};

/**
 * Registry of all available kit templates
 * Indexed by type and id for easy lookup
 */
export const KIT_REGISTRY: Record<string, KitTemplate> = {
	[KIT_MAINTENANCE.id]: KIT_MAINTENANCE,
	[KIT_INSPECTION.id]: KIT_INSPECTION,
	[KIT_INSTALLATION.id]: KIT_INSTALLATION,
	[KIT_REPAIR.id]: KIT_REPAIR,
	[KIT_DECOMMISSION.id]: KIT_DECOMMISSION,
};

/**
 * Get kit template by ID
 * Returns undefined if not found
 */
export function getKitTemplate(kitId: string): KitTemplate | undefined {
	return KIT_REGISTRY[kitId];
}

/**
 * Get all kits of a specific type
 */
export function getKitsByType(type: KitTemplate["type"]): KitTemplate[] {
	return Object.values(KIT_REGISTRY).filter((kit) => kit.type === type);
}

/**
 * List all available kits
 */
export function listAllKits(): KitTemplate[] {
	return Object.values(KIT_REGISTRY);
}

/**
 * Default kit to apply based on order type
 * Used if no explicit kit is specified during order creation
 */
export function getDefaultKitForOrderType(
	orderType: "maintenance" | "inspection" | "installation" | "repair" | "decommission",
): KitTemplate | undefined {
	switch (orderType) {
		case "maintenance":
			return KIT_MAINTENANCE;
		case "inspection":
			return KIT_INSPECTION;
		case "installation":
			return KIT_INSTALLATION;
		case "repair":
			return KIT_REPAIR;
		case "decommission":
			return KIT_DECOMMISSION;
		default:
			return undefined;
	}
}
