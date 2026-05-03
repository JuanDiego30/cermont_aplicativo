/**
 * Proposal Domain Rules
 *
 * Status machine, conversion validation, tax rate, and code generation pattern.
 * Framework-agnostic — no Express or Mongoose imports.
 */

export const PROPOSAL_STATUSES = ["draft", "sent", "approved", "rejected", "expired"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const VALID_STATUS_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
	draft: ["sent"],
	sent: ["approved", "rejected", "expired"],
	approved: [],
	rejected: ["draft"],
	expired: [],
};

export function isValidStatusTransition(current: ProposalStatus, next: ProposalStatus): boolean {
	return VALID_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export const TAX_RATE = 0.19; // 19% Colombian IVA
export const PROPOSAL_CODE_PATTERN = /^PROP-\d{4}-\d{4}$/;
export const PROPOSAL_CODE_PREFIX = "PROP";

export function generateProposalCode(year: number, sequence: number): string {
	const yearPart = String(year);
	const seqPart = String(sequence).padStart(4, "0");
	return `${PROPOSAL_CODE_PREFIX}-${yearPart}-${seqPart}`;
}

export function isValidProposalCode(code: string): boolean {
	return PROPOSAL_CODE_PATTERN.test(code);
}

export function canConvertToOrder(
	status: ProposalStatus,
	hasItems: boolean,
	hasPoNumber: boolean,
): { canConvert: boolean; reason?: string } {
	if (status !== "approved") {
		return { canConvert: false, reason: "Only approved proposals can be converted to orders" };
	}
	if (!hasPoNumber) {
		return { canConvert: false, reason: "Proposal must have a PO Number before conversion" };
	}
	if (!hasItems) {
		return { canConvert: false, reason: "Proposal must have at least one item" };
	}
	return { canConvert: true };
}
