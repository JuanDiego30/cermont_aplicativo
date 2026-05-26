import { describe, expect, it } from "vitest";
import type { ClosureRequirement } from "../../src/schemas/closureReport.schema";
import {
	ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS,
	evaluateClosureReadiness,
} from "../../src/workflow/closure-readiness";

function requirement(
	kind: ClosureRequirement["kind"],
	status: ClosureRequirement["status"],
): ClosureRequirement {
	return {
		kind,
		stepCode: "step_08_delivery_record",
		label: kind,
		status,
	};
}

describe("evaluateClosureReadiness", () => {
	it("exige los siete requisitos administrativos del cierre", () => {
		expect(ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS).toHaveLength(7);
	});

	it("bloquea cierre cuando falta acta, SES, factura o pago", () => {
		const requirements: ClosureRequirement[] = [
			requirement("acta_delivery", "missing"),
			requirement("client_signature", "completed"),
			requirement("ses_filing", "completed"),
			requirement("ses_approval", "completed"),
			requirement("invoice_sent", "completed"),
			requirement("invoice_approval", "completed"),
			requirement("payment_support", "completed"),
		];

		const result = evaluateClosureReadiness(requirements);
		expect(result.canCloseAdministratively).toBe(false);
		expect(result.missingKinds).toContain("acta_delivery");
	});

	it("habilita cierre cuando todos los requisitos administrativos están completos", () => {
		const requirements = ADMINISTRATIVE_CLOSURE_REQUIREMENT_KINDS.map((kind) =>
			requirement(kind, "completed"),
		);

		const result = evaluateClosureReadiness(requirements);
		expect(result.canCloseAdministratively).toBe(true);
		expect(result.missingKinds).toHaveLength(0);
		expect(result.completionPercentage).toBe(100);
	});
});
