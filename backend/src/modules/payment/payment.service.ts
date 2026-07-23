import type {
	PaginationQuery,
	PaymentAgingEntry,
	PaymentDashboard,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { Invoice as InvoiceModel } from "../../models/Invoice";
import { Payment as PaymentModel } from "../../models/Payment";
import {
	assertInvoiceApproved,
	assertPaymentNotExceedsOutstanding,
} from "../../services/workflow-preconditions.service";

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
		throw new UnprocessableError(
			`No se puede transicionar pago de '${current}' a '${target}'`,
			"PAYMENT_INVALID_TRANSITION",
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string;
	workOrderId?: string;
	invoiceId?: string;
	clientId?: string;
}

interface PaymentAggregation {
	_id: Types.ObjectId;
	paidAmount: number;
	lastPaidAt?: Date;
}

interface InvoiceAgingDocument {
	_id: Types.ObjectId;
	code: string;
	clientName: string;
	invoiceNumber?: string;
	totalAmount: number;
	amount?: number;
	total?: number;
	issueDate?: Date;
	issuedAt?: Date;
	dueDate?: Date;
	paidAt?: Date;
	createdAt: Date;
}

const DAY_IN_MS = 86_400_000;

function getInvoiceTotal(invoice: InvoiceAgingDocument): number {
	return Math.max(invoice.totalAmount ?? invoice.total ?? invoice.amount ?? 0, 0);
}

function getAgingBucket(daysOverdue: number): string {
	if (daysOverdue <= 0) {
		return "current";
	}
	if (daysOverdue <= 30) {
		return "0-30";
	}
	if (daysOverdue <= 60) {
		return "31-60";
	}
	if (daysOverdue <= 90) {
		return "61-90";
	}
	return "90+";
}

async function getAgingEntries(): Promise<PaymentAgingEntry[]> {
	const invoices = await InvoiceModel.find({ status: { $nin: ["draft", "cancelled", "rejected"] } })
		.select("_id code clientName invoiceNumber totalAmount amount total issueDate issuedAt dueDate paidAt createdAt")
		.lean<InvoiceAgingDocument[]>();
	const paymentTotals = await PaymentModel.aggregate<PaymentAggregation>([
		{ $match: { status: { $nin: ["rejected", "cancelled"] } } },
		{
			$group: {
				_id: "$invoiceId",
				paidAmount: { $sum: "$amount" },
				lastPaidAt: { $max: "$paidAt" },
			},
		},
	]);
	const totalsByInvoice = new Map(
		paymentTotals.map((payment) => [String(payment._id), payment]),
	);
	const now = new Date();

	return invoices.flatMap((invoice) => {
		const totalAmount = getInvoiceTotal(invoice);
		const paidAmount = Math.min(totalsByInvoice.get(String(invoice._id))?.paidAmount ?? 0, totalAmount);
		const outstanding = Math.max(totalAmount - paidAmount, 0);
		if (outstanding === 0) {
			return [];
		}
		const issueDate = invoice.issueDate ?? invoice.issuedAt ?? invoice.createdAt;
		const dueDate = invoice.dueDate ?? issueDate;
		const daysOverdue = Math.max(Math.floor((now.getTime() - dueDate.getTime()) / DAY_IN_MS), 0);
		const bucket = getAgingBucket(daysOverdue);
		return [
			{
				invoiceId: String(invoice._id),
				clientName: invoice.clientName,
				...(invoice.invoiceNumber ? { invoiceNumber: invoice.invoiceNumber } : {}),
				totalAmount,
				paidAmount,
				outstanding,
				pendingAmount: outstanding,
				total: totalAmount,
				bucket,
				agingBucket: bucket,
				issueDate: issueDate.toISOString(),
				dueDate: dueDate.toISOString(),
				daysOverdue,
				invoiceCode: invoice.code,
			},
		];
	});
}

export async function getPaymentAging(): Promise<PaymentAgingEntry[]> {
	return getAgingEntries();
}

export async function getPaymentDashboard(): Promise<PaymentDashboard> {
	const invoices = await InvoiceModel.find({ status: { $nin: ["draft", "cancelled", "rejected"] } })
		.select("_id totalAmount amount total issueDate issuedAt createdAt paidAt")
		.lean<InvoiceAgingDocument[]>();
	const paymentTotals = await PaymentModel.aggregate<PaymentAggregation>([
		{ $match: { status: { $nin: ["rejected", "cancelled"] } } },
		{
			$group: {
				_id: "$invoiceId",
				paidAmount: { $sum: "$amount" },
				lastPaidAt: { $max: "$paidAt" },
			},
		},
	]);
	const totalsByInvoice = new Map(
		paymentTotals.map((payment) => [String(payment._id), payment]),
	);
	const totalInvoiced = invoices.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
	const totalCollected = invoices.reduce(
		(sum, invoice) => sum + Math.min(totalsByInvoice.get(String(invoice._id))?.paidAmount ?? 0, getInvoiceTotal(invoice)),
		0,
	);
	const aging = await getAgingEntries();
	const totalPending = aging.reduce((sum, entry) => sum + entry.outstanding, 0);
	const totalOverdue = aging
		.filter((entry) => entry.daysOverdue > 0)
		.reduce((sum, entry) => sum + entry.outstanding, 0);
	const paymentDays = invoices.flatMap((invoice) => {
		const total = getInvoiceTotal(invoice);
		const payment = totalsByInvoice.get(String(invoice._id));
		if (!payment || payment.paidAmount < total) {
			return [];
		}
		const issueDate = invoice.issueDate ?? invoice.issuedAt ?? invoice.createdAt;
		const paidAt = payment.lastPaidAt ?? invoice.paidAt ?? issueDate;
		return [Math.max(Math.floor((paidAt.getTime() - issueDate.getTime()) / DAY_IN_MS), 0)];
	});
	const bucketMap = new Map<string, PaymentAgingEntry>();
	for (const entry of aging) {
		const current = bucketMap.get(entry.agingBucket);
		if (current) {
			current.total += entry.outstanding;
			current.totalAmount += entry.totalAmount;
			current.outstanding += entry.outstanding;
			current.pendingAmount += entry.pendingAmount;
			current.count = (current.count ?? 0) + 1;
			continue;
		}
		bucketMap.set(entry.agingBucket, {
			...entry,
			invoiceId: `bucket-${entry.agingBucket}`,
			clientName: "Todas las facturas",
			paidAmount: 0,
			total: entry.outstanding,
			totalAmount: entry.outstanding,
			outstanding: entry.outstanding,
			pendingAmount: entry.outstanding,
			count: 1,
		});
	}

	return {
		totalInvoiced,
		totalCollected,
		totalPending,
		totalOverdue,
		collectionRate: totalInvoiced > 0 ? Math.min((totalCollected / totalInvoiced) * 100, 100) : 0,
		averagePaymentDays:
			paymentDays.length > 0
				? Math.round(paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length)
				: 0,
		agingBuckets: Array.from(bucketMap.values()),
	};
}

export async function listPayments(
	query: ListQuery,
): Promise<{ data: PayDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.workOrderId) {
		filter.workOrderId = new Types.ObjectId(query.workOrderId);
	}
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}
	if (query.invoiceId) {
		filter.invoiceId = new Types.ObjectId(query.invoiceId);
	}
	if (query.clientId) {
		filter.clientId = new Types.ObjectId(query.clientId);
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
		amount?: number;
		amountCOP?: number;
		paymentMethod?: string;
		paymentReference?: string;
		referenceNumber?: string;
		paidAt: string;
		currency?: string;
		bankReference?: string;
		supportingDocument?: string;
		supportingDocumentUrl?: string;
		clientMutationId?: string;
	},
	actor: string,
	options?: { bypassPreconditions?: boolean },
): Promise<PayDoc> {
	const invoice = await InvoiceModel.findById(input.invoiceId);
	if (!invoice) {
		throw new NotFoundError("Invoice", input.invoiceId);
	}

	if (!options?.bypassPreconditions) {
		await assertInvoiceApproved(input.invoiceId);
	}

	const paymentRef = input.paymentReference || input.referenceNumber || "";
	const existing = await PaymentModel.findOne({
		invoiceId: invoice._id,
		paymentReference: paymentRef,
	});
	if (existing) {
		return JSON.parse(JSON.stringify(existing)) as unknown as PayDoc;
	}

	const amount = input.amount ?? input.amountCOP ?? invoice.totalAmount;
	const { paidBefore } = await assertPaymentNotExceedsOutstanding(input.invoiceId, amount);

	const doc = await PaymentModel.create({
		invoiceId: invoice._id,
		workOrderId: invoice.workOrderId,
		serviceEntrySheetId:
			invoice.serviceEntrySheetId || new Types.ObjectId("000000000000000000000000"),
		clientId: invoice.clientId,
		paymentReference: paymentRef,
		paidAt: new Date(input.paidAt),
		amount,
		currency: input.currency ?? invoice.currency,
		paymentMethod: input.paymentMethod ?? "bank_transfer",
		bankReference: input.bankReference,
		supportingDocument: input.supportingDocument,
		supportingDocumentUrl: input.supportingDocumentUrl,
		status: "recorded",
		recordedBy: new Types.ObjectId(actor),
		recordedAt: new Date(),
	});

	const paidTotal = paidBefore + amount;
	invoice.status = paidTotal >= invoice.totalAmount ? "paid" : "partially_paid";
	invoice.paidAt = new Date(input.paidAt);
	invoice.paymentReference = paymentRef;
	await invoice.save();

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

	await InvoiceModel.findByIdAndUpdate(doc.invoiceId, {
		status: "paid",
		commandHistory: [
			{ clientMutationId: "payment-complete", command: "paid", recordedAt: new Date() },
		],
	});

	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function reconcilePayment(
	id: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "reconciled");
	doc.status = "reconciled";
	doc.reconciledBy = new Types.ObjectId(actor);
	doc.reconciledAt = new Date();
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "reconcile_payment",
			recordedAt: new Date(),
		});
	}
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as PayDoc;
}

export async function rejectPayment(
	id: string,
	reason: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<PayDoc> {
	const doc = await PaymentModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Payment", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	doc.rejectedBy = new Types.ObjectId(actor);
	doc.rejectedAt = new Date();
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "reject_payment",
			recordedAt: new Date(),
		});
	}
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

export async function getRecordedPaymentTotal(invoiceId: string): Promise<number> {
	const [summary] = await PaymentModel.aggregate<{ paidTotal: number }>([
		{ $match: { invoiceId: new Types.ObjectId(invoiceId), status: { $ne: "rejected" } } },
		{ $group: { _id: "$invoiceId", paidTotal: { $sum: "$amount" } } },
	]);
	return summary?.paidTotal ?? 0;
}
