/**
 * Notifications module types.
 *
 * Local view model for notifications consumed by the UI layer. Aligned with the
 * backend `Notification` document shape (see `backend/src/models/Notification.ts`).
 */

export type NotificationType =
	| "evidence_rejected"
	| "evidence_approved"
	| "ses_approved"
	| "ses_rejected"
	| "payment_received"
	| "report_generated"
	| "overdue"
	| "kit_reminder"
	| "invoice_pending"
	| "general";

export interface Notification {
	_id: string;
	type: NotificationType;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	deepLink?: string;
	userId?: string;
}
