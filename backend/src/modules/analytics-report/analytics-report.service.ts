/**
 * AnalyticsReportService — cross‑cutting business report generator
 *
 * Aggregates data from all 14 operational steps to produce:
 * - Operational efficiency KPIs
 * - Financial performance summaries
 * - Custom ad‑hoc queries with CSV export
 */

import type {
	AnalyticsReportDomain,
	AnalyticsReportFilter,
	AnalyticsReportResult,
} from "@cermont/shared-types";
import { Invoice, Order, Payment, ServiceEntrySheet } from "../../models";
import { DeliveryRecord } from "../../models/DeliveryRecord";
import { Evidence } from "../../models/Evidence";
import { ExecutionSession } from "../../models/ExecutionSession";
import { Proposal } from "../../models/Proposal";
import { ServiceCase } from "../../models/ServiceCase";
import { WorkRequest } from "../../models/WorkRequest";

function datePredicate(filters: AnalyticsReportFilter): Record<string, Date> | undefined {
	if (!filters.dateFrom && !filters.dateTo) {
		return undefined;
	}
	const p: Record<string, Date> = {};
	if (filters.dateFrom) {
		p.$gte = new Date(filters.dateFrom);
	}
	if (filters.dateTo) {
		p.$lte = new Date(filters.dateTo);
	}
	return p;
}

interface GenericDoc {
	_id: { toString(): string };
	code?: string;
	clientName?: string;
	status?: string;
	createdAt?: Date;
	assetName?: string;
	serviceType?: string;
	type?: string;
	priority?: string;
	invoiceNumber?: string;
	amount?: number;
}

async function countAll(filters: AnalyticsReportFilter) {
	const createdAt = datePredicate(filters);
	const base: Record<string, unknown> = createdAt ? { createdAt } : {};

	const [wr, sc, pr, or, ex, ev, dr] = await Promise.all([
		WorkRequest.countDocuments(base),
		ServiceCase.countDocuments(base),
		Proposal.countDocuments(base),
		Order.countDocuments(base),
		ExecutionSession.countDocuments(base),
		Evidence.countDocuments(base),
		DeliveryRecord.countDocuments(base),
	]);

	return {
		workRequests: wr,
		serviceCases: sc,
		proposals: pr,
		orders: or,
		executions: ex,
		evidences: ev,
		deliveries: dr,
	};
}

function safeDate(d: Date | string | undefined): string {
	if (!d) {
		return "-";
	}
	const dt = typeof d === "string" ? new Date(d) : d;
	return Number.isNaN(dt.getTime()) ? "-" : dt.toISOString();
}

function readField(d: GenericDoc, fieldName: keyof GenericDoc): string | number {
	const value = d[fieldName];
	if (typeof value === "number") {
		return value;
	}
	if (typeof value === "string") {
		return value;
	}
	return "-";
}

function mapRow(
	d: GenericDoc,
	fields: Record<string, keyof GenericDoc>,
): Record<string, string | number> {
	const row: Record<string, string | number> = {
		ID: d._id.toString(),
		Estado: d.status ?? "-",
		Fecha: safeDate(d.createdAt),
	};
	for (const [key, fieldName] of Object.entries(fields)) {
		row[key] = readField(d, fieldName);
	}
	return row;
}

function escapeCsvCell(value: string | number): string {
	const text = String(value);
	if (!/[",\r\n]/.test(text)) {
		return text;
	}
	return `"${text.replaceAll('"', '""')}"`;
}

export const AnalyticsReportService = {
	async getOperationalKPI(filters: AnalyticsReportFilter) {
		const counts = await countAll(filters);
		return {
			period: {
				from: filters.dateFrom ?? "inicio",
				to: filters.dateTo ?? "hoy",
			},
			steps: counts,
		};
	},

	async generateCustomReport(
		domain: AnalyticsReportDomain,
		filters: AnalyticsReportFilter,
		format: "json" | "csv" = "json",
	): Promise<AnalyticsReportResult> {
		const base: Record<string, string | Record<string, Date>> = {};
		if (filters.status) {
			base.status = filters.status;
		}
		if (filters.clientId) {
			base.clientId = filters.clientId;
		}
		const createdAt = datePredicate(filters);
		if (createdAt) {
			base.createdAt = createdAt;
		}

		let docs: GenericDoc[] = [];
		let fieldMap: Record<string, keyof GenericDoc> = {};

		switch (domain) {
			case "work-requests":
				docs = (await WorkRequest.find(base)
					.sort({ createdAt: -1 })
					.limit(500)
					.lean()) as GenericDoc[];
				fieldMap = { Código: "code", Cliente: "clientName", Servicio: "serviceType" };
				break;
			case "orders":
				docs = (await Order.find(base).sort({ createdAt: -1 }).limit(500).lean()) as GenericDoc[];
				fieldMap = { Código: "code", Activo: "assetName", Tipo: "type", Prioridad: "priority" };
				break;
			case "invoices":
				docs = (await Invoice.find(base).sort({ createdAt: -1 }).limit(500).lean()) as GenericDoc[];
				fieldMap = { Factura: "invoiceNumber", Cliente: "clientName" };
				break;
			case "payments":
				docs = (await Payment.find(base).sort({ createdAt: -1 }).limit(500).lean()) as GenericDoc[];
				fieldMap = { Monto: "amount" };
				break;
			case "ses":
				docs = (await ServiceEntrySheet.find(base)
					.sort({ createdAt: -1 })
					.limit(500)
					.lean()) as GenericDoc[];
				fieldMap = { Código: "code", Cliente: "clientName" };
				break;
		}

		const data = docs.map((d) => mapRow(d, fieldMap));
		const headers = data.length > 0 ? Object.keys(data[0]) : ["ID"];

		if (format === "csv") {
			const lines = data.map((r) =>
				headers.map((header) => escapeCsvCell(r[header] ?? "")).join(","),
			);
			return {
				headers,
				rows: [{ csv: [headers.map(escapeCsvCell).join(","), ...lines].join("\n") }],
				total: data.length,
			};
		}

		return { headers, rows: data, total: data.length };
	},

	async exportToCSV(
		domain: AnalyticsReportDomain,
		filters: AnalyticsReportFilter,
	): Promise<string> {
		const r = await this.generateCustomReport(domain, filters, "csv");
		const csv = r.rows[0]?.csv;
		return typeof csv === "string" ? csv : "No hay datos";
	},
};
