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

export interface ToolItem {
	name: string;
	quantity: number;
	unit: string;
	specifications?: string;
}

export interface EquipmentItem {
	name: string;
	quantity: number;
	unit: string;
	certificateRequired?: boolean;
	calibrationRequired?: boolean;
}

export interface SafetyElementItem {
	name: string;
	quantity: number;
	unit: string;
}

export interface WorkerCountItem {
	role: string;
	quantity: number;
}

export interface KitTemplate {
	id: string;
	name: string;
	description: string;
	type:
		| "maintenance"
		| "inspection"
		| "installation"
		| "repair"
		| "decommission"
		| "cctv"
		| "lifeline"
		| "electrical"
		| "safety"
		| "other";
	materials: MaterialItem[];
	tools?: ToolItem[];
	equipment?: EquipmentItem[];
	safetyElements?: SafetyElementItem[];
	workerCount?: WorkerCountItem[];
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
 * CCTV maintenance kit — Mantenimiento de sistemas de videovigilancia
 * Source: 10_Formato_Mantenimiento_CCTV3 (CERMONT field documentation)
 * Components: cámaras, radioenlaces, cajas de conexiones, sistema eléctrico
 */
const KIT_CCTV: KitTemplate = {
	id: "kit-cctv-001",
	name: "Kit Mantenimiento CCTV",
	description:
		"Materiales y herramientas para mantenimiento de sistemas de videovigilancia (cámaras, radioenlaces, cajas de conexiones)",
	type: "cctv",
	materials: [
		// Equipos de limpieza y revisión
		{ name: "Paño antiestático para lente", quantity: 4, unit: "unidad" },
		{ name: "Espray limpiador óptico", quantity: 1, unit: "frasco" },
		{ name: "Brocha antiestática", quantity: 2, unit: "unidad" },
		// Cámara
		{ name: "Soporte/bracket cámara domo", quantity: 2, unit: "unidad" },
		{ name: "Tornillería inoxidable M4/M6 cámara", quantity: 1, unit: "juego" },
		{ name: "Silicona neutra sellado carcasa", quantity: 1, unit: "unidad" },
		// Radioenlace
		{ name: "Antena sectorial 2.4 GHz (repuesto)", quantity: 1, unit: "unidad" },
		{ name: "Cable UTP Cat 6 intemperie", quantity: 10, unit: "metro" },
		{ name: "Conector RJ45 exterior", quantity: 10, unit: "unidad" },
		{ name: "Injector POE 48V", quantity: 1, unit: "unidad" },
		// Caja de conexiones CCTV
		{ name: "Prensaestopa PG13.5", quantity: 4, unit: "unidad" },
		{ name: "Regleta de terminales 10A", quantity: 1, unit: "unidad" },
		{ name: "Tubo termoencogible variado", quantity: 1, unit: "bolsa" },
		{ name: "Bridas plásticas 300 mm", quantity: 20, unit: "unidad" },
		// Conexión eléctrica / alimentación
		{ name: "Fusible 1A / 2A (repuesto)", quantity: 4, unit: "unidad" },
		{ name: "Cable alimentación 2x14 AWG", quantity: 5, unit: "metro" },
		// Sistema puesta a tierra
		{ name: "Cable cobre desnudo 6 AWG", quantity: 2, unit: "metro" },
		{ name: "Conector a tierra tipo cuña", quantity: 2, unit: "unidad" },
		// EPP
		{ name: "Arnés de seguridad (verificado con línea de vida)", quantity: 1, unit: "juego" },
		{ name: "Guantes dieléctricos Clase 0", quantity: 1, unit: "par" },
		{ name: "Casco con barbiquejo", quantity: 1, unit: "unidad" },
		{ name: "Gafas de seguridad", quantity: 1, unit: "unidad" },
		// Formatos
		{ name: "Formato mantenimiento CCTV (F-MT-CCTV-001)", quantity: 3, unit: "unidad" },
		{ name: "Formato ART/permiso trabajo en alturas", quantity: 1, unit: "unidad" },
	],
};

/**
 * Líneas de vida vertical kit — Inspección y mantenimiento de sistemas de anclaje
 * Source: 08_Formato_Inspeccion_lineas_de_vida_Vertical3 (CERMONT field documentation)
 * Components: placas anclaje, platinas, absorbedor, tensor, cable inoxidable
 */
const KIT_LIFELINE: KitTemplate = {
	id: "kit-lifeline-001",
	name: "Kit Inspección Líneas de Vida Vertical",
	description:
		"Materiales y herramientas para inspección y mantenimiento de sistemas de líneas de vida verticales (anclaje, tensor, cable)",
	type: "lifeline",
	materials: [
		// Componentes de anclaje — parte superior
		{ name: "Placa anclaje superior (acero galvanizado)", quantity: 1, unit: "unidad" },
		{ name: "Pernos expansivos M12 (placa superior)", quantity: 4, unit: "unidad" },
		{ name: "Platina sujeción guía superior", quantity: 2, unit: "unidad" },
		// Línea / cable
		{ name: "Cable acero inoxidable AISI 316 ø8mm", quantity: 2, unit: "metro" },
		{ name: "Casquillo prensacable ø8mm", quantity: 4, unit: "unidad" },
		{ name: "Soporte cable guía (cada 5m)", quantity: 2, unit: "unidad" },
		// Sistema tensor
		{ name: "Tensor cable inoxidable M12", quantity: 1, unit: "unidad" },
		{ name: "Pasador seguridad tensor", quantity: 2, unit: "unidad" },
		// Absorbedor de energía
		{ name: "Absorbedor de energía tipo YOYO certificado", quantity: 1, unit: "unidad" },
		{ name: "Mosquetón seguro doble acción 25 kN", quantity: 2, unit: "unidad" },
		// Componentes de anclaje — parte inferior
		{ name: "Placa anclaje inferior (acero galvanizado)", quantity: 1, unit: "unidad" },
		{ name: "Pernos expansivos M12 (placa inferior)", quantity: 4, unit: "unidad" },
		// Placa identificación
		{ name: "Placa identificación/trazabilidad (acero inox)", quantity: 1, unit: "unidad" },
		// Herramientas de inspección
		{ name: "Llave torque 20-100 Nm", quantity: 1, unit: "unidad" },
		{ name: "Calibrador pie de rey (verificación diámetro cable)", quantity: 1, unit: "unidad" },
		{ name: "Medidor de tensión cable", quantity: 1, unit: "unidad" },
		// EPP inspector
		{ name: "Arnés anticaída certificado EN 361", quantity: 1, unit: "juego" },
		{ name: "Casco montañero con barbiquejo", quantity: 1, unit: "unidad" },
		{ name: "Guantes de trabajo anticorte", quantity: 1, unit: "par" },
		// Formatos
		{ name: "Formato inspección líneas de vida (F-IN-LV-001)", quantity: 3, unit: "unidad" },
		{ name: "Formato AST permiso trabajo en alturas", quantity: 1, unit: "unidad" },
		{ name: "Etiqueta resultado inspección (OK / REQUIERE RETIRO)", quantity: 5, unit: "unidad" },
	],
};

/**
 * Electrical maintenance kit — Mantenimiento eléctrico industrial
 * Source: CERMONT field documentation for mantenimiento eléctrico
 * Includes: tools, equipment, safety elements, and worker count
 */
const KIT_ELECTRICAL: KitTemplate = {
	id: "kit-electrical-001",
	name: "Kit Mantenimiento Eléctrico Industrial",
	description:
		"Herramientas, equipos y EPP para mantenimiento eléctrico industrial en media y baja tensión",
	type: "electrical",
	materials: [
		{ name: "Cinta aislante 3M 33+", quantity: 2, unit: "rollo" },
		{ name: "Cinta auto-fusionante siliconada", quantity: 1, unit: "rollo" },
		{ name: "Terminales pre-aislados surtidos", quantity: 1, unit: "juego" },
		{ name: "Tubo termoencogible 3:1 surtido", quantity: 1, unit: "bolsa" },
		{ name: "Cable THHN #12 AWG", quantity: 10, unit: "metro" },
		{ name: "Cable THHN #10 AWG", quantity: 10, unit: "metro" },
		{ name: "Breaker termomagnético 2x20A", quantity: 1, unit: "unidad" },
		{ name: "Contacto bipolar 15A 120V", quantity: 2, unit: "unidad" },
		{ name: "Platina de cobre para conexión a tierra", quantity: 1, unit: "unidad" },
		{ name: "Grapa conectora a tierra", quantity: 2, unit: "unidad" },
	],
	tools: [
		{
			name: "Multímetro digital True RMS",
			quantity: 1,
			unit: "unidad",
			specifications: "Cat III 600V",
		},
		{ name: "Pinza amperimétrica AC/DC", quantity: 1, unit: "unidad", specifications: "400A" },
		{
			name: "Juego de destornilladores aislados VDE",
			quantity: 1,
			unit: "juego",
			specifications: "1000V",
		},
		{ name: "Pinzas pelacables automáticas", quantity: 1, unit: "unidad" },
		{ name: "Pinzas corte diagonal aisladas", quantity: 1, unit: "par", specifications: "1000V" },
		{ name: 'Llave ajustable 10" aislada', quantity: 1, unit: "unidad" },
		{ name: "Kit llaves Allen aisladas", quantity: 1, unit: "juego" },
		{ name: "Probador de voltaje sin contacto", quantity: 1, unit: "unidad" },
		{ name: "Linterna cabeza recargable", quantity: 1, unit: "unidad" },
	],
	equipment: [
		{ name: "Escalera fibra vidrio 2m", quantity: 1, unit: "unidad" },
		{
			name: "Telurómetro / medidor de resistencia tierra",
			quantity: 1,
			unit: "unidad",
			certificateRequired: true,
			calibrationRequired: true,
		},
		{
			name: "Cámara termográfica",
			quantity: 1,
			unit: "unidad",
			certificateRequired: true,
			calibrationRequired: true,
		},
	],
	safetyElements: [
		{ name: "Guantes dieléctricos Clase 0 (1000V)", quantity: 1, unit: "par" },
		{ name: "Guantes dieléctricos Clase 2 (17000V)", quantity: 1, unit: "par" },
		{ name: "Casco tipo I con barbiquejo", quantity: 2, unit: "unidad" },
		{ name: "Gafas de seguridad antiimpacto", quantity: 2, unit: "unidad" },
		{ name: "Ropa de trabajo ignífuga (FR)", quantity: 2, unit: "juego" },
		{ name: "Botas dieléctricas", quantity: 2, unit: "par" },
		{ name: "Careta facial anti-arco eléctrico", quantity: 1, unit: "unidad" },
		{ name: "Arnés de seguridad con línea de vida", quantity: 1, unit: "juego" },
		{ name: "Extintor CO2 5lb", quantity: 1, unit: "unidad" },
	],
	workerCount: [
		{ role: "electricista", quantity: 2 },
		{ role: "tecnico_electricista", quantity: 1 },
		{ role: "obrero", quantity: 1 },
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
	[KIT_CCTV.id]: KIT_CCTV,
	[KIT_LIFELINE.id]: KIT_LIFELINE,
	[KIT_ELECTRICAL.id]: KIT_ELECTRICAL,
};

/**
 * Get kit template by ID
 * Returns not-found status object if lookup fails
 */
export function getKitTemplate(kitId: string): KitTemplate | { status: "not_found"; id: string } {
	const kit = KIT_REGISTRY[kitId];
	if (!kit) {
		return { status: "not_found" as const, id: kitId };
	}
	return kit;
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
 * Normalize a kit template into planning packet resource data (F15-T046).
 * Maps tools, equipment, safetyElements, and workerCount from kit template
 * to the planning packet's resource arrays.
 */
export function applyKitTemplateToPlanningPacketData(kit: KitTemplate): {
	tools: Array<{ name: string; quantity: number; available: boolean; specifications?: string }>;
	equipment: Array<{
		name: string;
		quantity: number;
		available: boolean;
		certificateRequired: boolean;
	}>;
	materials: Array<{ description: string; quantity: number; unit: string }>;
	safetyElements: Array<{ description: string; quantity: number; unit: string }>;
	workerRequirements: {
		electricistas: number;
		tecnicosTelecomunicacion: number;
		instrumentistas: number;
		obreros: number;
	};
} {
	return {
		tools: (kit.tools ?? []).map((t) => ({
			name: t.name,
			quantity: t.quantity,
			available: true,
			specifications: t.specifications,
		})),
		equipment: (kit.equipment ?? []).map((e) => ({
			name: e.name,
			quantity: e.quantity,
			available: true,
			certificateRequired: e.certificateRequired ?? false,
		})),
		materials: kit.materials.map((m) => ({
			description: m.name,
			quantity: m.quantity,
			unit: m.unit,
		})),
		safetyElements: (kit.safetyElements ?? []).map((s) => ({
			description: s.name,
			quantity: s.quantity,
			unit: s.unit,
		})),
		workerRequirements: normalizeWorkerCount(kit.workerCount ?? []),
	};
}

function normalizeWorkerCount(workers: WorkerCountItem[]): {
	electricistas: number;
	tecnicosTelecomunicacion: number;
	instrumentistas: number;
	obreros: number;
} {
	let electricistas = 0;
	let tecnicosTelecomunicacion = 0;
	let instrumentistas = 0;
	let obreros = 0;

	for (const w of workers) {
		switch (w.role) {
			case "electricista":
				electricistas += w.quantity;
				break;
			case "tecnico_electricista":
				electricistas += w.quantity;
				break;
			case "tecnico_telecom":
				tecnicosTelecomunicacion += w.quantity;
				break;
			case "instrumentista":
				instrumentistas += w.quantity;
				break;
			case "obrero":
				obreros += w.quantity;
				break;
		}
	}

	return { electricistas, tecnicosTelecomunicacion, instrumentistas, obreros };
}

/**
 * Default kit to apply based on order type
 * Used if no explicit kit is specified during order creation
 * Returns not-found status object for unmatched types
 */
export function getDefaultKitForOrderType(
	orderType:
		| "maintenance"
		| "inspection"
		| "installation"
		| "repair"
		| "decommission"
		| "cctv"
		| "lifeline"
		| "electrical"
		| "safety"
		| "other",
): KitTemplate | { status: "not_found"; type: string } {
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
		case "cctv":
			return KIT_CCTV;
		case "lifeline":
			return KIT_LIFELINE;
		case "electrical":
			return KIT_ELECTRICAL;
		case "safety":
			return KIT_INSPECTION;
		case "other":
			return { status: "not_found" as const, type: "other" };
		default:
			return { status: "not_found" as const, type: String(orderType) as unknown as string };
	}
}
