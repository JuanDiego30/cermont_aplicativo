import type { CreateWorkRequestInput } from "@cermont/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	counterInc: vi.fn<() => Promise<number>>(),
	workRequestCreate: vi.fn(),
	workRequestFind: vi.fn(),
	workRequestCountDocuments: vi.fn(),
	workRequestFindById: vi.fn(),
	workRequestFindByIdAndUpdate: vi.fn(),
	serviceCaseCreate: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Counter: {
		inc: mocks.counterInc,
	},
	WorkRequest: {
		create: mocks.workRequestCreate,
		find: mocks.workRequestFind,
		countDocuments: mocks.workRequestCountDocuments,
		findById: mocks.workRequestFindById,
		findByIdAndUpdate: mocks.workRequestFindByIdAndUpdate,
	},
	ServiceCase: {
		create: mocks.serviceCaseCreate,
	},
}));

import * as WorkRequestService from "../../src/modules/work-requests/work-requests.service";

const USER_ID = "507f1f77bcf86cd799439011";

const createInput: CreateWorkRequestInput = {
	requesterName: "Gerencia Cermont",
	clientName: "Cliente Industrial S.A.S.",
	serviceSite: "Planta norte",
	serviceType: "lineas_de_vida",
	sourceChannel: "portal_client",
	shortDescription: "Inspección de línea de vida",
	description: "Inspección inicial para calificar alcance y generar propuesta.",
	urgency: "high",
	tags: [],
	classifications: [],
	requiresSiteVisit: true,
};

function buildFindChain<T>(resolvedValue: T) {
	const exec = vi.fn<() => Promise<T>>();
	exec.mockResolvedValue(resolvedValue);
	const chain = {
		sort: vi.fn(),
		limit: vi.fn(),
		skip: vi.fn(),
		populate: vi.fn(),
		exec,
	};
	chain.sort.mockReturnValue(chain);
	chain.limit.mockReturnValue(chain);
	chain.skip.mockReturnValue(chain);
	chain.populate.mockReturnValue(chain);

	return chain;
}

function buildCountChain(resolvedValue: number) {
	const exec = vi.fn<() => Promise<number>>();
	exec.mockResolvedValue(resolvedValue);
	return { exec };
}

describe("WorkRequestService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates submitted work requests with a canonical WR code", async () => {
		mocks.counterInc.mockResolvedValue(7);
		mocks.workRequestCreate.mockImplementation((payload) => Promise.resolve(payload));

		const result = await WorkRequestService.createWorkRequest(createInput, USER_ID);

		expect(mocks.counterInc).toHaveBeenCalledWith(`WR-${new Date().getFullYear()}`);
		expect(mocks.workRequestCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				code: `WR-${new Date().getFullYear()}-0007`,
				status: "submitted",
				requesterId: USER_ID,
				createdBy: USER_ID,
				updatedBy: USER_ID,
			}),
		);
		expect(result).toMatchObject({
			workRequest: {
				code: `WR-${new Date().getFullYear()}-0007`,
				status: "submitted",
			},
		});
	});

	it("lists work requests with page-one pagination and canonical envelope data", async () => {
		const data = [{ code: "WR-2026-0001", status: "submitted" }];
		const chain = buildFindChain(data);
		mocks.workRequestFind.mockReturnValue(chain);
		mocks.workRequestCountDocuments.mockReturnValue(buildCountChain(1));

		const result = await WorkRequestService.getWorkRequests(
			{
				page: 1,
				limit: 20,
				status: ["submitted"],
			},
			USER_ID,
			"gerente",
		);

		expect(mocks.workRequestFind).toHaveBeenCalledWith({
			archived: false,
			status: { $in: ["submitted"] },
		});
		expect(chain.skip).toHaveBeenCalledWith(0);
		expect(result).toEqual({
			data,
			pagination: {
				page: 1,
				limit: 20,
				total: 1,
				totalPages: 1,
			},
		});
	});
});
