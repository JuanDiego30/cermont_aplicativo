/**
 * Seed Business Document Templates
 *
 * Seeds all 10 PDF business formats as dynamic template records.
 * Run: cd backend && npx tsx src/scripts/seed-business-documents.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import { BusinessDocument } from "../models/BusinessDocument";

const TEMPLATES = [
	{
		documentType: "work_planning",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "06_FORMATO_DE_PLANEACION_DE_OBRA.pdf",
		fieldMappings: [
			{ fieldName: "responsibleInspector", fieldType: "text", required: true },
			{ fieldName: "location", fieldType: "text", required: true },
			{ fieldName: "date", fieldType: "date", required: true },
			{ fieldName: "businessUnit", fieldType: "select", required: true },
			{ fieldName: "scope", fieldType: "text", required: true },
			{ fieldName: "materials", fieldType: "table", required: true },
			{ fieldName: "tools", fieldType: "table", required: true },
			{ fieldName: "equipment", fieldType: "table", required: true },
			{ fieldName: "safetyElements", fieldType: "table", required: true },
			{ fieldName: "electricians", fieldType: "number", required: true },
			{ fieldName: "telecomTechs", fieldType: "number", required: true },
			{ fieldName: "instrumentTechs", fieldType: "number", required: true },
			{ fieldName: "laborers", fieldType: "number", required: true },
			{ fieldName: "signatureInspector", fieldType: "signature", required: true },
			{ fieldName: "signatureSupervisor", fieldType: "signature", required: true },
		],
		metadata: {
			title: "Work Planning Format",
			description: "Formato de Planeacion de Obra - materials, tools, equipment, safety, personnel",
			businessUnit: ["IT", "MNT", "SC", "GEN"],
		},
	},
	{
		documentType: "cctv_maintenance",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "10_Formato_Mantenimiento_CCTV.pdf",
		fieldMappings: [
			{ fieldName: "cameraNumber", fieldType: "text", required: true },
			{ fieldName: "routineNumber", fieldType: "text", required: true },
			{ fieldName: "location", fieldType: "text", required: true },
			{ fieldName: "date", fieldType: "date", required: true },
			{ fieldName: "towerHeight", fieldType: "number" },
			{ fieldName: "distanceToJunction", fieldType: "number" },
			{ fieldName: "cameraHeight", fieldType: "number" },
			{ fieldName: "cameraType", fieldType: "text", required: true },
			{ fieldName: "cameraModel", fieldType: "text", required: true },
			{ fieldName: "cameraSerial", fieldType: "text" },
			{ fieldName: "encoderModel", fieldType: "text" },
			{ fieldName: "encoderSerial", fieldType: "text" },
			{ fieldName: "radioType", fieldType: "text" },
			{ fieldName: "radioModel", fieldType: "text" },
			{ fieldName: "radioSerial", fieldType: "text" },
			{ fieldName: "antennaType", fieldType: "text" },
			{ fieldName: "switchModel", fieldType: "text" },
			{ fieldName: "powerAc110", fieldType: "checkbox" },
			{ fieldName: "photovoltaicSystem", fieldType: "checkbox" },
			{ fieldName: "junctionBox", fieldType: "checkbox" },
			{ fieldName: "autoTransfer", fieldType: "checkbox" },
			{ fieldName: "cabinetOnTower", fieldType: "checkbox" },
			{ fieldName: "powerSource", fieldType: "text" },
			{ fieldName: "obstructionLights", fieldType: "text" },
			{ fieldName: "photoBefore", fieldType: "photo" },
			{ fieldName: "photoAfter", fieldType: "photo" },
			{ fieldName: "technicianSignature", fieldType: "signature", required: true },
		],
		metadata: {
			title: "CCTV Preventive Maintenance Report",
			description: "Formato Mantenimiento CCTV - camera, radio, electrical inspection",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "lifeline_inspection",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "08_Formato_Inspeccion_lineas_de_vida_Vertical.pdf",
		fieldMappings: [
			{ fieldName: "projectName", fieldType: "text", required: true },
			{ fieldName: "inspectionDate", fieldType: "date", required: true },
			{ fieldName: "lifelineLocation", fieldType: "text", required: true },
			{ fieldName: "lifelineLength", fieldType: "number", required: true },
			{ fieldName: "upperAnchorPlate", fieldType: "table", required: true },
			{ fieldName: "supportPlates", fieldType: "table", required: true },
			{ fieldName: "energyAbsorber", fieldType: "table", required: true },
			{ fieldName: "tensionSystem", fieldType: "table", required: true },
			{ fieldName: "stainlessSteelCable", fieldType: "table", required: true },
			{ fieldName: "cableGuideSupport", fieldType: "table", required: true },
			{ fieldName: "lowerAnchorPlate", fieldType: "table", required: true },
			{ fieldName: "identificationPlate", fieldType: "table", required: true },
			{ fieldName: "finalConcept", fieldType: "select", validation: "APTO_NO_APTO" },
			{ fieldName: "inspectorName", fieldType: "text", required: true },
			{ fieldName: "inspectorSignature", fieldType: "signature", required: true },
		],
		metadata: {
			title: "Vertical Lifeline Inspection Form",
			description: "Formato OPE-006 - Inspeccion de lineas de vida verticales",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "sgsst_induction",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "02_INDUCCION_SGSST.pdf",
		fieldMappings: [
			{ fieldName: "employeeName", fieldType: "text", required: true },
			{ fieldName: "employeeId", fieldType: "text", required: true },
			{ fieldName: "inductionDate", fieldType: "date", required: true },
			{ fieldName: "companyInfo", fieldType: "text" },
			{ fieldName: "economicActivity", fieldType: "text" },
			{ fieldName: "mission", fieldType: "text" },
			{ fieldName: "vision", fieldType: "text" },
			{ fieldName: "safetyPolicies", fieldType: "checkbox" },
			{ fieldName: "hazardIdentification", fieldType: "table" },
			{ fieldName: "emergencyProcedures", fieldType: "text" },
			{ fieldName: "ppeRequirements", fieldType: "table" },
			{ fieldName: "workPermits", fieldType: "checkbox" },
			{ fieldName: "signatureEmployee", fieldType: "signature", required: true },
			{ fieldName: "signatureInstructor", fieldType: "signature", required: true },
		],
		metadata: {
			title: "SGSST Induction & Reinduction",
			description: "Induccion y reinduccion HES - safety training for field personnel",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "ladder_anchor_photo",
		formatType: "image",
		version: "1.0",
		sourceFile: "05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA.pdf",
		fieldMappings: [
			{ fieldName: "projectName", fieldType: "text", required: true },
			{ fieldName: "anchorDate", fieldType: "date", required: true },
			{ fieldName: "anchorLocation", fieldType: "text", required: true },
			{ fieldName: "ladderType", fieldType: "select", required: true },
			{ fieldName: "structureType", fieldType: "text", required: true },
			{ fieldName: "anchorPhoto1", fieldType: "photo", required: true },
			{ fieldName: "anchorPhoto2", fieldType: "photo", required: true },
			{ fieldName: "anchorPhoto3", fieldType: "photo" },
			{ fieldName: "anchorPhoto4", fieldType: "photo" },
			{ fieldName: "observations", fieldType: "textarea" },
			{ fieldName: "inspectorSignature", fieldType: "signature", required: true },
		],
		metadata: {
			title: "Ladder Anchor Photo Registry",
			description: "Fotos de anclaje de escalera a estructura - photo evidence of ladder anchoring",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "safety_control_hierarchy",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "03_Jerarquia_de_controles_Cermont.pdf",
		fieldMappings: [
			{ fieldName: "workDescription", fieldType: "text", required: true },
			{ fieldName: "assessmentDate", fieldType: "date", required: true },
			{ fieldName: "eliminationMeasures", fieldType: "textarea" },
			{ fieldName: "substitutionMeasures", fieldType: "textarea" },
			{ fieldName: "engineeringControls", fieldType: "textarea" },
			{ fieldName: "administrativeControls", fieldType: "textarea" },
			{ fieldName: "ppeRequired", fieldType: "table" },
			{ fieldName: "residualRiskLevel", fieldType: "select", validation: "ALTO_MEDIO_BAJO" },
			{ fieldName: "responsibleName", fieldType: "text", required: true },
			{ fieldName: "responsibleSignature", fieldType: "signature", required: true },
		],
		metadata: {
			title: "Safety Control Hierarchy",
			description: "Jerarquia de controles Cermont - risk assessment and control measures",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "field_permit",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "field_permit_template.pdf",
		fieldMappings: [
			{ fieldName: "permitNumber", fieldType: "text", required: true },
			{ fieldName: "workDescription", fieldType: "text", required: true },
			{ fieldName: "location", fieldType: "text", required: true },
			{ fieldName: "startDate", fieldType: "date", required: true },
			{ fieldName: "endDate", fieldType: "date", required: true },
			{ fieldName: "supervisorName", fieldType: "text", required: true },
			{ fieldName: "workerNames", fieldType: "table", required: true },
			{ fieldName: "hazardAssessment", fieldType: "table", required: true },
			{ fieldName: "protectiveMeasures", fieldType: "checkbox" },
			{ fieldName: "emergencyContact", fieldType: "text", required: true },
			{ fieldName: "signatureIssuer", fieldType: "signature", required: true },
			{ fieldName: "signatureReceiver", fieldType: "signature", required: true },
		],
		metadata: {
			title: "Field Work Permit",
			description: "Permiso de trabajo en campo - hazard assessment and authorization",
			regulatoryBody: "SGSST",
		},
	},
	{
		documentType: "ast_safety_analysis",
		formatType: "pdf",
		version: "1.0",
		sourceFile: "ast_safety_analysis_template.pdf",
		fieldMappings: [
			{ fieldName: "jobDescription", fieldType: "text", required: true },
			{ fieldName: "analysisDate", fieldType: "date", required: true },
			{ fieldName: "location", fieldType: "text", required: true },
			{ fieldName: "teamMembers", fieldType: "table", required: true },
			{ fieldName: "workSteps", fieldType: "table", required: true },
			{ fieldName: "potentialHazards", fieldType: "table", required: true },
			{ fieldName: "safeProcedures", fieldType: "table", required: true },
			{ fieldName: "additionalRequirements", fieldType: "textarea" },
			{ fieldName: "signatureAnalyst", fieldType: "signature", required: true },
			{ fieldName: "signatureReviewer", fieldType: "signature", required: true },
		],
		metadata: {
			title: "AST Safety Analysis",
			description: "Job Safety Analysis - step-by-step hazard identification and safe procedures",
			regulatoryBody: "SGSST",
		},
	},
];

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont";

async function seed() {
	await mongoose.connect(MONGO_URI);
	console.log("Connected to MongoDB");

	for (const tpl of TEMPLATES) {
		const existing = await BusinessDocument.findOne({ documentType: tpl.documentType } as Record<
			string,
			unknown
		>);
		if (!existing) {
			await BusinessDocument.create(tpl as unknown as Record<string, unknown>);
			console.log(`  CREATED: ${tpl.documentType} (${tpl.metadata.title})`);
		} else {
			console.log(`  EXISTS:  ${tpl.documentType} (${tpl.metadata.title})`);
		}
	}

	console.log(`\nSeed complete: ${TEMPLATES.length} templates processed`);
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
