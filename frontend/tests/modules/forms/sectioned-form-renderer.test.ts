/**
 * SectionedFormRenderer — template structure and validation tests.
 *
 * Verifies:
 * - Templates have sections with photo fields for CCTV
 * - Templates have sections with conformity fields for lifelines
 * - Templates have signature fields for planning
 * - Template section structure supports badge rendering
 * - Template field metadata is correct for summary display
 */

import { describe, expect, it } from "vitest";
import { CERMONT_FORM_TEMPLATES } from "@/modules/forms/templates/cermont-form-templates";

describe("SectionedFormRenderer — Template Structure for Summary Bar", () => {
	const cctv = CERMONT_FORM_TEMPLATES.cermont_cctv_v1;
	const lifeline = CERMONT_FORM_TEMPLATES.cermont_lineas_vida_v1;
	const planning = CERMONT_FORM_TEMPLATES.cermont_planeacion_obra_v1;

	it("CCTV template should have photo fields in evidencias_fotograficas section", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const section = cctv.sections.find((s) => s.id === "evidencias_fotograficas");
		expect(section).toBeDefined();
		const photoFields = section?.fields.filter((f) => f.type === "photo");
		expect(photoFields?.length).toBeGreaterThanOrEqual(8);
		expect(photoFields?.every((f) => f.type === "photo")).toBe(true);
	});

	it("CCTV template should have hallazgos and acciones sections", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const hallazgos = cctv.sections.find((s) => s.id === "hallazgos");
		expect(hallazgos).toBeDefined();
		const hallazgoField = hallazgos?.fields.find((f) => f.key === "hallazgos");
		expect(hallazgoField).toBeDefined();
		expect(hallazgoField?.type).toBe("textarea");

		const accionesField = hallazgos?.fields.find((f) => f.key === "acciones_correctivas");
		expect(accionesField).toBeDefined();
		expect(accionesField?.type).toBe("textarea");
	});

	it("CCTV template should have required photo fields for before/after", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const section = cctv.sections.find((s) => s.id === "evidencias_fotograficas");
		expect(section).toBeDefined();
		const requiredPhotos = section?.fields.filter((f) => f.type === "photo" && f.required);
		expect(requiredPhotos?.length).toBeGreaterThanOrEqual(2);
		const camaraAntes = section?.fields.find((f) => f.key === "foto_camara_antes");
		expect(camaraAntes?.required).toBe(true);
		const camaraDespues = section?.fields.find((f) => f.key === "foto_camara_despues");
		expect(camaraDespues?.required).toBe(true);
	});

	it("Lifeline template should have conformity fields in inspeccion_componentes section", () => {
		if (!lifeline) {
			throw new Error("Lifeline template not found");
		}
		const section = lifeline.sections.find((s) => s.id === "inspeccion_componentes");
		expect(section).toBeDefined();
		const conformityFields = section?.fields.filter((f) => f.type === "conformity");
		expect(conformityFields?.length).toBeGreaterThanOrEqual(4);
	});

	it("Lifeline template should have hallazgo and accion fields per component", () => {
		if (!lifeline) {
			throw new Error("Lifeline template not found");
		}
		const section = lifeline.sections.find((s) => s.id === "inspeccion_componentes");
		expect(section).toBeDefined();
		// Each component should have: estado (conformity), hallazgo (textarea), accion (textarea), foto (photo)
		const textareaFields = section?.fields.filter((f) => f.type === "textarea");
		expect(textareaFields?.length).toBeGreaterThanOrEqual(12); // 8 components * ~1.5 = 12+ textarea (hallazgo + accion)
	});

	it("Lifeline template should have concept section with fields", () => {
		if (!lifeline) {
			throw new Error("Lifeline template not found");
		}
		const section = lifeline.sections.find((s) => s.id === "concepto");
		expect(section).toBeDefined();
		const concepto = section?.fields.find((f) => f.key === "concepto_final");
		expect(concepto).toBeDefined();
		const observaciones = section?.fields.find((f) => f.key === "observaciones");
		expect(observaciones).toBeDefined();
	});

	it("Planning template should have signature fields", () => {
		if (!planning) {
			throw new Error("Planning template not found");
		}
		const section = planning.sections.find((s) => s.id === "firmas");
		expect(section).toBeDefined();
		const sigFields = section?.fields.filter((f) => f.type === "signature");
		expect(sigFields).toHaveLength(3);
	});

	it("Planning template should have seguridad section with checkbox EPP fields", () => {
		if (!planning) {
			throw new Error("Planning template not found");
		}
		const section = planning.sections.find((s) => s.id === "seguridad");
		expect(section).toBeDefined();
		const checkboxFields = section?.fields.filter((f) => f.type === "checkbox");
		expect(checkboxFields?.length).toBeGreaterThanOrEqual(4);
	});

	it("All templates should have sections with field counts displayable in summary bar", () => {
		const allTemplates = Object.values(CERMONT_FORM_TEMPLATES);
		for (const tpl of allTemplates) {
			expect(tpl.sections.length).toBeGreaterThan(0);
			for (const section of tpl.sections) {
				expect(section.fields.length).toBeGreaterThan(0);
				expect(section.id).toBeTruthy();
				expect(section.title).toBeTruthy();
			}
		}
	});

	it("Should count total fields across all sections", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const totalFields = cctv.sections.reduce((sum, s) => sum + s.fields.length, 0);
		expect(totalFields).toBeGreaterThan(20);
		// Verify section count for badge display
		expect(cctv.sections.length).toBe(7);
	});
});

describe("SectionedFormRenderer — Validation Logic", () => {
	const cctv = CERMONT_FORM_TEMPLATES.cermont_cctv_v1;

	it("should detect required photo fields on CCTV template", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const section = cctv.sections.find((s) => s.id === "evidencias_fotograficas");
		expect(section).toBeDefined();
		const requiredPhotos = section?.fields.filter((f) => f.type === "photo" && f.required);
		expect(requiredPhotos?.length).toBeGreaterThanOrEqual(2);
		requiredPhotos?.forEach((f) => {
			expect(f.key).toBeTruthy();
			expect(f.label).toBeTruthy();
		});
	});

	it("CCTV template should have all field types displayable in FieldRenderer", () => {
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		const supportedTypes = new Set([
			"text",
			"textarea",
			"number",
			"select",
			"date",
			"checkbox",
			"photo",
			"signature",
			"conformity",
		]);
		const allFields = cctv.sections.flatMap((s) => s.fields);
		for (const field of allFields) {
			expect(supportedTypes.has(field.type)).toBe(true);
		}
	});

	it("should support templates with sections alone (no flat fields)", () => {
		// Verify the template structure doesn't require flat `fields` array
		// Templates can use `sections` exclusively
		if (!cctv) {
			throw new Error("CCTV template not found");
		}
		// If a template has sections, fields can be empty
		expect(cctv.sections.length).toBeGreaterThan(0);
	});
});
