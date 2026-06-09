import { describe, expect, it } from "vitest";
import { getRolesToNotifyForStep } from "../notification.service";

describe("getRolesToNotifyForStep", () => {
	it("step_07_technical_report debe notificar a supervisor y admin (NO roles de evidencias)", () => {
		const roles = getRolesToNotifyForStep("step_07_technical_report");
		expect(roles).toContain("supervisor");
		expect(roles).toContain("gerente");
		// NO debe contener roles de ejecución/evidencias
		expect(roles).not.toContain("tecnico");
		expect(roles).not.toContain("operador");
		expect(roles).not.toContain("hes");
	});

	it("step_08_delivery_record debe notificar a tecnico y supervisor", () => {
		const roles = getRolesToNotifyForStep("step_08_delivery_record");
		expect(roles).toContain("tecnico");
		expect(roles).toContain("supervisor");
	});

	it("step_09_client_signature debe notificar a supervisor y admin", () => {
		const roles = getRolesToNotifyForStep("step_09_client_signature");
		expect(roles).toContain("supervisor");
		expect(roles).toContain("gerente");
	});

	it("step_10_ses_submission debe notificar solo a admin (NO roles de client_signature)", () => {
		const roles = getRolesToNotifyForStep("step_10_ses_submission");
		expect(roles).toEqual(["gerente"]);
		// NO debe contener roles de cliente/firma
		expect(roles).not.toContain("residente");
		expect(roles).not.toContain("cliente");
	});

	it("step_11_ses_approval debe notificar solo a admin", () => {
		const roles = getRolesToNotifyForStep("step_11_ses_approval");
		expect(roles).toEqual(["gerente"]);
	});

	it("step_01_work_request debe retornar default (gerente)", () => {
		const roles = getRolesToNotifyForStep("step_01_work_request");
		expect(roles).toEqual(["gerente"]);
	});
});
