import { describe, expect, it } from "vitest";
import {
	CreateAutomationRuleSchema,
	ListAutomationOperationalActionsQuerySchema,
	ResolveAutomationOperationalActionParamsSchema,
	UpdateAutomationRuleSchema,
} from "../../src/schemas/automation.schema";

describe("automation rule contracts", () => {
	it("accepts a typed notification rule", () => {
		const rule = CreateAutomationRuleSchema.parse({
			name: "Avisar rechazo HSE",
			description: "Escala el rechazo de una evidencia de seguridad.",
			eventType: "evidence_rejected",
			enabled: true,
			actions: [
				{
					type: "notify",
					recipientRoles: ["hes"],
					priority: "high",
					title: "Evidencia rechazada",
					body: "Revise la evidencia y solicite un reemplazo.",
				},
			],
		});

		expect(rule.actions[0]?.type).toBe("notify");
	});

	it("rejects empty updates and untyped action settings", () => {
		expect(UpdateAutomationRuleSchema.safeParse({}).success).toBe(false);
		expect(
			CreateAutomationRuleSchema.safeParse({
				name: "Regla inválida",
				description: "No tiene configuración válida.",
				eventType: "critical_checklist_failed",
				enabled: true,
				actions: [{ type: "notify", recipientRoles: [] }],
			}).success,
		).toBe(false);
	});

	it("validates operational-action filters and resolve identifiers", () => {
		expect(
			ListAutomationOperationalActionsQuerySchema.parse({
				status: "open",
				assignedRole: "administrativo",
				entityType: "Invoice",
				entityId: "507f1f77bcf86cd799439011",
			}),
		).toEqual({
			status: "open",
			assignedRole: "administrativo",
			entityType: "Invoice",
			entityId: "507f1f77bcf86cd799439011",
			limit: 50,
		});
		expect(
			ResolveAutomationOperationalActionParamsSchema.safeParse({
				id: "not-an-object-id",
			}).success,
		).toBe(false);
	});
});
