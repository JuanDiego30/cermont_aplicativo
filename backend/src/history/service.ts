import { PassThrough } from "node:stream";
import type {
	HistoryExportInput,
	HistoryOrderRow,
	HistoryOrdersQuery,
	HistoryStats,
	OrderDocument,
} from "@cermont/shared-types";
import archiver from "archiver";
import type { Types } from "mongoose";
import { container } from "../_shared/config/container";

const MS_PER_DAY = 86_400_000;

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toIso(value?: Date): string | null {
	return value ? value.toISOString() : null;
}

function buildHistoryFilter(
	filters: HistoryOrdersQuery | HistoryExportInput,
): Record<string, unknown> {
	const query: Record<string, unknown> = {
		archived: true,
	};
	const completedAt: Record<string, Date> = {};

	if (filters.dateFrom) {
		completedAt.$gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
	}
	if (filters.dateTo) {
		completedAt.$lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
	}
	if (Object.keys(completedAt).length > 0) {
		query.completedAt = completedAt;
	}
	if (filters.client) {
		query["commercial.clientName"] = { $regex: escapeRegex(filters.client), $options: "i" };
	}
	if (filters.type) {
		query.type = filters.type;
	}
	if (filters.technician) {
		query.assignedToName = { $regex: escapeRegex(filters.technician), $options: "i" };
	}

	return query;
}

function formatHistoryOrder(order: OrderDocument<Types.ObjectId>): HistoryOrderRow {
	return {
		_id: order._id.toString(),
		code: order.code,
		type: order.type,
		status: order.status,
		clientName: order.commercial?.clientName ?? null,
		assetName: order.assetName,
		location: order.location,
		technicianName: order.assignedToName ?? null,
		completedAt: toIso(order.completedAt),
		paidAt: toIso(order.billing.paidAt),
		archivedAt: toIso(order.updatedAt),
		totalCop: order.commercial?.nteAmount ?? order.costBaseline?.total ?? 0,
	};
}

function csvCell(value: unknown): string {
	const text = value === null || value === undefined ? "" : String(value);
	return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows: HistoryOrderRow[]): string {
	const headers = [
		"code",
		"type",
		"status",
		"client",
		"asset",
		"location",
		"technician",
		"completed_at",
		"paid_at",
		"archived_at",
		"total_cop",
	];
	const body = rows.map((row) =>
		[
			row.code,
			row.type,
			row.status,
			row.clientName,
			row.assetName,
			row.location,
			row.technicianName,
			row.completedAt,
			row.paidAt,
			row.archivedAt,
			row.totalCop,
		]
			.map(csvCell)
			.join(","),
	);

	return [headers.join(","), ...body].join("\n");
}

async function createZipBuffer(rows: HistoryOrderRow[]): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const archive = archiver("zip", { zlib: { level: 9 } });
		const stream = new PassThrough();
		const chunks: Buffer[] = [];

		stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", reject);
		archive.on("error", reject);
		archive.pipe(stream);

		archive.append(toCsv(rows), { name: "ordenes-historicas.csv" });
		for (const row of rows) {
			archive.append(JSON.stringify(row, null, 2), {
				name: `${row.code}/metadata.json`,
			});
		}
		archive.finalize().catch(reject);
	});
}

export async function listHistoryOrders(filters: HistoryOrdersQuery): Promise<{
	data: HistoryOrderRow[];
	total: number;
	page: number;
	limit: number;
}> {
	const page = filters.page ?? 1;
	const limit = filters.limit ?? 20;
	const query = buildHistoryFilter(filters);
	const [orders, total] = await Promise.all([
		container.orderRepository.findPaginated(query, {
			skip: (page - 1) * limit,
			limit,
			sort: { updatedAt: -1 },
		}),
		container.orderRepository.countDocuments(query),
	]);

	return {
		data: orders.map(formatHistoryOrder),
		total,
		page,
		limit,
	};
}

export async function getHistoryStats(ruleDays = 30): Promise<HistoryStats> {
	const rows = await container.orderRepository.aggregate<{
		_id: null;
		archivedOrders: number;
		paidArchivedOrders: number;
		totalArchivedCop: number;
	}>([
		{ $match: { archived: true } },
		{
			$group: {
				_id: null,
				archivedOrders: { $sum: 1 },
				paidArchivedOrders: {
					$sum: { $cond: [{ $eq: ["$billing.invoiceStatus", "paid"] }, 1, 0] },
				},
				totalArchivedCop: {
					$sum: { $ifNull: ["$commercial.nteAmount", { $ifNull: ["$costBaseline.total", 0] }] },
				},
			},
		},
	]);
	const row = rows[0];

	return {
		archivedOrders: row?.archivedOrders ?? 0,
		paidArchivedOrders: row?.paidArchivedOrders ?? 0,
		totalArchivedCop: row?.totalArchivedCop ?? 0,
		nextArchiveRuleDays: ruleDays,
	};
}

export async function archiveEligibleOrders(days: number): Promise<{ archivedCount: number }> {
	const threshold = new Date(Date.now() - days * MS_PER_DAY);
	const orders = await container.orderRepository.findPaginated(
		{
			status: "closed",
			archived: { $ne: true },
			"billing.invoiceStatus": "paid",
			updatedAt: { $lt: threshold },
		},
		{ skip: 0, limit: 500, sort: { updatedAt: 1 } },
	);

	for (const order of orders) {
		await container.orderRepository.updateOne({ _id: order._id }, { $set: { archived: true } });
	}

	return { archivedCount: orders.length };
}

export async function exportHistoryCsv(filters: HistoryExportInput): Promise<string> {
	const orders = await container.orderRepository.findPaginated(buildHistoryFilter(filters), {
		skip: 0,
		limit: 5000,
		sort: { completedAt: -1 },
	});
	return toCsv(orders.map(formatHistoryOrder));
}

export async function exportHistoryZip(filters: HistoryExportInput): Promise<Buffer> {
	const orders = await container.orderRepository.findPaginated(buildHistoryFilter(filters), {
		skip: 0,
		limit: 1000,
		sort: { completedAt: -1 },
	});
	return createZipBuffer(orders.map(formatHistoryOrder));
}

export async function exportHistoryFinancial(filters: HistoryExportInput): Promise<{
	totalOrders: number;
	totalCop: number;
	paidOrders: number;
}> {
	const orders = await container.orderRepository.findPaginated(buildHistoryFilter(filters), {
		skip: 0,
		limit: 5000,
		sort: { completedAt: -1 },
	});
	const rows = orders.map(formatHistoryOrder);

	return {
		totalOrders: rows.length,
		totalCop: rows.reduce((total, row) => total + row.totalCop, 0),
		paidOrders: orders.filter((order) => order.billing.invoiceStatus === "paid").length,
	};
}
