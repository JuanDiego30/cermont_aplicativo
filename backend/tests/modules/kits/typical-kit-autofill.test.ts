/**
 * Typical Kit Autofill — Unit tests
 *
 * Validates the CERMONT-specific kit templates for CCTV and Líneas de vida:
 * - Kit registry contains correct entries
 * - CCTV kit includes mandatory field-relevant components (cámara, radioenlace, EPP, formats)
 * - Lifeline kit includes all anchoring components (placa, cable, absorbedor, tensor, format)
 * - getDefaultKitForOrderType returns the correct kit by type
 * - getKitsByType filters correctly
 * - getKitTemplate returns not_found for unknown IDs
 */

import { describe, expect, it } from "vitest";
import {
	applyKitTemplateToPlanningPacketData,
	getDefaultKitForOrderType,
	getKitsByType,
	getKitTemplate,
	KIT_REGISTRY,
	listAllKits,
} from "../../../src/config/kit-templates";

describe("KIT_REGISTRY — completeness", () => {
	it("contains all 8 kit templates (5 generic + 3 domain-specific)", () => {
		const ids = Object.keys(KIT_REGISTRY);
		expect(ids).toContain("kit-maintenance-001");
		expect(ids).toContain("kit-inspection-001");
		expect(ids).toContain("kit-installation-001");
		expect(ids).toContain("kit-repair-001");
		expect(ids).toContain("kit-decommission-001");
		expect(ids).toContain("kit-cctv-001");
		expect(ids).toContain("kit-lifeline-001");
		expect(ids).toContain("kit-electrical-001");
		expect(ids).toHaveLength(8);
	});

	it("all kits have required fields", () => {
		for (const kit of Object.values(KIT_REGISTRY)) {
			expect(kit.id).toBeTruthy();
			expect(kit.name).toBeTruthy();
			expect(kit.description).toBeTruthy();
			expect(kit.type).toBeTruthy();
			expect(kit.materials.length).toBeGreaterThan(0);
		}
	});

	it("all materials have name, quantity, and unit", () => {
		for (const kit of Object.values(KIT_REGISTRY)) {
			for (const mat of kit.materials) {
				expect(mat.name, `${kit.id}: material name`).toBeTruthy();
				expect(mat.quantity, `${kit.id}: material quantity`).toBeGreaterThan(0);
				expect(mat.unit, `${kit.id}: material unit`).toBeTruthy();
			}
		}
	});
});

describe("KIT CCTV — kit-cctv-001", () => {
	const kit = KIT_REGISTRY["kit-cctv-001"];

	it("has type 'cctv'", () => {
		expect(kit?.type).toBe("cctv");
	});

	it("includes cámara-related item", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasCamara = names.some(
			(n) =>
				n.includes("cámara") ||
				n.includes("camara") ||
				n.includes("soporte") ||
				n.includes("lente"),
		);
		expect(hasCamara).toBe(true);
	});

	it("includes radioenlace / UTP / POE item", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasRf = names.some(
			(n) =>
				n.includes("antena") || n.includes("utp") || n.includes("poe") || n.includes("radioenlace"),
		);
		expect(hasRf).toBe(true);
	});

	it("includes EPP (arnés o guantes)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasEpp = names.some(
			(n) =>
				n.includes("arnés") || n.includes("arnes") || n.includes("guante") || n.includes("casco"),
		);
		expect(hasEpp).toBe(true);
	});

	it("includes maintenance format", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasFormat = names.some(
			(n) => n.includes("formato") || n.includes("f-mt") || n.includes("permiso"),
		);
		expect(hasFormat).toBe(true);
	});

	it("includes grounding system item (puesta a tierra)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasGround = names.some(
			(n) => n.includes("tierra") || n.includes("cobre") || n.includes("cuña"),
		);
		expect(hasGround).toBe(true);
	});
});

describe("KIT Líneas de Vida — kit-lifeline-001", () => {
	const kit = KIT_REGISTRY["kit-lifeline-001"];

	it("has type 'lifeline'", () => {
		expect(kit?.type).toBe("lifeline");
	});

	it("includes upper anchor plate (placa anclaje superior)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasPlaca = names.some(
			(n) => n.includes("placa anclaje superior") || n.includes("placa de anclaje"),
		);
		expect(hasPlaca).toBe(true);
	});

	it("includes stainless steel cable (cable acero inoxidable)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasCable = names.some(
			(n) => n.includes("cable") && (n.includes("inox") || n.includes("acero")),
		);
		expect(hasCable).toBe(true);
	});

	it("includes energy absorber (absorbedor de energía)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasAbsorber = names.some((n) => n.includes("absorbedor"));
		expect(hasAbsorber).toBe(true);
	});

	it("includes tensioning system", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasTensor = names.some((n) => n.includes("tensor"));
		expect(hasTensor).toBe(true);
	});

	it("includes inspection format", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasFormat = names.some(
			(n) => n.includes("formato") || n.includes("f-in") || n.includes("ast"),
		);
		expect(hasFormat).toBe(true);
	});

	it("includes lower anchor plate (placa anclaje inferior)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasInferior = names.some(
			(n) => n.includes("inferior") || n.includes("placa anclaje inferior"),
		);
		expect(hasInferior).toBe(true);
	});

	it("includes identification plate (placa identificación)", () => {
		const names = kit?.materials.map((m) => m.name.toLowerCase()) ?? [];
		const hasId = names.some(
			(n) =>
				n.includes("identificación") || n.includes("identificacion") || n.includes("trazabilidad"),
		);
		expect(hasId).toBe(true);
	});
});

