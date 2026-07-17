import type {
	ApiEnvelope,
	CreateProposalInput,
	Proposal,
	UpdateProposalStatusInput,
} from "@cermont/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { apiClient } from "@/lib/http/api-client";
import {
	useApproveProposal,
	useCreateProposal,
	useRejectProposal,
	useUpdateProposal,
} from "@/modules/proposals/queries";

vi.mock("@/lib/http/api-client", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

const proposal: Proposal = {
	_id: "507f1f77bcf86cd799439011",
	code: "PROP-2026-0002",
	title: "Propuesta para Ecopetrol",
	clientName: "Ecopetrol S.A.",
	status: "draft",
	validUntil: "2026-08-14T00:00:00.000Z",
	items: [
		{
			description: "Mantenimiento CCTV",
			unit: "servicio",
			quantity: 2,
			unitCost: 1_000_000,
			total: 2_000_000,
		},
	],
	subtotal: 2_000_000,
	taxRate: 0.19,
	total: 2_380_000,
	createdBy: "507f191e810c19729de860ea",
	generatedOrders: [],
	createdAt: "2026-07-14T00:00:00.000Z",
	updatedAt: "2026-07-14T00:00:00.000Z",
};

const envelope: ApiEnvelope<Proposal> = { success: true, data: proposal };

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe("proposal mutation envelopes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("create unwraps the API envelope and returns the proposal", async () => {
		vi.mocked(apiClient.post).mockResolvedValue(envelope);
		const input: CreateProposalInput = {
			title: proposal.title,
			clientName: proposal.clientName,
			validUntil: proposal.validUntil,
			items: proposal.items.map(({ description, unit, quantity, unitCost }) => ({
				description,
				unit,
				quantity,
				unitCost,
			})),
		};
		const { result } = renderHook(() => useCreateProposal(), { wrapper: createWrapper() });

		const created = await act(async () => result.current.mutateAsync(input));

		expect(apiClient.post).toHaveBeenCalledWith("/proposals", input);
		expect(created).toEqual(proposal);
		expect(created?._id).toBe(proposal._id);
	});

	test("update, approve and reject unwrap their API envelopes", async () => {
		vi.mocked(apiClient.patch).mockResolvedValue(envelope);
		const statusInput: UpdateProposalStatusInput = { status: "sent" };
		const update = renderHook(() => useUpdateProposal(proposal._id), {
			wrapper: createWrapper(),
		});
		const approve = renderHook(() => useApproveProposal(proposal._id), {
			wrapper: createWrapper(),
		});
		const reject = renderHook(() => useRejectProposal(proposal._id), {
			wrapper: createWrapper(),
		});

		const updated = await act(async () => update.result.current.mutateAsync(statusInput));
		const approved = await act(async () => approve.result.current.mutateAsync());
		const rejected = await act(async () => reject.result.current.mutateAsync());

		await waitFor(() => expect(updated).toEqual(proposal));
		expect(approved).toEqual(proposal);
		expect(rejected).toEqual(proposal);
		expect(apiClient.patch).toHaveBeenNthCalledWith(
			1,
			`/proposals/${proposal._id}/status`,
			statusInput,
		);
		expect(apiClient.patch).toHaveBeenNthCalledWith(2, `/proposals/${proposal._id}/approve`);
		expect(apiClient.patch).toHaveBeenNthCalledWith(3, `/proposals/${proposal._id}/reject`);
	});
});
