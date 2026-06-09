/**
 * Seed script — CERMONT Real Form Templates
 *
 * Creates the 3 mandatory dynamic form templates derived from
 * CERMONT's actual operational formats (docs/pdf docs 06, 08, 10).
 *
 * Run: npx tsx backend/scripts/seed-cermont-forms.ts
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DynamicFormTemplate } from "../src/models/DynamicFormTemplate";
import { User } from "../src/models/User";

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cermont";

async function seed() {
	await mongoose.connect(MONGO_URI);
	console.log("Connected to MongoDB");

	const adminUser = await User.findOne({ role: "gerente" }).sort({ createdAt: 1 });
	if (!adminUser) {
		console.error("No admin user found. Run seed first.");
		process.exit(1);
	}
	const createdBy = adminUser._id;

	// ──── 1. CCTV Preventive Maintenance Form ─────────────────────────────────
	const cctvForm = {
		name: "Mantenimiento Preventivo CCTV",
		description:
			"Formato real CERMONT para inspección y mantenimiento preventivo de cámaras CCTV. Incluye componentes: cámara, encoder/POE, radio, antena, switch, sistema eléctrico, fotovoltaico, caja de conexión, puesta a tierra.",
		status: "active" as const,
		version: 1,
		createdBy,
		fields: [
			{
				key: "camara_no",
				label: "Cámara No.",
				type: "text" as const,
				required: true,
				placeholder: "Ej: CAM-001",
			},
			{
				key: "rutina_no",
				label: "Rutina No.",
				type: "text" as const,
				required: true,
				placeholder: "Ej: RUT-2026-001",
			},
			{
				key: "lugar",
				label: "Lugar",
				type: "text" as const,
				required: true,
				placeholder: "Ubicación de la cámara",
			},
			{
				key: "fecha",
				label: "Fecha",
				type: "date" as const,
				required: true,
			},
			{
				key: "altura_estructura",
				label: "Altura estructura (m)",
				type: "number" as const,
				required: true,
				placeholder: "Ej: 30",
			},
			{
				key: "distancia_camara_caja",
				label: "Distancia cámara - caja conexión (m)",
				type: "number" as const,
				required: true,
				placeholder: "Ej: 5",
			},
			{
				key: "altura_camara",
				label: "Altura cámara (m)",
				type: "number" as const,
				required: true,
				placeholder: "Ej: 25",
			},
			{
				key: "tipo_camara",
				label: "Tipo de cámara",
				type: "text" as const,
				required: true,
				placeholder: "Marca y modelo",
			},
			{
				key: "modelo_camara",
				label: "Modelo cámara",
				type: "text" as const,
				required: true,
			},
			{
				key: "serial_camara",
				label: "Serial cámara",
				type: "text" as const,
				required: true,
			},
			{
				key: "encoder_poe",
				label: "Encoder / POE",
				type: "text" as const,
				placeholder: "Modelo y serial",
			},
			{
				key: "tipo_radio",
				label: "Tipo de radio",
				type: "text" as const,
				placeholder: "Marca y modelo",
			},
			{
				key: "antena_externa",
				label: "Antena externa",
				type: "text" as const,
				placeholder: "Tipo y serial",
			},
			{
				key: "switch_modelo",
				label: "Switch",
				type: "text" as const,
				placeholder: "Modelo",
			},
			{
				key: "alimentacion_ac",
				label: "Alimentación AC 110 VAC",
				type: "select" as const,
				required: true,
				options: [
					{ value: "si", label: "Sí" },
					{ value: "no", label: "No" },
				],
			},
			{
				key: "sistema_fotovoltaico",
				label: "Sistema fotovoltaico",
				type: "select" as const,
				options: [
					{ value: "si", label: "Sí" },
					{ value: "no", label: "No" },
				],
			},
			{
				key: "caja_conexion",
				label: "Caja de conexión",
				type: "select" as const,
				options: [
					{ value: "si", label: "Sí" },
					{ value: "no", label: "No" },
				],
			},
			{
				key: "sistema_puesta_tierra",
				label: "Sistema de puesta a tierra",
				type: "select" as const,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
					{ value: "no_aplica", label: "No aplica" },
				],
			},
			{
				key: "observaciones",
				label: "Observaciones",
				type: "textarea" as const,
				placeholder: "Hallazgos, acciones correctivas, notas...",
			},
			{
				key: "foto_camara_antes",
				label: "Foto cámara - ANTES",
				type: "file" as const,
			},
			{
				key: "foto_camara_durante",
				label: "Foto cámara - DURANTE",
				type: "file" as const,
			},
			{
				key: "foto_camara_despues",
				label: "Foto cámara - DESPUÉS",
				type: "file" as const,
			},
			{
				key: "foto_radioenlace",
				label: "Foto radioenlace",
				type: "file" as const,
			},
			{
				key: "foto_caja_conexiones",
				label: "Foto caja de conexiones",
				type: "file" as const,
			},
			{
				key: "foto_conexion_electrica",
				label: "Foto conexión eléctrica",
				type: "file" as const,
			},
			{
				key: "foto_puesta_tierra",
				label: "Foto sistema puesta a tierra",
				type: "file" as const,
			},
			{
				key: "gps_camara",
				label: "GPS - Ubicación cámara",
				type: "gps" as const,
			},
		],
	};

	// ──── 2. Lifeline Vertical Inspection Form ────────────────────────────────
	const lifelineForm = {
		name: "Inspección Líneas de Vida Verticales",
		description:
			"Formato real CERMONT OPE-006 para inspección periódica de líneas de vida verticales. Evalúa 11 componentes con estado conforme/no conforme, hallazgo, acción correctiva y observaciones.",
		status: "active" as const,
		version: 1,
		createdBy,
		fields: [
			{
				key: "torre_identificacion",
				label: "Identificación de torre",
				type: "text" as const,
				required: true,
				placeholder: "Ej: TORRE CAÑO-01",
			},
			{
				key: "fecha_inspeccion",
				label: "Fecha de inspección",
				type: "date" as const,
				required: true,
			},
			{
				key: "fecha_instalacion",
				label: "Fecha de instalación",
				type: "date" as const,
			},
			{
				key: "fecha_ultimo_mantenimiento",
				label: "Fecha último mantenimiento",
				type: "date" as const,
			},
			{
				key: "tipo_soporte",
				label: "Tipo de soporte",
				type: "text" as const,
				placeholder: "Ej: Escalera fija a estructura",
			},
			{
				key: "cable_diametro",
				label: "Diámetro del cable (mm)",
				type: "number" as const,
				placeholder: "Ej: 8",
			},
			{
				key: "cable_tipo",
				label: "Tipo de cable",
				type: "text" as const,
				placeholder: "Ej: Acero Inoxidable 316",
			},
			{
				key: "cable_longitud",
				label: "Longitud total del cable (m)",
				type: "number" as const,
				placeholder: "Ej: 45",
			},
			{
				key: "fabricante",
				label: "Fabricante",
				type: "text" as const,
				placeholder: "Ej: Orbit",
			},
			{
				key: "concepto_final",
				label: "Concepto final de inspección",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "conforme_observaciones", label: "Conforme con observaciones" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},

			// ── Components evaluation (grouped) ──
			{
				key: "placa_anclaje_superior",
				label: "Placa de anclaje superior - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "placa_anclaje_superior_hallazgo",
				label: "Placa anclaje superior - Hallazgo",
				type: "text" as const,
				placeholder: "Grietas, corrosión, etc.",
			},
			{
				key: "platinas_sujecion",
				label: "Platinas de sujeción - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "platinas_sujecion_hallazgo",
				label: "Platinas sujeción - Hallazgo",
				type: "text" as const,
				placeholder: "Tornillos, corrosión, grietas",
			},
			{
				key: "absorbedor_energia",
				label: "Absorbedor de energía - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "sistema_tensor",
				label: "Sistema tensor - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "cable_acero",
				label: "Cable acero inoxidable - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "cable_acero_hallazgo",
				label: "Cable acero - Hallazgo",
				type: "text" as const,
				placeholder: "Torceduras, aplastamientos, desgaste, hilos sueltos",
			},
			{
				key: "soporte_cable_guia",
				label: "Soporte cable guía - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "soporte_cable_guia_distancia",
				label: "Soporte cable guía cada 10m - Cumple",
				type: "select" as const,
				options: [
					{ value: "si", label: "Sí" },
					{ value: "no", label: "No" },
				],
			},
			{
				key: "placa_anclaje_inferior",
				label: "Placa de anclaje inferior - Estado",
				type: "select" as const,
				required: true,
				options: [
					{ value: "conforme", label: "Conforme" },
					{ value: "no_conforme", label: "No conforme" },
				],
			},
			{
				key: "placa_identificacion",
				label: "Placa de identificación - Legible",
				type: "select" as const,
				options: [
					{ value: "si", label: "Sí" },
					{ value: "no", label: "No" },
				],
			},
			{
				key: "accion_correctiva",
				label: "Acción correctiva general",
				type: "textarea" as const,
				placeholder: "Describa las acciones correctivas requeridas...",
			},
			{
				key: "observaciones",
				label: "Observaciones",
				type: "textarea" as const,
			},
			{
				key: "foto_placa_superior",
				label: "Foto placa anclaje superior",
				type: "file" as const,
			},
			{
				key: "foto_absorbedor",
				label: "Foto absorbedor de energía",
				type: "file" as const,
			},
			{
				key: "foto_tensor",
				label: "Foto sistema tensor",
				type: "file" as const,
			},
			{
				key: "foto_cable",
				label: "Foto cable acero",
				type: "file" as const,
			},
			{
				key: "foto_placa_inferior",
				label: "Foto placa anclaje inferior",
				type: "file" as const,
			},
			{
				key: "foto_panoramica",
				label: "Foto panorámica torre",
				type: "file" as const,
			},
			{
				key: "gps_torre",
				label: "GPS - Ubicación torre",
				type: "gps" as const,
			},
		],
	};

	// ──── 3. Work Planning Form ──────────────────────────────────────────────
	const planningForm = {
		name: "Planeación de Obra",
		description:
			"Formato real CERMONT de planeación de obra. Incluye responsable, lugar, alcance, materiales, herramientas, equipos, EPP, número de trabajadores y firmas.",
		status: "active" as const,
		version: 1,
		createdBy,
		fields: [
			{
				key: "responsable",
				label: "Responsable de la inspección",
				type: "text" as const,
				required: true,
			},
			{
				key: "lugar",
				label: "Lugar",
				type: "text" as const,
				required: true,
			},
			{
				key: "fecha",
				label: "Fecha",
				type: "date" as const,
				required: true,
			},
			{
				key: "unidad_negocio",
				label: "Unidad de negocio",
				type: "select" as const,
				required: true,
				options: [
					{ value: "instalacion_mantenimiento", label: "IT MNT" },
					{ value: "service_contract", label: "SC" },
					{ value: "general", label: "GEN" },
					{ value: "otros", label: "Otros" },
				],
				allowCustomOption: true,
				customOptionLabel: "Otra unidad",
			},
			{
				key: "alcance",
				label: "Alcance",
				type: "textarea" as const,
				required: true,
				placeholder: "Descripción del alcance de los trabajos",
			},
			{
				key: "materiales_descripcion",
				label: "Materiales requeridos",
				type: "textarea" as const,
				placeholder: "Lista de materiales: descripción y cantidad",
			},
			{
				key: "herramientas",
				label: "Herramientas requeridas",
				type: "textarea" as const,
				placeholder: "Lista de herramientas: descripción y cantidad",
			},
			{
				key: "equipos",
				label: "Equipos requeridos",
				type: "textarea" as const,
				placeholder: "Lista de equipos: descripción y cantidad",
			},
			{
				key: "elementos_seguridad",
				label: "Elementos de seguridad (EPP)",
				type: "textarea" as const,
				placeholder: "Lista de EPP: descripción y cantidad",
			},
			{
				key: "num_electricistas",
				label: "Número de electricistas",
				type: "number" as const,
				placeholder: "0",
			},
			{
				key: "num_tecnicos_telco",
				label: "Técnicos en telecomunicación",
				type: "number" as const,
				placeholder: "0",
			},
			{
				key: "num_instrumentistas",
				label: "Instrumentistas",
				type: "number" as const,
				placeholder: "0",
			},
			{
				key: "num_obreros",
				label: "Obreros",
				type: "number" as const,
				placeholder: "0",
			},
			{
				key: "firma_residente",
				label: "Firma Ing. Residente",
				type: "signature" as const,
			},
			{
				key: "firma_tecnico",
				label: "Firma Técnico Electricista",
				type: "signature" as const,
			},
			{
				key: "firma_hes",
				label: "Firma HES",
				type: "signature" as const,
			},
		],
	};

	// Upsert each template — update if exists, create if not
	for (const template of [cctvForm, lifelineForm, planningForm]) {
		const existing = await DynamicFormTemplate.findOne({ name: template.name });
		if (existing) {
			await DynamicFormTemplate.findByIdAndUpdate(existing._id, {
				...template,
				version: existing.version + 1,
			});
			console.log(`Updated template: ${template.name} (v${existing.version + 1})`);
		} else {
			await DynamicFormTemplate.create(template);
			console.log(`Created template: ${template.name} (v1)`);
		}
	}

	console.log("\n✅ CERMONT form templates seeded successfully!");
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
