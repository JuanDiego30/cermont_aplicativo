import type { ApiEnvelope, Proposal } from "@cermont/shared-types";
import { ObjectIdSchema } from "@cermont/shared-types";

type LegacyProposalIdentifier = { id: string };

export type ProposalCreateResponse =
	| Proposal
	| LegacyProposalIdentifier
	| ApiEnvelope<Proposal | LegacyProposalIdentifier>;

export type ProposalIdResolution =
	| { status: "found"; id: string }
	| { status: "invalid"; message: string };

export function resolveCreatedProposalId(response: ProposalCreateResponse): ProposalIdResolution {
	const proposal = "data" in response ? response.data : response;
	const candidate = "_id" in proposal ? proposal._id : proposal.id;
	const parsed = ObjectIdSchema.safeParse(candidate);

	if (!parsed.success) {
		return {
			status: "invalid",
			message: "La propuesta se creó, pero la respuesta no incluyó un identificador válido.",
		};
	}

	return { status: "found", id: parsed.data };
}
