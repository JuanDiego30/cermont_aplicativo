import { describe, expect, it } from "vitest";
import { evaluateChecklistReadiness } from "../checklist.rules";

describe("evaluateChecklistReadiness", () => {
	it("bloquea un item critico que sigue pendiente", () => {
		const result = evaluateChecklistReadiness([
			{
				id: "ats",
				label: "ATS aprobado antes de iniciar",
				required: true,
				isBlocking: true,
				result: "pending",
				requiresPhoto: false,
				photoCount: 0,
				requiresSignature: false,
				hasSignature: false,
			},
		]);

		expect(result.status).toBe("blocked");
		expect(result.blockers).toEqual([
			expect.objectContaining({ code: "CHECKLIST_ITEM_PENDING", itemId: "ats" }),
		]);
	});

	it("bloquea un item critico fallido aunque tenga comentario", () => {
		const result = evaluateChecklistReadiness([
			{
				id: "epp",
				label: "EPP completo y verificado",
				required: true,
				isBlocking: true,
				result: "failed",
				requiresPhoto: false,
				photoCount: 0,
				requiresSignature: false,
				hasSignature: false,
			},
		]);

		expect(result.status).toBe("blocked");
		expect(result.blockers[0]?.code).toBe("CHECKLIST_CRITICAL_ITEM_FAILED");
	});

	it("exige foto y firma solo a los items que las declaran", () => {
		const result = evaluateChecklistReadiness([
			{
				id: "permiso-alturas",
				label: "Permiso de trabajo en alturas",
				required: true,
				isBlocking: true,
				result: "passed",
				requiresPhoto: true,
				photoCount: 0,
				requiresSignature: true,
				hasSignature: false,
			},
		]);

		expect(result.blockers.map((blocker) => blocker.code)).toEqual([
			"CHECKLIST_PHOTO_REQUIRED",
			"CHECKLIST_SIGNATURE_REQUIRED",
		]);
	});

	it("queda listo cuando todos los controles bloqueantes tienen soporte", () => {
		const result = evaluateChecklistReadiness([
			{
				id: "permiso-alturas",
				label: "Permiso de trabajo en alturas",
				required: true,
				isBlocking: true,
				result: "passed",
				requiresPhoto: true,
				photoCount: 1,
				requiresSignature: true,
				hasSignature: true,
			},
		]);

		expect(result).toEqual({ status: "ready", blockers: [] });
	});
});
