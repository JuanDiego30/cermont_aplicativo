import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../common/errors/AppError";
import { DeliveryRecord } from "../models/DeliveryRecord";
import { Invoice } from "../models/Invoice";
import { Payment } from "../models/Payment";
import { ServiceEntrySheet } from "../models/ServiceEntrySheet";
import { assertAdministrativeClosureReady } from "../modules/order/order-closure.service";

function parseId(value: string, _label: string): Types.ObjectId {
	return new Types.ObjectId(value);
}

export async function assertDeliveryRecordSigned(deliveryRecordId: string): Promise<void> {
	const record = await DeliveryRecord.findById(parseId(deliveryRecordId, "deliveryRecordId"));
	if (!record) {
		throw new NotFoundError("DeliveryRecord", deliveryRecordId);
	}
	if (record.status !== "signed") {
		throw new UnprocessableError(
			"El acta de entrega debe estar firmada antes de crear la SES",
			"SES_DELIVERY_RECORD_NOT_SIGNED",
		);
	}
}

export async function assertSESApproved(serviceEntrySheetId: string): Promise<void> {
	const ses = await ServiceEntrySheet.findById(parseId(serviceEntrySheetId, "serviceEntrySheetId"));
	if (!ses) {
		throw new NotFoundError("ServiceEntrySheet", serviceEntrySheetId);
	}
	if (ses.status !== "approved") {
		throw new UnprocessableError(
			"La SES debe estar aprobada antes de crear la factura",
			"INVOICE_SES_NOT_APPROVED",
		);
	}
}

export async function assertInvoiceApproved(invoiceId: string): Promise<void> {
	const invoice = await Invoice.findById(parseId(invoiceId, "invoiceId"));
	if (!invoice) {
		throw new NotFoundError("Invoice", invoiceId);
	}
	const eligible = new Set(["approved", "accepted", "partially_paid"]);
	if (!eligible.has(invoice.status)) {
		throw new UnprocessableError(
			"La factura debe estar aprobada antes de registrar un pago",
			"PAYMENT_INVOICE_NOT_APPROVED",
		);
	}
}

export async function assertWorkflowChainComplete(orderId: string): Promise<void> {
	await assertAdministrativeClosureReady(orderId);
}

export async function assertPaymentNotExceedsOutstanding(
	invoiceId: string,
	amount: number,
): Promise<{ paidBefore: number; outstandingAmount: number }> {
	const invoice = await Invoice.findById(parseId(invoiceId, "invoiceId"));
	if (!invoice) {
		throw new NotFoundError("Invoice", invoiceId);
	}
	const [summary] = await Payment.aggregate<{ paidTotal: number }>([
		{ $match: { invoiceId: invoice._id, status: { $ne: "rejected" } } },
		{ $group: { _id: "$invoiceId", paidTotal: { $sum: "$amount" } } },
	]);
	const paidBefore = summary?.paidTotal ?? 0;
	const outstandingAmount = Math.max(invoice.totalAmount - paidBefore, 0);
	if (amount > outstandingAmount) {
		throw new UnprocessableError(
			`El monto del pago (${amount}) excede el saldo pendiente (${outstandingAmount})`,
			"PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING",
		);
	}
	return { paidBefore, outstandingAmount };
}

export async function assertSESSubmitted(serviceEntrySheetId: string): Promise<void> {
	const ses = await ServiceEntrySheet.findById(parseId(serviceEntrySheetId, "serviceEntrySheetId"));
	if (!ses) {
		throw new NotFoundError("ServiceEntrySheet", serviceEntrySheetId);
	}
	if (ses.status !== "submitted" && ses.status !== "approved") {
		throw new UnprocessableError(
			"La SES debe estar radicada antes de aprobarla",
			"SES_NOT_SUBMITTED",
		);
	}
}

export async function assertInvoiceIssued(invoiceId: string): Promise<void> {
	const invoice = await Invoice.findById(parseId(invoiceId, "invoiceId"));
	if (!invoice) {
		throw new NotFoundError("Invoice", invoiceId);
	}
	if (invoice.status !== "issued" && invoice.status !== "submitted") {
		throw new UnprocessableError(
			"La factura debe estar emitida antes de enviarla o aprobarla",
			"INVOICE_NOT_ISSUED",
		);
	}
}
