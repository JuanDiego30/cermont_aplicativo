import { describe, expect, it } from "vitest";
import { UnprocessableError } from "../../src/common/errors/AppError";
import { validateAdministrativeClosureReport } from "../../src/modules/order/order-closure.service";

describe("validateAdministrativeClosureReport", () => {
	it("no lanza cuando canCloseAdministratively es true", () => {
		expect(() =>
			validateAdministrativeClosureReport({
				canCloseAdministratively: true,
				missingClosureKinds: [],
			}),
		).not.toThrow();
	});

	it("bloquea cierre cuando faltan SES o pago", () => {
		expect(() =>
			validateAdministrativeClosureReport({
				canCloseAdministratively: false,
				missingClosureKinds: ["ses_filing", "payment_support"],
			}),
		).toThrow(UnprocessableError);
	});
});
