/**
 * Client CRM Service Tests
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	clientCreate: vi.fn(),
	clientFind: vi.fn(),
	clientFindById: vi.fn(),
	clientFindOne: vi.fn(),
	clientFindByIdAndUpdate: vi.fn(),
	clientCountDocuments: vi.fn(),
	workRequestFind: vi.fn(),
	proposalFind: vi.fn(),
	serviceCaseFind: vi.fn(),
	invoiceFind: vi.fn(),
}));

vi.mock("../../src/models/Client", () => ({
	ClientModel: {
		create: mocks.clientCreate,
		find: mocks.clientFind,
		findById: mocks.clientFindById,
		findOne: mocks.clientFindOne,
		findByIdAndUpdate: mocks.clientFindByIdAndUpdate,
		countDocuments: mocks.clientCountDocuments,
	},
}));

vi.mock("../../src/models/WorkRequest", () => ({
	WorkRequest: { find: mocks.workRequestFind },
}));

vi.mock("../../src/models/Proposal", () => ({
	Proposal: { find: mocks.proposalFind },
}));

vi.mock("../../src/models/ServiceCase", () => ({
	ServiceCase: { find: mocks.serviceCaseFind },
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: { find: mocks.invoiceFind },
}));

import * as ClientService from "../../src/modules/client/client.service";

const CLIENT_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";

function buildClient(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId(CLIENT_ID),
		name: "SierraCol Energy",
		nit: "900123456-7",
		status: "active",
		contracts: [],
		...overrides,
	};
}

function chainedFind(result: unknown[]) {
	return {
		sort: vi.fn().mockReturnThis(),
		skip: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		select: vi.fn().mockResolvedValue(result),
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ClientService", () => {
	describe("createClient", () => {
		it("creates a client when NIT is unique", async () => {
			mocks.clientFindOne.mockResolvedValue(null);
			const client = buildClient();
			mocks.clientCreate.mockResolvedValue(client);

			const result = await ClientService.createClient(
				{ name: "SierraCol Energy", nit: "900123456-7", contracts: [], status: "active" },
				USER_ID,
			);

			expect(result).toBe(client);
			expect(mocks.clientCreate).toHaveBeenCalledWith(
				expect.objectContaining({ nit: "900123456-7", createdBy: USER_ID }),
			);
		});

		it("rejects duplicate NIT with CLIENT_NIT_ALREADY_EXISTS", async () => {
			mocks.clientFindOne.mockResolvedValue(buildClient());

			await expect(
				ClientService.createClient(
					{ name: "Otro", nit: "900123456-7", contracts: [], status: "active" },
					USER_ID,
				),
			).rejects.toMatchObject({ code: "CLIENT_NIT_ALREADY_EXISTS" });
		});
	});

	describe("listClients", () => {
		it("returns paginated clients with search filter", async () => {
			const clients = [buildClient()];
			const chain = {
				sort: vi.fn().mockReturnThis(),
				skip: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue(clients),
			};
			mocks.clientFind.mockReturnValue(chain);
			mocks.clientCountDocuments.mockResolvedValue(1);

			const result = await ClientService.listClients({
				page: 1,
				limit: 20,
				search: "Sierra",
			});

			expect(result.data).toEqual(clients);
			expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
			expect(mocks.clientFind).toHaveBeenCalledWith(
				expect.objectContaining({ $or: expect.any(Array) }),
			);
		});
	});

	describe("getClientById", () => {
		it("throws CLIENT_NOT_FOUND when missing", async () => {
			mocks.clientFindById.mockResolvedValue(null);

			await expect(ClientService.getClientById(CLIENT_ID)).rejects.toMatchObject({
				code: "CLIENT_NOT_FOUND",
			});
		});
	});

	describe("getClientHistory", () => {
		it("aggregates cross-module history by client name", async () => {
			mocks.clientFindById.mockResolvedValue(buildClient());
			mocks.workRequestFind.mockReturnValue(chainedFind([{ code: "WR-2026-0001" }]));
			mocks.proposalFind.mockReturnValue(chainedFind([]));
			mocks.serviceCaseFind.mockReturnValue(chainedFind([]));
			mocks.invoiceFind.mockReturnValue(chainedFind([]));

			const history = await ClientService.getClientHistory(CLIENT_ID);

			expect(history.client.name).toBe("SierraCol Energy");
			expect(history.workRequests).toHaveLength(1);
			expect(mocks.workRequestFind).toHaveBeenCalledWith({ clientName: "SierraCol Energy" });
		});
	});
});
