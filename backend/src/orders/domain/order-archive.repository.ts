export interface OrderArchiveRecord {
	_id: { toString(): string };
	orderId: { toString(): string };
	orderCode: string;
	period: string;
	archivedAt: Date;
	snapshot: Record<string, unknown>;
}

export interface IOrderArchiveRepository {
	archivePaidClosedBefore(threshold: Date, limit: number): Promise<number>;
	findPaginated(
		filter: Record<string, unknown>,
		options: {
			skip: number;
			limit: number;
			sort: Record<string, 1 | -1>;
		},
	): Promise<{ rows: OrderArchiveRecord[]; total: number }>;
}
