import { describe, expect, it } from "vitest";

import { BadRequestError, UnauthorizedError } from "../../src/common/errors/AppError";
import {
	getValidTransitions,
	isTerminalStatus,
	validateStateTransition,
} from "../../src/services/order/order-rules";

describe("order-rules transition and RBAC", () => {
	it("permite transición válida por rol autorizado", () => {
		expect(() => {
			validateStateTransition("assigned", "in_progress", "tecnico");
		}).not.toThrow();
	});

	it("rechaza transición inválida aunque el rol sea autorizado", () => {
		expect(() => {
			validateStateTransition("open", "completed", "gerente");
		}).toThrow(BadRequestError);
	});

	it("rechaza transición válida cuando el rol no tiene permiso", () => {
		expect(() => {
			validateStateTransition("open", "assigned", "tecnico");
		}).toThrow(UnauthorizedError);
	});

	it("normaliza estados legacy en validación de transición", () => {
		expect(() => {
			validateStateTransition("assigned", "in-progress" as never, "tecnico");
		}).not.toThrow();
	});

	it("normaliza estados legacy para consultar transiciones válidas", () => {
		const transitions = getValidTransitions("on-hold" as never);

		expect(transitions).toEqual(["in_progress", "cancelled"]);
	});

	it("identifica estados terminales correctamente", () => {
		expect(isTerminalStatus("closed")).toBe(true);
		expect(isTerminalStatus("cancelled")).toBe(true);
		expect(isTerminalStatus("completed")).toBe(false);
	});
});
