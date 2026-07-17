/**
 * CERMONT real operational form templates
 *
 * These are digitized versions of the real CERMONT paper formats:
 * - 06_FORMATO_DE_PLANEACION_DE_OBRA3
 * - 08_Formato_Inspeccion_lineas_de_vida_Vertical3
 * - 10_Formato_Mantenimiento_CCTV3
 *
 * Each template uses DynamicFormField shape but adds section groupings
 * handled by the SectionedFormRenderer.
 */

export interface CermontFormSection {
	id: string;
	title: string;
	description?: string;
	fields: CermontFormFieldDef[];
}

export type CermontFieldType =
	| "text"
	| "textarea"
	| "number"
	| "select"
	| "multiselect"
	| "date"
	| "checkbox"
	| "photo"
	| "signature"
	| "conformity"; // C / NC / NA

export interface CermontFormFieldDef {
	key: string;
	label: string;
	type: CermontFieldType;
	required?: boolean;
	placeholder?: string;
	options?: Array<{ value: string; label: string }>;
	/** For photo fields: which component this photo is for */
	componentName?: string;
	/** Hint shown below the field */
	hint?: string;
	/** Row span inside section grid (1 = half-width, 2 = full-width) */
	span?: 1 | 2;
}

export interface CermontFormTemplate {
	id: string;
	name: string;
	description: string;
	stepCode: string;
	workTypeHint: string;
	sections: CermontFormSection[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 1 — Planeación de obra (Step 5)
// ─────────────────────────────────────────────────────────────────────────────

const PLANNING_OBRA_TEMPLATE: CermontFormTemplate = {
	id: "cermont_planeacion_obra_v1",
	name: "Formato de Planeación de Obra",
	description: "Formato oficial CERMONT para planeación y programación de actividades de obra",
	stepCode: "step_05_planning",
	workTypeHint: "obra_civil,instalacion,mantenimiento",
	sections: [
		{
			id: "encabezado",
			title: "Datos generales",
			fields: [
				{
					key: "responsable_inspeccion",
					label: "Responsable de inspección",
					type: "text",
					required: true,
					placeholder: "Ing. Residente / Supervisor",
					span: 2,
				},
				{
					key: "lugar",
					label: "Lugar / Dirección",
					type: "text",
					required: true,
					placeholder: "Dirección completa de la obra",
					span: 2,
				},
				{
					key: "fecha",
					label: "Fecha",
					type: "date",
					required: true,
				},
				{
					key: "unidad_negocio",
					label: "Unidad de negocio",
					type: "select",
					required: true,
					options: [
						{ value: "electricidad", label: "Electricidad" },
						{ value: "telecomunicaciones", label: "Telecomunicaciones" },
						{ value: "refrigeracion", label: "Refrigeración" },
						{ value: "obras_civiles", label: "Obras civiles" },
						{ value: "montajes", label: "Montajes" },
						{ value: "suministros", label: "Suministros" },
						{ value: "otro", label: "Otro" },
					],
				},
			],
		},
		{
			id: "alcance",
			title: "Alcance del trabajo",
			fields: [
				{
					key: "alcance",
					label: "Descripción del alcance",
					type: "textarea",
					required: true,
					placeholder: "Describir detalladamente el trabajo a ejecutar...",
					span: 2,
				},
			],
		},
		{
			id: "materiales",
			title: "Materiales requeridos",
			description: "Listar materiales con cantidades",
			fields: [
				{
					key: "materiales",
					label: "Listado de materiales",
					type: "textarea",
					required: false,
					placeholder: 'Cable NYY 3x8 — 100m\nTubería EMT 1" — 50m\n...',
					span: 2,
					hint: "Un material por línea en formato: Descripción — Cantidad",
				},
			],
		},
		{
			id: "herramientas",
			title: "Herramientas requeridas",
			fields: [
				{
					key: "herramientas",
					label: "Listado de herramientas",
					type: "textarea",
					required: false,
					placeholder: "Multímetro Fluke\nCortafrío\nTornillo de banco\n...",
					span: 2,
					hint: "Una herramienta por línea",
				},
			],
		},
		{
			id: "equipos",
			title: "Equipos requeridos",
			fields: [
				{
					key: "equipos",
					label: "Listado de equipos",
					type: "textarea",
					required: false,
					placeholder: "Izador eléctrico 1T\nGenerador 5kW\n...",
					span: 2,
					hint: "Un equipo por línea",
				},
			],
		},
		{
			id: "seguridad",
			title: "Elementos de seguridad (EPP)",
			fields: [
				{
					key: "epp_casco",
					label: "Casco dieléctrico clase E",
					type: "checkbox",
				},
				{
					key: "epp_guantes",
					label: "Guantes dieléctricos clase 00/0",
					type: "checkbox",
				},
				{
					key: "epp_botas",
					label: "Botas dieléctricas",
					type: "checkbox",
				},
				{
					key: "epp_arnes",
					label: "Arnés de seguridad certificado",
					type: "checkbox",
				},
				{
					key: "epp_gafas",
					label: "Gafas de seguridad",
					type: "checkbox",
				},
				{
					key: "epp_chaleco",
					label: "Chaleco reflectivo",
					type: "checkbox",
				},
				{
					key: "epp_adicional",
					label: "EPP adicional",
					type: "textarea",
					placeholder: "Otro EPP requerido...",
					span: 2,
				},
			],
		},
		{
			id: "cuadrilla",
			title: "Personal requerido",
			fields: [
				{
					key: "num_electricistas",
					label: "Técnicos electricistas",
					type: "number",
					placeholder: "0",
				},
				{
					key: "num_telecomunicaciones",
					label: "Técnicos telecomunicación",
					type: "number",
					placeholder: "0",
				},
				{
					key: "num_instrumentistas",
					label: "Instrumentistas",
					type: "number",
					placeholder: "0",
				},
				{
					key: "num_obreros",
					label: "Obreros / Auxiliares",
					type: "number",
					placeholder: "0",
				},
			],
		},
		{
			id: "firmas",
			title: "Firmas de autorización",
			fields: [
				{
					key: "firma_ing_residente",
					label: "Firma Ing. Residente",
					type: "signature",
					span: 2,
				},
				{
					key: "firma_tec_electricista",
					label: "Firma Técnico Electricista",
					type: "signature",
					span: 2,
				},
				{
					key: "firma_hes",
					label: "Firma Coordinador HES",
					type: "signature",
					span: 2,
				},
			],
		},
	],
};

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Inspección Líneas de Vida Vertical (Steps 6-7)
// ─────────────────────────────────────────────────────────────────────────────

const LINEA_VIDA_COMPONENTS = [
	"Placa de anclaje superior",
	"Platinas de sujeción superior",
	"Absorbedor de energía",
	"Sistema tensor",
	'Cable de acero inoxidable 5/16"',
	"Soporte cable guía intermedio",
	"Placa de anclaje inferior",
	"Placa de identificación",
] as const;

const LINEAS_VIDA_TEMPLATE: CermontFormTemplate = {
	id: "cermont_lineas_vida_v1",
	name: "Formato de Inspección Líneas de Vida Vertical",
	description: "Inspección técnica de sistema de línea de vida vertical certificado CERMONT",
	stepCode: "step_06_execution",
	workTypeHint: "lineas_de_vida,trabajo_alturas",
	sections: [
		{
			id: "encabezado",
			title: "Datos generales",
			fields: [
				{
					key: "inspector",
					label: "Inspector",
					type: "text",
					required: true,
					placeholder: "Nombre del inspector certificado",
				},
				{
					key: "fecha_inspeccion",
					label: "Fecha de inspección",
					type: "date",
					required: true,
				},
				{
					key: "ubicacion",
					label: "Ubicación / Sitio",
					type: "text",
					required: true,
					span: 2,
				},
				{
					key: "codigo_linea",
					label: "Código de línea de vida",
					type: "text",
					required: true,
					placeholder: "LV-XXX-000",
				},
				{
					key: "proximo_mantenimiento",
					label: "Próxima revisión programada",
					type: "date",
					required: true,
				},
			],
		},
		{
			id: "inspeccion_componentes",
			title: "Inspección por componente",
			description:
				"Evaluar cada componente y registrar estado C (Conforme) / NC (No conforme) / NA (No aplica)",
			fields: LINEA_VIDA_COMPONENTS.flatMap((comp): CermontFormFieldDef[] => {
				const compKey = comp
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "_")
					.replace(/_+/g, "_");
				return [
					{
						key: `comp_${compKey}_estado`,
						label: `${comp} — Estado`,
						type: "conformity",
						required: true,
						componentName: comp,
					},
					{
						key: `comp_${compKey}_hallazgo`,
						label: `${comp} — Hallazgo`,
						type: "textarea",
						placeholder: "Describir condición encontrada...",
						span: 2,
					},
					{
						key: `comp_${compKey}_accion`,
						label: `${comp} — Acción correctiva`,
						type: "textarea",
						placeholder: "Acción tomada o recomendada...",
						span: 2,
					},
					{
						key: `comp_${compKey}_foto`,
						label: `${comp} — Registro fotográfico`,
						type: "photo",
						componentName: comp,
						span: 2,
					},
				];
			}),
		},
		{
			id: "hoja_vida",
			title: "Hoja de vida de la línea de vida",
			fields: [
				{
					key: "tipo_linea",
					label: "Tipo de línea de vida",
					type: "select",
					options: [
						{ value: "cable_acero", label: "Cable de acero inoxidable" },
						{ value: "cuerda_nylon", label: "Cuerda de nylon" },
						{ value: "riel_rigido", label: "Riel rígido" },
					],
				},
				{
					key: "longitud_m",
					label: "Longitud (m)",
					type: "number",
					placeholder: "0",
				},
				{
					key: "capacidad_kg",
					label: "Capacidad (kg)",
					type: "number",
					placeholder: "100",
				},
				{
					key: "fabricante",
					label: "Fabricante",
					type: "text",
					placeholder: "Marca / Proveedor",
				},
				{
					key: "referencia",
					label: "Referencia / Modelo",
					type: "text",
					placeholder: "Referencia del equipo",
				},
				{
					key: "serial",
					label: "Serial",
					type: "text",
					placeholder: "S/N",
				},
				{
					key: "fecha_fabricacion",
					label: "Fecha de fabricación",
					type: "date",
				},
				{
					key: "vida_util_anos",
					label: "Vida útil (años)",
					type: "number",
					placeholder: "10",
				},
			],
		},
		{
			id: "concepto",
			title: "Concepto final",
			fields: [
				{
					key: "concepto_final",
					label: "Concepto de inspección",
					type: "select",
					required: true,
					options: [
						{ value: "apto", label: "APTO — En condiciones para uso" },
						{ value: "condicional", label: "CONDICIONAL — Requiere seguimiento" },
						{ value: "no_apto", label: "NO APTO — Fuera de servicio" },
					],
				},
				{
					key: "observaciones",
					label: "Observaciones generales",
					type: "textarea",
					placeholder: "Observaciones adicionales de la inspección...",
					span: 2,
				},
				{
					key: "firma_inspector",
					label: "Firma del inspector",
					type: "signature",
					span: 2,
				},
			],
		},
	],
};

// ─────────────────────────────────────────────────────────────────────────────
// Template 3 — Mantenimiento Preventivo CCTV (Steps 6-7)
// ─────────────────────────────────────────────────────────────────────────────

const CCTV_CONFORM_OPTIONS = [
	{ value: "conforme", label: "✔ Conforme" },
	{ value: "no_conforme", label: "✘ No conforme" },
	{ value: "na", label: "N/A" },
];

const CCTV_TEMPLATE: CermontFormTemplate = {
	id: "cermont_cctv_v1",
	name: "Formato de Mantenimiento Preventivo CCTV",
	description: "Rutina de mantenimiento preventivo para sistema de videovigilancia CCTV",
	stepCode: "step_06_execution",
	workTypeHint: "cctv,telecomunicaciones",
	sections: [
		{
			id: "encabezado",
			title: "Datos generales",
			fields: [
				{
					key: "lugar",
					label: "Lugar",
					type: "text",
					required: true,
					placeholder: "Instalación / Sitio",
				},
				{
					key: "fecha",
					label: "Fecha",
					type: "date",
					required: true,
				},
				{
					key: "camara_no",
					label: "Cámara N°",
					type: "text",
					required: true,
					placeholder: "CAM-001",
				},
				{
					key: "rutina_no",
					label: "Rutina N°",
					type: "text",
					required: true,
					placeholder: "RUT-001",
				},
			],
		},
		{
			id: "camara_info",
			title: "Información de la cámara",
			fields: [
				{
					key: "tipo_camara",
					label: "Tipo de cámara",
					type: "select",
					required: true,
					options: [
						{ value: "domo", label: "Domo" },
						{ value: "bullet", label: "Bullet" },
						{ value: "ptz", label: "PTZ" },
						{ value: "fisheye", label: "Fisheye" },
						{ value: "termica", label: "Térmica" },
						{ value: "otra", label: "Otra" },
					],
				},
				{
					key: "modelo",
					label: "Modelo",
					type: "text",
					placeholder: "Ej. DS-2CD2183G2-I",
				},
				{
					key: "serial",
					label: "Serial",
					type: "text",
					placeholder: "S/N de la cámara",
				},
				{
					key: "altura_estructura_m",
					label: "Altura de estructura (m)",
					type: "number",
					placeholder: "0",
				},
				{
					key: "altura_camara_m",
					label: "Altura de cámara (m)",
					type: "number",
					placeholder: "0",
				},
				{
					key: "distancia_camara_caja_m",
					label: "Distancia cámara-caja (m)",
					type: "number",
					placeholder: "0",
				},
				{
					key: "ubicacion_descripcion",
					label: "Descripción de ubicación",
					type: "text",
					span: 2,
					placeholder: "Descripción del punto de montaje",
				},
			],
		},
		{
			id: "red_datos",
			title: "Red y transmisión",
			fields: [
				{
					key: "encoder_poe",
					label: "Encoder / POE",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "radio",
					label: "Radio",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "antena",
					label: "Antena",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "switch",
					label: "Switch",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "conexion_master",
					label: "Conexión master / NVR",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
			],
		},
		{
			id: "electrico",
			title: "Sistema eléctrico",
			fields: [
				{
					key: "alimentacion_ac",
					label: "Alimentación AC 110 VAC",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "sistema_fotovoltaico",
					label: "Sistema fotovoltaico",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "caja_conexion",
					label: "Caja de conexión",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "puesta_a_tierra",
					label: "Sistema de puesta a tierra",
					type: "select",
					options: CCTV_CONFORM_OPTIONS,
				},
				{
					key: "luces_obstruccion",
					label: "Luces de obstrucción",
					type: "select",
					options: [...CCTV_CONFORM_OPTIONS, { value: "no_aplica", label: "No aplica" }],
				},
			],
		},
		{
			id: "evidencias_fotograficas",
			title: "Registro fotográfico antes / después",
			description: "Tomar fotos de cada componente antes y después del mantenimiento",
			fields: [
				{
					key: "foto_camara_antes",
					label: "Cámara — Antes",
					type: "photo",
					componentName: "Cámara",
					required: true,
					hint: "Estado inicial de la cámara",
				},
				{
					key: "foto_camara_despues",
					label: "Cámara — Después",
					type: "photo",
					componentName: "Cámara",
					required: true,
					hint: "Estado final de la cámara",
				},
				{
					key: "foto_radioenlace_antes",
					label: "Radioenlace — Antes",
					type: "photo",
					componentName: "Radioenlace",
					hint: "Estado inicial del radioenlace",
				},
				{
					key: "foto_radioenlace_despues",
					label: "Radioenlace — Después",
					type: "photo",
					componentName: "Radioenlace",
					hint: "Estado final del radioenlace",
				},
				{
					key: "foto_caja_conexion_antes",
					label: "Caja de conexión CCTV — Antes",
					type: "photo",
					componentName: "Caja de conexión",
					hint: "Estado inicial de la caja",
				},
				{
					key: "foto_caja_conexion_despues",
					label: "Caja de conexión CCTV — Después",
					type: "photo",
					componentName: "Caja de conexión",
					hint: "Estado final de la caja",
				},
				{
					key: "foto_conexion_electrica_antes",
					label: "Conexión eléctrica — Antes",
					type: "photo",
					componentName: "Conexión eléctrica",
				},
				{
					key: "foto_conexion_electrica_despues",
					label: "Conexión eléctrica — Después",
					type: "photo",
					componentName: "Conexión eléctrica",
				},
				{
					key: "foto_puesta_tierra_antes",
					label: "Sistema puesta a tierra — Antes",
					type: "photo",
					componentName: "Puesta a tierra",
				},
				{
					key: "foto_puesta_tierra_despues",
					label: "Sistema puesta a tierra — Después",
					type: "photo",
					componentName: "Puesta a tierra",
				},
			],
		},
		{
			id: "hallazgos",
			title: "Hallazgos y acciones",
			fields: [
				{
					key: "hallazgos",
					label: "Hallazgos identificados",
					type: "textarea",
					placeholder: "Describir hallazgos técnicos encontrados durante el mantenimiento...",
					span: 2,
				},
				{
					key: "acciones_correctivas",
					label: "Acciones correctivas realizadas",
					type: "textarea",
					placeholder: "Acciones tomadas para corregir hallazgos...",
					span: 2,
				},
				{
					key: "observaciones",
					label: "Observaciones adicionales",
					type: "textarea",
					placeholder: "Otras observaciones...",
					span: 2,
				},
			],
		},
		{
			id: "firmas",
			title: "Firmas",
			fields: [
				{
					key: "firma_tecnico",
					label: "Firma del técnico",
					type: "signature",
					span: 2,
				},
				{
					key: "firma_supervisor",
					label: "Firma del supervisor",
					type: "signature",
					span: 2,
				},
			],
		},
	],
};

// ─────────────────────────────────────────────────────────────────────────────
// Registry — all templates by ID
// ─────────────────────────────────────────────────────────────────────────────

export const CERMONT_FORM_TEMPLATES: Record<string, CermontFormTemplate> = {
	[PLANNING_OBRA_TEMPLATE.id]: PLANNING_OBRA_TEMPLATE,
	[LINEAS_VIDA_TEMPLATE.id]: LINEAS_VIDA_TEMPLATE,
	[CCTV_TEMPLATE.id]: CCTV_TEMPLATE,
};

export const ALL_TEMPLATES = Object.values(CERMONT_FORM_TEMPLATES);

export function getFormTemplateById(
	id: string,
): CermontFormTemplate | undefined {
	return CERMONT_FORM_TEMPLATES[id];
}

export function getFormTemplatesByStepCode(
	stepCode: string,
): CermontFormTemplate[] {
	return ALL_TEMPLATES.filter((t) => t.stepCode === stepCode);
}

export function getFormTemplatesByWorkType(
	workType: string,
): CermontFormTemplate[] {
	return ALL_TEMPLATES.filter((t) =>
		t.workTypeHint.split(",").includes(workType),
	);
}
