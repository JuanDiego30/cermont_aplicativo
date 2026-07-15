import { Invoice, Proposal } from "../../models";

export interface FinancialKpisResult {
	conversionRate: number | null;
	pipelineValue: number;
	averageDaysPerStep: number | null;
	operatingMargin: number | null;
	billedThisMonth: number;
}

export async function getFinancialKpis(): Promise<FinancialKpisResult> {
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const [totalProposals, approvedProposals, pipelineResult, billingResult] =
		await Promise.all([
			Proposal.countDocuments(),
			Proposal.countDocuments({ status: "approved" }),
			Proposal.aggregate([
				{ $match: { status: { $in: ["draft", "sent"] } } },
				{ $group: { _id: "total", total: { $sum: "$total" } } },
			]),
			Invoice.aggregate([
				{ $match: { createdAt: { $gte: startOfMonth } } },
				{ $group: { _id: "total", total: { $sum: "$total" } } },
			]),
		]);

	const conversionRate =
		totalProposals > 0
			? Math.round((approvedProposals / totalProposals) * 100)
			: null;
	const pipelineValue = pipelineResult[0]?.total ?? 0;
	const billedThisMonth = billingResult[0]?.total ?? 0;

	return {
		conversionRate,
		pipelineValue,
		averageDaysPerStep: null,
		operatingMargin: null,
		billedThisMonth,
	};
}
