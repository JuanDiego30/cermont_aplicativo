import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOfflineChecklist } from "@/modules/checklists/hooks/useOfflineChecklist";

const mocks = vi.hoisted(() => ({
	enqueueMock: vi.fn().mockResolvedValue(undefined),
	createChecklistMutateAsync: vi.fn(),
	updateChecklistItemMutateAsync: vi.fn(),
	completeChecklistMutateAsync: vi.fn(),
}));

vi.mock("@/modules/checklists/queries", () => ({
	useCreateChecklist: () => ({
		mutateAsync: mocks.createChecklistMutateAsync,
		mutate: vi.fn(),
		isPending: false,
	}),
	useUpdateChecklistItem: () => ({
		mutateAsync: mocks.updateChecklistItemMutateAsync,
		mutate: vi.fn(),
		isPending: false,
	}),
	useCompleteChecklist: () => ({
		mutateAsync: mocks.completeChecklistMutateAsync,
		mutate: vi.fn(),
		isPending: false,
	}),
}));

vi.mock("@/lib/offline/sync-queue", () => ({
	enqueue: mocks.enqueueMock,
}));

describe("useOfflineChecklist", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("queues checklist creation when the network fails", async () => {
		mocks.createChecklistMutateAsync.mockRejectedValue(new TypeError("Failed to fetch"));

		const { result } = renderHook(() => useOfflineChecklist());

		await expect(
			result.current.createChecklistMutation.mutateAsync({ orderId: "order-1" }),
		).resolves.toBeNull();

		expect(mocks.enqueueMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: "/checklists",
				method: "POST",
				payload: { orderId: "order-1" },
				dedupeKey: "checklists:create:order-1",
			}),
		);
		expect(mocks.createChecklistMutateAsync).toHaveBeenCalledWith({ orderId: "order-1" });
	});

	it("queues checklist completion when the network fails", async () => {
		mocks.completeChecklistMutateAsync.mockRejectedValue(new TypeError("Failed to fetch"));

		const { result } = renderHook(() => useOfflineChecklist());

		await expect(
			result.current.completeChecklistMutation.mutateAsync({
				checklistId: "checklist-1",
				orderId: "order-1",
				signature: "firma",
				observations: "observado",
			}),
		).resolves.toBeNull();

		expect(mocks.enqueueMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: "/checklists/checklist-1/validate",
				method: "POST",
				payload: {
					signature: "firma",
					observations: "observado",
				},
				dedupeKey: "checklists:complete:checklist-1:firma:observado",
			}),
		);
		expect(mocks.completeChecklistMutateAsync).toHaveBeenCalledWith({
			checklistId: "checklist-1",
			orderId: "order-1",
			signature: "firma",
			observations: "observado",
		});
	});
});
