import { Invoice } from "../../models";
import {
	DAY_MS,
	dateOccurrenceKey,
	findThreshold,
	formatAmount,
	formatDate,
	type ReminderCandidate,
	type ReminderCheck,
} from "./reminder.types";

const OPEN_INVOICE_STATUSES = [
	"issued",
	"sent",
	"submitted",
	"approved",
	"accepted",
	"partially_paid",
	"SENT",
	"APPROVED",
] as const;

export const checkInvoiceReminders: ReminderCheck = async (rule, now) => {
	const maximumDays = Math.max(...rule.thresholds);
	const limit = new Date(now.getTime() + maximumDays * DAY_MS);
	const invoices = await Invoice.find({
		dueDate: { $gte: now, $lte: limit },
		status: { $in: OPEN_INVOICE_STATUSES },
	})
		.select("_id code invoiceNumber totalAmount currency dueDate")
		.lean();
	const candidates: ReminderCandidate[] = [];

	for (const invoice of invoices) {
		if (!invoice.dueDate) {
			continue;
		}
		const threshold = findThreshold(
			Math.ceil((invoice.dueDate.getTime() - now.getTime()) / DAY_MS),
			rule.thresholds,
		);
		if (threshold === false) {
			continue;
		}
		candidates.push({
			type: rule.type,
			threshold,
			occurrenceKey: `${invoice._id.toString()}:${dateOccurrenceKey(invoice.dueDate)}`,
			templateName: "invoice_due_reminder",
			variables: {
				invoiceNumber: invoice.invoiceNumber ?? invoice.code,
				amount: formatAmount(invoice.totalAmount, invoice.currency),
				dueDate: formatDate(invoice.dueDate),
			},
			relatedEntity: {
				entityType: "Invoice",
				entityId: invoice._id.toString(),
			},
		});
	}

	return candidates;
};

export const checkPaymentOverdueReminders: ReminderCheck = async (rule, now) => {
	const maximumDays = Math.max(...rule.thresholds);
	const earliestDueDate = new Date(now.getTime() - maximumDays * DAY_MS);
	const invoices = await Invoice.find({
		dueDate: { $gte: earliestDueDate, $lt: now },
		status: { $in: OPEN_INVOICE_STATUSES },
	})
		.select("_id code totalAmount currency dueDate clientName")
		.lean();
	const candidates: ReminderCandidate[] = [];

	for (const invoice of invoices) {
		if (!invoice.dueDate) {
			continue;
		}
		const threshold = findThreshold(
			Math.floor((now.getTime() - invoice.dueDate.getTime()) / DAY_MS),
			rule.thresholds,
		);
		if (threshold === false) {
			continue;
		}
		candidates.push({
			type: rule.type,
			threshold,
			occurrenceKey: `${invoice._id.toString()}:${dateOccurrenceKey(invoice.dueDate)}`,
			templateName: "payment_overdue",
			variables: {
				invoiceCode: invoice.code,
				amount: formatAmount(invoice.totalAmount, invoice.currency),
				dueDate: formatDate(invoice.dueDate),
				clientName: invoice.clientName,
				overdueDays: String(threshold),
			},
			relatedEntity: {
				entityType: "Invoice",
				entityId: invoice._id.toString(),
			},
		});
	}

	return candidates;
};
