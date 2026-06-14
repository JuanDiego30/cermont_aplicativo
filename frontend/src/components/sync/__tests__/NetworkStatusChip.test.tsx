import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/offline/use-sync-status", () => ({
	useSyncStatus: () => ({
		isOnline: true,
		pendingCount: 0,
		failedCount: 1,
		conflictCount: 1,
		isSyncing: false,
		lastSyncError: "",
		lastSyncAt: "",
	}),
}));

const { NetworkStatusChip } = await import("../NetworkStatusChip");

describe("NetworkStatusChip", () => {
	it("links synchronization alerts to the recovery center", () => {
		render(<NetworkStatusChip />);

		const link = screen.getByRole("link", { name: /estado de red/i });
		expect(link.getAttribute("href")).toBe("/offline-sync");
		expect(link.textContent).toContain("2 alertas");
	});
});
