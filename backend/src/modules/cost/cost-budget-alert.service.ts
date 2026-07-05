import { evaluateCostBudgetRisk, FINANCE_ACCESS_ROLES, type UserRole } from "@cermont/domain";
import { Types } from "mongoose";
import { Cost, Order, Proposal, User } from "../../models";
import { publishAutomationEventSafely } from "../automation/automation.service";
import { createNotification } from "../notifications/notification.service";

type FinanceRecipient = {
	_id: Types.ObjectId;
	role: UserRole;
};

export async function notifyCostBudgetThreshold(orderId: string, actorId: string): Promise<void> {
	if (!Types.ObjectId.isValid(orderId)) {
		return;
	}
	const orderObjectId = new Types.ObjectId(orderId);
	const order = await Order.findById(orderObjectId)
		.select("proposalId")
		.lean<{ _id: Types.ObjectId; proposalId?: Types.ObjectId }>();
	if (!order?.proposalId) {
		return;
	}

	const proposal = await Proposal.findOne({ _id: order.proposalId, status: "approved" })
		.select("total")
		.lean<{ total: number }>();
	if (!proposal || proposal.total <= 0) {
		return;
	}

	const totals = await Cost.aggregate<{ totalActual: number; totalTax: number }>([
		{ $match: { orderId: orderObjectId, status: { $ne: "voided" } } },
		{
			$group: {
				_id: null,
				totalActual: { $sum: "$actualAmount" },
				totalTax: { $sum: "$taxAmount" },
			},
		},
	]);
	const totalActual = Number(totals[0]?.totalActual ?? 0) + Number(totals[0]?.totalTax ?? 0);
	const assessment = evaluateCostBudgetRisk({
		actualAmount: totalActual,
		approvedBudget: { status: "present", value: proposal.total },
	});
	if (assessment.risk === "within_budget" || assessment.risk === "not_available") {
		return;
	}

	const recipients = await User.find({
		role: { $in: FINANCE_ACCESS_ROLES },
		isActive: true,
	})
		.select("_id role")
		.lean<FinanceRecipient[]>();
	const percentage =
		assessment.consumptionPercent.status === "present"
			? Math.round(assessment.consumptionPercent.value * 100)
			: 0;

	await Promise.all(
		recipients.map((recipient) =>
			createNotification({
				recipientUserId: recipient._id.toString(),
				recipientRole: recipient.role,
				type: "COST_THRESHOLD_REACHED",
				priority: assessment.risk === "over_budget" ? "critical" : "high",
				title:
					assessment.risk === "over_budget"
						? "Presupuesto aprobado excedido"
						: "Consumo preventivo de presupuesto",
				body: `La orden alcanzó ${percentage}% del presupuesto aprobado.`,
				relatedEntity: { entityType: "Order", entityId: orderId },
				channels: ["in_app"],
				dedupeKey: `${orderId}:cost-budget:${assessment.risk}`,
			}),
		),
	);
	await publishAutomationEventSafely({
		eventId: `${orderId}:cost-budget:${assessment.risk}`,
		eventType: "cost_threshold_exceeded",
		entityType: "Order",
		entityId: orderId,
		actorId,
	});
}