describe("getDefaultKitForOrderType", () => {
	it("returns KIT_CCTV for type 'cctv'", () => {
		const kit = getDefaultKitForOrderType("cctv");
		expect("id" in kit && kit.id).toBe("kit-cctv-001");
	});

	it("returns KIT_LIFELINE for type 'lifeline'", () => {
		const kit = getDefaultKitForOrderType("lifeline");
		expect("id" in kit && kit.id).toBe("kit-lifeline-001");
	});

	it("returns KIT_MAINTENANCE for type 'maintenance'", () => {
		const kit = getDefaultKitForOrderType("maintenance");
		expect("id" in kit && kit.id).toBe("kit-maintenance-001");
	});

	it("returns KIT_INSPECTION for type 'inspection'", () => {
		const kit = getDefaultKitForOrderType("inspection");
		expect("id" in kit && kit.id).toBe("kit-inspection-001");
	});

	it("returns not_found for type 'other'", () => {
		const result = getDefaultKitForOrderType("other");
		expect("status" in result && result.status).toBe("not_found");
	});
});

describe("getKitTemplate", () => {
	it("returns the CCTV kit by id", () => {
		const kit = getKitTemplate("kit-cctv-001");
		expect("id" in kit && kit.id).toBe("kit-cctv-001");
	});

	it("returns the lifeline kit by id", () => {
		const kit = getKitTemplate("kit-lifeline-001");
		expect("id" in kit && kit.id).toBe("kit-lifeline-001");
	});

	it("returns not_found for unknown id", () => {
		const result = getKitTemplate("kit-does-not-exist");
		expect("status" in result && result.status).toBe("not_found");
	});
});

describe("getKitsByType", () => {
	it("returns only cctv kits when filtering by 'cctv'", () => {
		const kits = getKitsByType("cctv");
		expect(kits).toHaveLength(1);
		expect(kits[0]?.id).toBe("kit-cctv-001");
	});

	it("returns only lifeline kits when filtering by 'lifeline'", () => {
		const kits = getKitsByType("lifeline");
		expect(kits).toHaveLength(1);
		expect(kits[0]?.id).toBe("kit-lifeline-001");
	});

	it("returns only maintenance kits when filtering by 'maintenance'", () => {
		const kits = getKitsByType("maintenance");
		expect(kits).toHaveLength(1);
		expect(kits[0]?.id).toBe("kit-maintenance-001");
	});
});

describe("listAllKits", () => {
	it("returns all 8 kits", () => {
		expect(listAllKits()).toHaveLength(8);
	});
});

describe("getDefaultKitForOrderType — new types", () => {
	it("returns KIT_ELECTRICAL for type 'electrical'", () => {
		const kit = getDefaultKitForOrderType("electrical");
		expect("id" in kit && kit.id).toBe("kit-electrical-001");
	});

	it("returns KIT_INSPECTION for type 'safety'", () => {
		const kit = getDefaultKitForOrderType("safety");
		expect("id" in kit && kit.id).toBe("kit-inspection-001");
	});
});

describe("KIT Electrical — kit-electrical-001", () => {
	const kit = KIT_REGISTRY["kit-electrical-001"];

	it("has type 'electrical'", () => {
		expect(kit?.type).toBe("electrical");
	});

	it("has tools, equipment, safetyElements, and workerCount", () => {
		expect(kit?.tools?.length).toBeGreaterThan(0);
		expect(kit?.equipment?.length).toBeGreaterThan(0);
		expect(kit?.safetyElements?.length).toBeGreaterThan(0);
		expect(kit?.workerCount?.length).toBeGreaterThan(0);
	});

	it("includes dielectric gloves in safety elements", () => {
		const names = kit?.safetyElements?.map((s) => s.name.toLowerCase()) ?? [];
		const hasGloves = names.some((n) => n.includes("guante") && n.includes("dieléctric"));
		expect(hasGloves).toBe(true);
	});

	it("includes calibrated equipment (telurómetro)", () => {
		const names = kit?.equipment?.map((e) => e.name.toLowerCase()) ?? [];
		const hasTelurometer = names.some(
			(n) => n.includes("telurómetro") || n.includes("telurometro"),
		);
		expect(hasTelurometer).toBe(true);
		const telurometro = kit?.equipment?.find((e) => e.name.toLowerCase().includes("telur"));
		expect(telurometro?.calibrationRequired).toBe(true);
	});
});

describe("applyKitTemplateToPlanningPacketData", () => {
	it("normalizes electrical kit into planning packet resource format", () => {
		const kit = KIT_REGISTRY["kit-electrical-001"];
		const result = applyKitTemplateToPlanningPacketData(kit);

		expect(result.tools.length).toBeGreaterThan(0);
		expect(result.equipment.length).toBeGreaterThan(0);
		expect(result.materials.length).toBeGreaterThan(0);
		expect(result.safetyElements.length).toBeGreaterThan(0);
		expect(result.workerRequirements.electricistas).toBeGreaterThan(0);
		expect(result.workerRequirements.obreros).toBeGreaterThan(0);
	});

	it("sets available=true on all normalized tools and equipment", () => {
		const kit = KIT_REGISTRY["kit-electrical-001"];
		const result = applyKitTemplateToPlanningPacketData(kit);

		expect(result.tools.every((t) => t.available)).toBe(true);
		expect(result.equipment.every((e) => e.available)).toBe(true);
	});

	it("handles a kit without optional fields gracefully", () => {
		const kit = KIT_REGISTRY["kit-maintenance-001"];
		const result = applyKitTemplateToPlanningPacketData(kit);

		expect(result.tools).toEqual([]);
		expect(result.equipment).toEqual([]);
		expect(result.materials.length).toBeGreaterThan(0);
		expect(result.safetyElements).toEqual([]);
	});
});
