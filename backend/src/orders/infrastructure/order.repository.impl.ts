import type { OrderDocument } from "@cermont/shared-types";
import { type PipelineStage, Types } from "mongoose";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IOrderRepository } from "../domain/order.repository";
import { Order } from "./model";

type SavableOrderDocument = OrderDocument<Types.ObjectId> & {
	save: () => Promise<OrderDocument<Types.ObjectId>>;
};

function hasSaveMethod(order: unknown): order is SavableOrderDocument {
	return typeof (order as { save?: unknown }).save === "function";
}

async function resolveLeanResult<T>(result: T | { lean: () => Promise<T> }): Promise<T> {
	if (
		typeof result === "object" &&
		result !== null &&
		"lean" in result &&
		typeof result.lean === "function"
	) {
		return result.lean();
	}

	return result as T;
}

export class OrderRepository implements IOrderRepository {
	async findById(id: string): Promise<OrderDocument<Types.ObjectId> | null> {
		const doc = await Order.findById(id);
		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async findOne(filter: Record<string, unknown>): Promise<OrderDocument<Types.ObjectId> | null> {
		const doc = await Order.findOne(filter);
		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<OrderDocument<Types.ObjectId>[]> {
		let query = Order.find(filter);
		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		const docs = await query;
		return docs as unknown as OrderDocument<Types.ObjectId>[];
	}

	async countDocuments(filter: Record<string, unknown>): Promise<number> {
		return Order.countDocuments(filter);
	}

	async create(
		data: Partial<OrderDocument<Types.ObjectId>>,
	): Promise<OrderDocument<Types.ObjectId>> {
		const doc =
			typeof Order.create === "function"
				? await Order.create(data as Record<string, unknown>)
				: new Order(data as Record<string, unknown>);

		if (hasSaveMethod(doc)) {
			await doc.save();
		}

		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async update(
		id: string,
		data: Partial<OrderDocument<Types.ObjectId>>,
	): Promise<OrderDocument<Types.ObjectId> | null> {
		const doc = await Order.findByIdAndUpdate(id, data as Record<string, unknown>, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Order.findByIdAndDelete(id);
		return result !== null;
	}

	// ── Domain-specific methods ──────────────────────────────────────────────────

	async findByIdLean(id: string): Promise<OrderDocument<Types.ObjectId> | null> {
		const doc = await resolveLeanResult(Order.findById(id));
		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async findByIdPopulated(id: string): Promise<OrderDocument<Types.ObjectId> | null> {
		const doc = await Order.findById(id)
			.populate("assignedTo", "name email role")
			.populate("supervisedBy", "name email role")
			.populate("createdBy", "name email role")
			.populate("proposalId")
			.lean();
		return doc as unknown as OrderDocument<Types.ObjectId>;
	}

	async findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort?: Record<string, SortDirection>;
		},
	): Promise<OrderDocument<Types.ObjectId>[]> {
		let query = Order.find(filter);
		if (options.sort) {
			query = query.sort(options.sort);
		}
		query = query.skip(options.skip).limit(options.limit);
		const docs = await query.lean();
		return docs as unknown as OrderDocument<Types.ObjectId>[];
	}

	async findWithCursor(
		filter: Record<string, unknown>,
		options: {
			limit: number;
			cursor?: string;
			sort?: Record<string, SortDirection>;
		},
	): Promise<{ items: OrderDocument<Types.ObjectId>[]; hasNextPage: boolean }> {
		const query: Record<string, unknown> = { ...filter };
		if (options.cursor) {
			query._id = {
				...((query._id as Record<string, unknown> | undefined) ?? {}),
				$lt: new Types.ObjectId(options.cursor),
			};
		}

		const docs = await Order.find(query)
			.sort(options.sort ?? { _id: -1 })
			.limit(options.limit + 1)
			.lean();
		const hasNextPage = docs.length > options.limit;
		const items = hasNextPage ? docs.slice(0, options.limit) : docs;

		return {
			items: items as unknown as OrderDocument<Types.ObjectId>[],
			hasNextPage,
		};
	}

	async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<void> {
		await Order.updateOne(filter, update);
	}

	async aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]> {
		return Order.aggregate(pipeline);
	}

	async save(order: OrderDocument<Types.ObjectId>): Promise<OrderDocument<Types.ObjectId>> {
		if (typeof (order as { save?: unknown }).save === "function") {
			return (
				order as OrderDocument<Types.ObjectId> & { save(): Promise<OrderDocument<Types.ObjectId>> }
			).save();
		}
		const doc = await Order.findById((order as { _id: { toString(): string } })._id.toString());
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, order as unknown as Record<string, unknown>);
		return doc.save() as unknown as OrderDocument<Types.ObjectId>;
	}
}
