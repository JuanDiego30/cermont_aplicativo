import type { DashboardAgingBucket, DashboardFinancialAging } from "@cermont/shared-types";
import { Invoice } from "../../models/Invoice";

type AgingBucketDefinition =
	| { status: "bounded"; minDays: number; maxDays: number; label: string }
	| { status: "open"; minDays: number; label: string };

const DAY_MS = 24 * 60 * 60 * 1000;

export function buildFinancialAgingSummary(
	buckets: DashboardAgingBucket[],
): DashboardFinancialAging {
	const overdueBuckets = buckets.filter((bucket) => (bucket.minDays ?? 0) >= 31);
	return {
		buckets,
		totalOutstandingAmount: buckets.reduce((total, bucket) => total + bucket.amount, 0),
		totalOverdueAmount: overdueBuckets.reduce((total, bucket) => total + bucket.amount, 0),
		overdueInvoiceCount: overdueBuckets.reduce((total, bucket) => total + bucket.count, 0),
	};
}

export async function buildFinancialAging(): Promise<DashboardFinancialAging> {
	const now = new Date();
	const definitions: AgingBucketDefinition[] = [
		{ status: "bounded", minDays: 0, maxDays: 30, label: "0-30 días" },
		{ status: "bounded", minDays: 31, maxDays: 60, label: "31-60 días" },
		{ status: "bounded", minDays: 61, maxDays: 90, label: "61-90 días" },
		{ status: "open", minDays: 91, label: "90+ días" },
	];

	const buckets = await Promise.all(
		definitions.map(async (definition): Promise<DashboardAgingBucket> => {
			const dateFilter =
				definition.status === "bounded"
					? {
							$lte: new Date(now.getTime() - definition.minDays * DAY_MS),
							$gte: new Date(now.getTime() - definition.maxDays * DAY_MS),
						}
					: { $lt: new Date(now.getTime() - definition.minDays * DAY_MS) };

			const [aged] = await Invoice.aggregate<{ count: number; amount: number }>([
				{
					$match: {
						status: { $nin: ["paid", "cancelled", "rejected"] },
						dueDate: dateFilter,
					},
				},
				{
					$group: {
						_id: "outstanding",
						count: { $sum: 1 },
						amount: { $sum: "$totalAmount" },
					},
				},
			]);

			const base = {
				bucket: definition.label,
				count: aged?.count ?? 0,
				amount: aged?.amount ?? 0,
				currency: "COP",
				minDays: definition.minDays,
			};
			return definition.status === "bounded" ? { ...base, maxDays: definition.maxDays } : base;
		}),
	);

	return buildFinancialAgingSummary(buckets);
}
