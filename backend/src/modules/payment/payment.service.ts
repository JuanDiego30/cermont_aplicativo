import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { Invoice as InvoiceModel } from "../../models/Invoice";
import { Payment as PaymentModel } from "../../models/Payment";

type PayDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	recorded: ["completed", "rejected", "cancelled"],
	pending: ["completed", "rejected", "cancelled"],
	completed: ["reconciled", "cancelled"],
	reconciled: [],
	rejected: [],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(`Cannot transition Payment from '${current}' to '${target}'`);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string;
}

export async function listPayments(
	query: ListQuery,
): Promise<{ data: PayDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}
	if (query.status) {
		filter.status = query.status;
	}

	const page = query.page || 1;
	const limit = query.limit || 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		PaymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		PaymentModel.countDocuments(filter),
	]);

	return { data: data as unknown as PayDoc[], total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getPaymentById(id: string): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	return doc as unknown as PayDoc;
}

export async function registerPaymentForInvoice(
	input: {
		invoiceId: string;
		amountCOP: number;
		paymentMethod: string;
		referenceNumber?: string;
		paidAt: string;
	},
	actor: string,
): Promise<PayDoc> {
	const invoice = await InvoiceModel.findById(input.invoiceId);
	if (!invoice) {
		throw new NotFoundError("Invoice", input.invoiceId);
	}

	const doc = await PaymentModel.create({
		invoiceId: new Types.ObjectId(input.invoiceId),
		workOrderId: invoice.workOrderId,
		serviceEntrySheetId:
			invoice.serviceEntrySheetId || new Types.ObjectId("000000000000000000000000"),
		clientId: invoice.clientId,
		paymentReference: input.referenceNumber || "",
		paidAt: new Date(input.paidAt),
		amount: input.amountCOP,
		paymentMethod: input.paymentMethod,
		status: "recorded",
		recordedBy: new Types.ObjectId(actor),
		recordedAt: new Date(),
	});
	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function completePayment(id: string): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "completed");
	doc.status = "completed";
	await doc.save();

	// Mark invoice as paid
	await InvoiceModel.findByIdAndUpdate(doc.invoiceId, {
		status: "paid",
		commandHistory: [
			{ clientMutationId: "payment-complete", command: "paid", recordedAt: new Date() },
		],
	});

	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function reconcilePayment(id: string, _actor: string): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "reconciled");
	doc.status = "reconciled";
	doc.reconciledBy = new Types.ObjectId(_actor);
	doc.reconciledAt = new Date();
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function rejectPayment(id: string, reason: string): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function cancelPayment(id: string): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "cancelled");
	doc.status = "cancelled";
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}
