import type { ApiEnvelope, Proposal } from "@cermont/shared-types";
import { describe, expect, test } from "vitest";
import { resolveCreatedProposalId } from "@/modules/proposals/api/proposals.service";

describe("resolveCreatedProposalId", () => {
	test("accepts direct and stale enveloped proposal responses", () => {
		const direct = { _id: "507f1f77bcf86cd799439011" } as Proposal;
		const envelope: ApiEnvelope<Proposal> = { success: true, data: direct };

		expect(resolveCreatedProposalId(direct)).toEqual({
			status: "found",
			id: "507f1f77bcf86cd799439011",
		});
		expect(resolveCreatedProposalId(envelope)).toEqual({
			status: "found",
			id: "507f1f77bcf86cd799439011",
		});
	});

	test("rejects a malformed identifier without constructing an undefined route", () => {
		expect(resolveCreatedProposalId({ id: "malformed" })).toEqual({
			status: "invalid",
			message: "La propuesta se creó, pero la respuesta no incluyó un identificador válido.",
		});
	});
});
