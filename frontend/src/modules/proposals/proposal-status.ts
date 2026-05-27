/**
 * Normalizes legacy Spanish status values to English ProposalStatus.
 * Returns the input unchanged if it is already English.
 */
export function normalizeProposalStatus(status: string): string {
	switch (status) {
		case "borrador":
			return "draft";
		case "enviada":
			return "sent";
		case "aprobada":
			return "approved";
		case "rechazada":
			return "rejected";
		case "expirada":
			return "expired";
		default:
			return status;
	}
}
