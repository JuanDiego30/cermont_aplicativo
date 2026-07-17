/**
 * CERMONT Form Templates — tests for template registry and lookup.
 *
 * Verifies:
 * - All templates registered
 * - Lookup functions work correctly
 * - Templates have required sections
 * - CCTV template has photo evidence fields
 * - Lifeline template has conformity fields
 * - Planning template has all required sections
 */

import { describe, expect, it } from "vitest";
import {
	ALL_TEMPLATES,
	CERMONT_FORM_TEMPLATES,
	getFormTemplateById,
	getFormTemplatesByStepCode,
	getFormTemplatesByWorkType,
} from "@/modules/forms/templates/cermont-form-templates";

describe("CERMONT Form Templates Registry", () => {
	it("should have all 3 templates registered", () => {
		expect(ALL_TEMPLATES).toHaveLength(3);
	});

	it("should have planning obra template", () => {
		const tpl = CERMONT_FORM_TEMPLATES.cermont_planeacion_obra_v1;
		expect(tpl).toBeDefined();
		expect(tpl?.name).toContain("Planeación");
		expect(tpl?.stepCode).toBe("step_05_planning");
	});

	it("should have CCTV template", () => {
		const tpl = CERMONT_FORM_TEMPLATES.cermont_cctv_v1;
		expect(tpl).toBeDefined();
		expect(tpl?.name).toContain("CCTV");
		expect(tpl?.stepCode).toBe("step_06_execution");
	});

	it("should have lineas de vida template", () => {
		const tpl = CERMONT_FORM_TEMPLATES.cermont_lineas_vida_v1;
		expect(tpl).toBeDefined();
		expect(tpl?.name).toContain("Líneas");
		expect(tpl?.stepCode).toBe("step_06_execution");
	});

	it("getFormTemplateById should find template", () => {
		const tpl = getFormTemplateById("cermont_planeacion_obra_v1");
		expect(tpl).toBeDefined();
		expect(tpl?.sections.length).toBeGreaterThan(4);
	});

	it("getFormTemplateById should return undefined for unknown", () => {
		const tpl = getFormTemplateById("nonexistent");
		expect(tpl).toBeUndefined();
	});

	it("getFormTemplatesByStepCode should filter correctly", () => {
		const planning = getFormTemplatesByStepCode("step_05_planning");
		expect(planning).toHaveLength(1);

		const execution = getFormTemplatesByStepCode("step_06_execution");
		expect(execution).toHaveLength(2); // CCTV + Lifelines
	});

	it("getFormTemplatesByWorkType should match", () => {
		const cctv = getFormTemplatesByWorkType("cctv");
		expect(cctv).toHaveLength(1);
		expect(cctv[0]?.id).toBe("cermont_cctv_v1");
	});
});

describe("Planning Obra Template", () => {
	const tpl = CERMONT_FORM_TEMPLATES.cermont_planeacion_obra_v1;
	if (!tpl) {
		throw new Error("Planning template not found");
	}

	it("should have encabezado section with required fields", () => {
		const section = tpl.sections.find((s) => s.id === "encabezado");
		expect(section).toBeDefined();
		const responsable = section?.fields.find((f) => f.key === "responsable_inspeccion");
		expect(responsable?.required).toBe(true);
	});

	it("should have firmas section with 3 signature fields", () => {
		const section = tpl.sections.find((s) => s.id === "firmas");
		expect(section).toBeDefined();
		const signatures = section?.fields.filter((f) => f.type === "signature");
		expect(signatures).toHaveLength(3);
	});

	it("should have personal section with 4 worker types", () => {
		const section = tpl.sections.find((s) => s.id === "cuadrilla");
		expect(section).toBeDefined();
		const numberFields = section?.fields.filter((f) => f.type === "number");
		expect(numberFields).toHaveLength(4);
	});
});

describe("CCTV Template", () => {
	const tpl = CERMONT_FORM_TEMPLATES.cermont_cctv_v1;
	if (!tpl) {
		throw new Error("CCTV template not found");
	}

	it("should have photo evidence fields for before/after", () => {
		const section = tpl.sections.find((s) => s.id === "evidencias_fotograficas");
		expect(section).toBeDefined();
		const photoFields = section?.fields.filter((f) => f.type === "photo");
		expect(photoFields?.length).toBeGreaterThanOrEqual(8);
		const beforeAfter = photoFields?.filter(
			(f) => f.key.includes("antes") || f.key.includes("despues"),
		);
		expect(beforeAfter?.length).toBeGreaterThanOrEqual(6);
	});

	it("should have hallazgos section", () => {
		const section = tpl.sections.find((s) => s.id === "hallazgos");
		expect(section).toBeDefined();
	});

	it("should use conformity type for evaluation fields instead of select", () => {
		const redDatos = tpl.sections.find((s) => s.id === "red_datos");
		expect(redDatos).toBeDefined();
		const evalFields = redDatos?.fields.filter((f) => f.type === "conformity");
		expect(evalFields?.length).toBeGreaterThanOrEqual(5);

		const electrico = tpl.sections.find((s) => s.id === "electrico");
		expect(electrico).toBeDefined();
		const elecEvalFields = electrico?.fields.filter((f) => f.type === "conformity");
		expect(elecEvalFields?.length).toBeGreaterThanOrEqual(5);
	});

	it("should have hallazgo fields for each evaluation component in red_datos", () => {
		const redDatos = tpl.sections.find((s) => s.id === "red_datos");
		expect(redDatos).toBeDefined();
		const hallazgoFields = redDatos?.fields.filter(
			(f) => f.type === "textarea" && f.key.includes("hallazgo"),
		);
		expect(hallazgoFields?.length).toBeGreaterThanOrEqual(5);
	});
});

describe("Lifeline Template", () => {
	const tpl = CERMONT_FORM_TEMPLATES.cermont_lineas_vida_v1;
	if (!tpl) {
		throw new Error("Lifeline template not found");
	}

	it("should have inspection components section with conformity fields", () => {
		const section = tpl.sections.find((s) => s.id === "inspeccion_componentes");
		expect(section).toBeDefined();
		const conformityFields = section?.fields.filter((f) => f.type === "conformity");
		expect(conformityFields?.length).toBeGreaterThanOrEqual(4);
	});

	it("should have concepto final section", () => {
		const section = tpl.sections.find((s) => s.id === "concepto");
		expect(section).toBeDefined();
		const concepto = section?.fields.find((f) => f.key === "concepto_final");
		expect(concepto).toBeDefined();
		expect(concepto?.required).toBe(true);
	});
});
