import { container } from "../../_shared/config/container";
import type { OrderArchiveRecord } from "../domain/order-archive.repository";

const MS_PER_DAY = 86_400_000;

export interface ArchivedOrderRow {
	_id: string;
	orderId: string;
	orderCode: string;
	period: string;
	archivedAt: string;
	snapshot: Record<string, unknown>;
}

function formatArchive(row: OrderArchiveRecord): ArchivedOrderRow {
	return {
		_id: row._id.toString(),
		orderId: row.orderId.toString(),
		orderCode: row.orderCode,
		period: row.period,
		archivedAt: row.archivedAt.toISOString(),
		snapshot: row.snapshot,
	};
}

export async function archiveOldOrders(): Promise<{ archivedCount: number }> {
	const threshold = new Date(Date.now() - 30 * MS_PER_DAY);
	const archivedCount = await container.orderArchiveRepository.archivePaidClosedBefore(
		threshold,
		500,
	);

	return { archivedCount };
}

export async function listArchivedOrders(filters: {
	search?: string;
	period?: string;
	page?: number;
	limit?: number;
}): Promise<{ data: ArchivedOrderRow[]; total: number; page: number; limit: number }> {
	const page = filters.page ?? 1;
	const limit = Math.min(filters.limit ?? 20, 100);
	const query: Record<string, unknown> = {};

	if (filters.period) {
		query.period = filters.period;
	}
	if (filters.search) {
		query.orderCode = {
			$regex: filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
			$options: "i",
		};
	}

	const { rows, total } = await container.orderArchiveRepository.findPaginated(query, {
		skip: (page - 1) * limit,
		limit,
		sort: { archivedAt: -1 },
	});

	return {
		data: rows.map(formatArchive),
		total,
		page,
		limit,
	};
}
