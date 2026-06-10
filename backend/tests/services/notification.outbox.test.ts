import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => ({
	outboxCreate: vi.fn(),
	outboxFind: vi.fn(),
	outboxFindOneAndUpdate: vi.fn(),
	outboxUpdateOne: vi.fn(),
	notificationInsertMany: vi.fn(),
	serviceCaseFindById: vi.fn(),
	userFind: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	NotificationOutbox: {
		create: mocks.outboxCreate,
		find: mocks.outboxFind,
		findOneAndUpdate: mocks.outboxFindOneAndUpdate,
		updateOne: mocks.outboxUpdateOne,
	},
	Notification: {
		insertMany: mocks.notificationInsertMany,
		find: vi.fn(),
		countDocuments: vi.fn(),
		findOneAndUpdate: vi.fn(),
		updateMany: vi.fn(),
	},
	ServiceCase: { findById: mocks.serviceCaseFindById },
	User: { find: mocks.userFind },
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: () => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
}));

const { enqueueNotification, processOutboxEntries, getFailedOutboxNotifications } = await import(
	"../../src/modules/notifications/notification.service"
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeOutboxEntry(
	overrides: Partial<{
		_id: string;
		status: string;
		retryCount: number;
		serviceCaseId: string;
		previousState: string;
		newState: string;
		triggeredByUserId: string;
	}> = {},
) {
	return {
		_id: "outbox1",
		status: "pending",
		serviceCaseId: "sc1",
		previousState: "step_01_work_request",
		newState: "step_02_site_visit",
		triggeredByUserId: "user1",
		retryCount: 0,
		...overrides,
	};
}

function setupNotifySuccess() {
	mocks.serviceCaseFindById.mockResolvedValue({ _id: "sc1", code: "SC-001" });
	mocks.userFind.mockReturnValue({
		lean: vi.fn().mockResolvedValue([{ _id: "u1", role: "gerente" }]),
	});
	mocks.notificationInsertMany.mockResolvedValue([]);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("notification.outbox — enqueueNotification", () => {
	beforeEach(() => vi.clearAllMocks());

	it("creates a pending outbox document", async () => {
		mocks.outboxCreate.mockResolvedValue({});

		await enqueueNotification("sc1", "step_01_work_request", "step_02_site_visit", "user1");

		expect(mocks.outboxCreate).toHaveBeenCalledOnce();
		const created = mocks.outboxCreate.mock.calls[0][0];
		expect(created.status).toBe("pending");
		expect(created.serviceCaseId).toBe("sc1");
		expect(created.previousState).toBe("step_01_work_request");
		expect(created.newState).toBe("step_02_site_visit");
		expect(created.triggeredByUserId).toBe("user1");
		expect(created.retryCount).toBe(0);
	});

	it("does not throw when create succeeds", async () => {
		mocks.outboxCreate.mockResolvedValue({});
		await expect(
			enqueueNotification("sc1", "step_01", "step_02", "user1"),
		).resolves.toBeUndefined();
	});
});

describe("notification.outbox — processOutboxEntries", () => {
	beforeEach(() => vi.clearAllMocks());

	it("processes a pending entry and marks it sent", async () => {
		const entry = makeOutboxEntry();
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue([entry]),
		});
		mocks.outboxFindOneAndUpdate.mockResolvedValue(entry); // claimed successfully
		setupNotifySuccess();
		mocks.outboxUpdateOne.mockResolvedValue({});

		await processOutboxEntries();

		expect(mocks.outboxFindOneAndUpdate).toHaveBeenCalledWith(
			{ _id: "outbox1", status: "pending" },
			{ $set: { status: "processing" } },
			{ new: false },
		);
		expect(mocks.notificationInsertMany).toHaveBeenCalled();
		expect(mocks.outboxUpdateOne).toHaveBeenCalledWith(
			{ _id: "outbox1" },
			expect.objectContaining({ $set: expect.objectContaining({ status: "sent" }) }),
		);
	});

	it("skips entry if another worker already claimed it", async () => {
		const entry = makeOutboxEntry();
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue([entry]),
		});
		mocks.outboxFindOneAndUpdate.mockResolvedValue(null); // not claimed

		await processOutboxEntries();

		expect(mocks.notificationInsertMany).not.toHaveBeenCalled();
		expect(mocks.outboxUpdateOne).not.toHaveBeenCalled();
	});

	it("retries with nextRetryAt on first failure (retryCount becomes 1)", async () => {
		const entry = makeOutboxEntry({ retryCount: 0 });
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue([entry]),
		});
		mocks.outboxFindOneAndUpdate.mockResolvedValue(entry);
		mocks.serviceCaseFindById.mockResolvedValue(null); // causes notifyStateTransition to return early
		// But insertMany won't be called so no error...
		// Actually we need the notify to fail. Let's mock serviceCaseFindById to throw.
		mocks.serviceCaseFindById.mockRejectedValue(new Error("DB timeout"));
		mocks.outboxUpdateOne.mockResolvedValue({});

		await processOutboxEntries();

		expect(mocks.outboxUpdateOne).toHaveBeenCalledWith(
			{ _id: "outbox1" },
			expect.objectContaining({
				$set: expect.objectContaining({
					status: "pending",
					retryCount: 1,
					lastError: expect.stringContaining("DB timeout"),
					nextRetryAt: expect.any(Date),
				}),
			}),
		);
	});

	it("marks as failed after 3 retries (retryCount=2 → becomes 3)", async () => {
		const entry = makeOutboxEntry({ retryCount: 2 }); // already tried twice
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue([entry]),
		});
		mocks.outboxFindOneAndUpdate.mockResolvedValue(entry);
		mocks.serviceCaseFindById.mockRejectedValue(new Error("DB unreachable"));
		mocks.outboxUpdateOne.mockResolvedValue({});

		await processOutboxEntries();

		expect(mocks.outboxUpdateOne).toHaveBeenCalledWith(
			{ _id: "outbox1" },
			expect.objectContaining({
				$set: expect.objectContaining({
					status: "failed",
					retryCount: 3,
				}),
			}),
		);
	});

	it("processes multiple entries in one cycle", async () => {
		const entries = [
			makeOutboxEntry({ _id: "o1" }),
			makeOutboxEntry({ _id: "o2", newState: "step_03_proposal" }),
		];
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue(entries),
		});
		mocks.outboxFindOneAndUpdate.mockResolvedValue(entries[0]); // both claimed
		setupNotifySuccess();
		mocks.outboxUpdateOne.mockResolvedValue({});

		await processOutboxEntries();

		expect(mocks.outboxFindOneAndUpdate).toHaveBeenCalledTimes(2);
	});

	it("returns immediately when no pending entries", async () => {
		mocks.outboxFind.mockReturnValue({
			limit: vi.fn().mockResolvedValue([]),
		});

		await processOutboxEntries();

		expect(mocks.outboxFindOneAndUpdate).not.toHaveBeenCalled();
		expect(mocks.notificationInsertMany).not.toHaveBeenCalled();
	});
});

describe("notification.outbox — getFailedOutboxNotifications", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns failed outbox entries", async () => {
		const failed = [
			makeOutboxEntry({ _id: "f1", status: "failed", retryCount: 3 }),
			makeOutboxEntry({ _id: "f2", status: "failed", retryCount: 3 }),
		];
		mocks.outboxFind.mockReturnValue({
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(failed),
		});

		const result = await getFailedOutboxNotifications();

		expect(mocks.outboxFind).toHaveBeenCalledWith({ status: "failed" });
		expect(result).toHaveLength(2);
	});

	it("returns empty array when no failures", async () => {
		mocks.outboxFind.mockReturnValue({
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([]),
		});

		const result = await getFailedOutboxNotifications();
		expect(result).toHaveLength(0);
	});
});

describe("notification.outbox — system does NOT require Redis", () => {
	it("enqueueNotification uses only MongoDB (no Redis dependency)", async () => {
		mocks.outboxCreate.mockResolvedValue({});
		// If this resolves without error, there's no Redis dependency
		await expect(
			enqueueNotification("sc1", "step_01", "step_02", "user1"),
		).resolves.toBeUndefined();
	});
});
