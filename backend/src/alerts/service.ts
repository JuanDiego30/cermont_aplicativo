import type { DashboardAlert, OrderDocument, User } from "@cermont/shared-types";
import type { Types } from "mongoose";
import { container } from "../_shared/config/container";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const THRESHOLDS = {
	reportPendingDays: 3,
	sesPendingDays: 7,
	certificationExpiryDays: 30,
};

interface AlertCandidate extends Omit<DashboardAlert, "_id" | "updatedAt"> {}

/**
 * Generate actionable alerts for the dashboard.
 * Evaluates all orders and technicians to find issues requiring attention.
 */
export async function generateAlerts(_userId?: string): Promise<DashboardAlert[]> {
	const activeOrders = await container.orderRepository.find({
		status: { $nin: ["closed", "cancelled"] },
	});

	const candidates: AlertCandidate[] = [];

	for (const order of activeOrders) {
		const orderAlerts = await getOrderAlerts(order as unknown as OrderDocument<Types.ObjectId>);
		candidates.push(...orderAlerts);
	}

	// Persist or just return
	const referenceDate = new Date().toISOString();
	return candidates.map((c, i) => ({
		...c,
		_id: `alert-${i}`,
		updatedAt: referenceDate,
	})) as DashboardAlert[];
}

function createAlert(data: AlertCandidate): AlertCandidate {
	return data;
}

async function getOrderAlerts(
	order: OrderDocument<Types.ObjectId>,
): Promise<AlertCandidate[]> {
	const alerts: AlertCandidate[] = [];
	const orderId = order._id.toString();
	const now = new Date();
	const referenceDate = now.toISOString();

	const completedAt = order.completedAt ? new Date(order.completedAt) : null;
	const completedDays = completedAt
		? Math.floor((now.getTime() - completedAt.getTime()) / MS_PER_DAY)
		: 0;

	if (
		order.status === "completed" &&
		!order.reportGenerated &&
		completedDays > THRESHOLDS.reportPendingDays
	) {
		alerts.push(
			createAlert({
				id: `missing-report:${orderId}`,
				type: "missing_report",
				severity: completedDays > 7 ? "critical" : "warning",
				orderId,
				title: "Informe no elaborado",
				description: `La orden ${order.code} lleva ${completedDays} días completada sin informe.`,
				actionLabel: "Generar informe",
				actionUrl: `/orders/${orderId}?tab=informe`,
				createdAt: referenceDate,
				metadata: {
					code: order.code,
					daysPending: completedDays,
				},
			}),
		);
	}

	if (
		order.status === "completed" &&
		order.reportGenerated &&
		completedDays > THRESHOLDS.reportPendingDays
	) {
		alerts.push(
			createAlert({
				id: `unsigned-delivery-record:${orderId}`,
				type: "unsigned_delivery_record",
				severity: "warning",
				orderId,
				title: "Acta sin firmar",
				description: `La orden ${order.code} tiene el informe listo y el acta pendiente de firma.`,
				actionLabel: "Revisar acta",
				actionUrl: `/orders/${orderId}?tab=informe`,
				createdAt: referenceDate,
				metadata: {
					code: order.code,
				},
			}),
		);
	}

	if (
		(order.status === "completed" || order.status === "acta_signed") &&
		completedDays > THRESHOLDS.sesPendingDays
	) {
		alerts.push(
			createAlert({
				id: `pending-ses:${orderId}`,
				type: "pending_ses",
				severity: "critical",
				orderId,
				title: "SES pendiente de enviar",
				description: `La orden ${order.code} lleva ${completedDays} días sin SES registrada.`,
				actionLabel: "Registrar SES",
				actionUrl: `/orders/${orderId}?tab=facturacion`,
				createdAt: referenceDate,
				metadata: {
					code: order.code,
					daysPending: completedDays,
				},
			}),
		);
	}

	if (order.status === "ses_sent" || order.billing?.invoiceStatus === "sent") {
		alerts.push(
			createAlert({
				id: `pending-invoice-approval:${orderId}`,
				type: "pending_invoice_approval",
				severity: "warning",
				orderId,
				title: "Factura sin aprobación",
				description: `La factura de la orden ${order.code} está pendiente de aprobación.`,
				actionLabel: "Ver facturación",
				actionUrl: `/orders/${orderId}?tab=facturacion`,
				createdAt: referenceDate,
				metadata: {
					code: order.code,
				},
			}),
		);
	}

	const certAlerts = await getCertificationAlerts(order);
	alerts.push(...certAlerts);

	return alerts;
}

async function getCertificationAlerts(
	order: OrderDocument<Types.ObjectId>,
): Promise<AlertCandidate[]> {
	const orderId = order._id.toString();
	const now = new Date();
	const referenceDate = now.toISOString();
	const candidates: AlertCandidate[] = [];

	const techIds = order.resourceAssignment?.technicianIds || [];
	if (techIds.length === 0) {
		return [];
	}

	const technicians = await container.userRepository.find({
		_id: { $in: techIds },
	});

	for (const techDoc of technicians) {
		const tech = techDoc as unknown as User;
		const expiring = (tech.certifications || []).filter((cert) => {
			if (!cert.expiresAt || cert.status !== "active") {
				return false;
			}
			const expiryDate = new Date(cert.expiresAt);
			const diffDays = (expiryDate.getTime() - now.getTime()) / MS_PER_DAY;
			return diffDays >= 0 && diffDays <= THRESHOLDS.certificationExpiryDays;
		});

		for (const cert of expiring) {
			const techId = String(tech._id);
			candidates.push({
				id: `expiring-cert:${techId}:${cert.name}`,
				type: "expiring_certification",
				severity: "warning",
				orderId,
				userId: techId,
				title: "Certificación por vencer",
				description: `La certificación '${cert.name}' de ${tech.name} vence pronto.`,
				actionLabel: "Ver técnico",
				actionUrl: `/admin/users/${techId}`,
createdAt: referenceDate,
				metadata: {
					technicianName: tech.name,
					certName: cert.name,
					...(cert.expiresAt ? { expiryDate: cert.expiresAt } : {}),
				},
			});
		}
	}

	return candidates;
}

export async function getUserAlerts(userId: string): Promise<DashboardAlert[]> {
	const alerts = await generateAlerts();
	return alerts.filter((alert) => alert.userId === userId);
}

export async function getOrderAlertsById(orderId: string): Promise<DashboardAlert[]> {
	const alerts = await generateAlerts();
	return alerts.filter((alert) => alert.orderId === orderId);
}
