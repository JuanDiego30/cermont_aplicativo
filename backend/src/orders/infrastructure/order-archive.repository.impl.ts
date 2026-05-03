import type { IOrderArchiveRepository } from "../domain/order-archive.repository";
import { Order } from "./model";
import { OrderArchive } from "./order-archive.model";

const MONTH_PERIOD_LENGTH = 7;

function toPeriod(date: Date): string {
	return date.toISOString().slice(0, MONTH_PERIOD_LENGTH);
}

export class OrderArchiveRepository implements IOrderArchiveRepository {
	async archivePaidClosedBefore(threshold: Date, limit: number): Promise<number> {
		const orders = await Order.find({
			status: "closed",
			"billing.invoiceStatus": "paid",
			updatedAt: { $lt: threshold },
			archived: { $ne: true },
		}).limit(limit);

		for (const order of orders) {
			const snapshot = order.toObject() as unknown as Record<string, unknown>;
			await OrderArchive.create({
				orderId: order._id,
				orderCode: order.code,
				period: toPeriod(order.updatedAt),
				snapshot,
				archivedAt: new Date(),
			});
			order.archived = true;
			await order.save();
		}

		return orders.length;
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort: Record<string, 1 | -1>;
		},
	) {
		const [rows, total] = await Promise.all([
			OrderArchive.find(filter).sort(options.sort).skip(options.skip).limit(options.limit).lean(),
			OrderArchive.countDocuments(filter),
		]);

		return { rows, total };
	}
}
