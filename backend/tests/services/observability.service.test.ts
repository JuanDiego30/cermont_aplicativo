import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	readyState: 0,
	ping: vi.fn(),
	orderCountDocuments: vi.fn(),
	executionSessionCountDocuments: vi.fn(),
	fileAssetCountDocuments: vi.fn(),
}));

vi.mock("mongoose", () => ({
	default: {
		connection: {
			get readyState() {
				return mocks.readyState;
			},
			db: {
				admin: () => ({ ping: mocks.ping }),
			},
		},
	},
}));

vi.mock("../../src/models/Order", () => ({
	Order: { countDocuments: mocks.orderCountDocuments },
}));

vi.mock("../../src/models/ExecutionSession", () => ({
	ExecutionSession: { countDocuments: mocks.executionSessionCountDocuments },
}));

vi.mock("../../src/models/FileAsset", () => ({
	FileAsset: { countDocuments: mocks.fileAssetCountDocuments },
}));

import { getSystemHealth } from "../../src/modules/observability/observability.service";

describe("observability service health", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.readyState = 0;
		mocks.ping.mockResolvedValue({ ok: 1 });
	});

	it("reports unhealthy without querying MongoDB when disconnected", async () => {
		const health = await getSystemHealth();

		expect(health).toMatchObject({
			status: "unhealthy",
			mongo: {
				connected: false,
				readyState: 0,
				responseTimeMs: expect.any(Number),
			},
			uptime: expect.any(Number),
			timestamp: expect.any(String),
		});
		expect(mocks.ping).not.toHaveBeenCalled();
	});

	it("reports healthy only after MongoDB responds to ping", async () => {
		mocks.readyState = 1;

		const health = await getSystemHealth();

		expect(health).toMatchObject({
			status: "healthy",
			mongo: {
				connected: true,
				readyState: 1,
				responseTimeMs: expect.any(Number),
			},
		});
		expect(mocks.ping).toHaveBeenCalledOnce();
	});

	it("reports degraded when a connected MongoDB does not answer ping", async () => {
		mocks.readyState = 1;
		mocks.ping.mockRejectedValue(new Error("ping failed"));

		const health = await getSystemHealth();

		expect(health).toMatchObject({
			status: "degraded",
			mongo: {
				connected: false,
				readyState: 1,
				responseTimeMs: expect.any(Number),
			},
		});
	});
});
