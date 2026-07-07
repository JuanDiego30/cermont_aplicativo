import { describe, expect, it } from "vitest";
import { ServiceCase } from "../../src/models/ServiceCase";

describe("ServiceCase operational step persistence", () => {
	it.each([
		["step_08_delivery_record", "step_09_delivery_record"],
		["step_10_ses", "step_11_ses"],
		["STEP_14_CLOSURE", "step_14_payment"],
	])("normalizes legacy code %s on hydration/write", (legacyCode, canonicalCode) => {
		const serviceCase = new ServiceCase({
			code: `SC-${legacyCode}`,
			clientName: "Cliente de prueba",
			currentStepCode: legacyCode,
		});

		expect(serviceCase.currentStepCode).toBe(canonicalCode);
		expect(serviceCase.operationalStepSchemaVersion).toBe(2);
	});
});
