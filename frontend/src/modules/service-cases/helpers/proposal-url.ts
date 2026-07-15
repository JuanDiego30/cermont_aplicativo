export function getProposalActionUrl(
	proposal: { id?: string; status?: string } | undefined,
	serviceCaseId: string,
): string {
	if (proposal?.id) {
		return `/proposals/${proposal.id}`;
	}
	return `/proposals/new?serviceCaseId=${serviceCaseId}`;
}
