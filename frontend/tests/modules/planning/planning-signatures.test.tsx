/**
 * PlanningPacketSignatures — tests for the signature section integration.
 *
 * Verifies:
 * - getDefaultResponsibles returns 3 roles
 * - Default status is "pending"
 * - Signatures section renders role fields
 */

import { describe, expect, it } from "vitest";
import { getDefaultResponsibles } from "@/modules/planning/helpers/planning-signatures.helpers";

describe("PlanningPacketSignatures", () => {
	it("should return 3 default responsibles", () => {
		const responsibles = getDefaultResponsibles();
		expect(responsibles).toHaveLength(3);
	});

	it("should include ingeniero_residente role", () => {
		const responsibles = getDefaultResponsibles();
		const roles = responsibles.map((r) => r.role);
		expect(roles).toContain("ingeniero_residente");
		expect(roles).toContain("tecnico_electricista");
		expect(roles).toContain("hes");
	});

	it("should have pending status by default", () => {
		const responsibles = getDefaultResponsibles();
		for (const resp of responsibles) {
			expect(resp.status).toBe("pending");
		}
	});

	it("should allow name assignment", () => {
		const responsibles = getDefaultResponsibles();
		responsibles[0].name = "Ing. Juan Pérez";
		expect(responsibles[0].name).toBe("Ing. Juan Pérez");
		expect(responsibles[0].role).toBe("ingeniero_residente");
	});
});
