import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";

const syncStatusState = {
	isOnline: true,
	pendingCount: 0,
	isSyncing: false,
	lastSyncError: "",
};

const offlineStoreState = {
	failedCount: 0,
};

vi.mock("@/lib/offline/use-sync-status", () => ({
	useSyncStatus: () => syncStatusState,
}));

vi.mock("@/store/offline.store", () => ({
	useOfflineStore: (selector: (state: typeof offlineStoreState) => number) =>
		selector(offlineStoreState),
}));

describe("SyncStatusBar", () => {
	beforeEach(() => {
		syncStatusState.isOnline = true;
		syncStatusState.pendingCount = 0;
		syncStatusState.isSyncing = false;
		syncStatusState.lastSyncError = "";
		offlineStoreState.failedCount = 0;
	});

	it("shows the online state", () => {
		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("online");
		expect(screen.queryByText("En línea")).not.toBeNull();
	});

	it("shows the offline state", () => {
		syncStatusState.isOnline = false;
		syncStatusState.pendingCount = 2;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("offline");
		expect(screen.queryByText(/Sin conexión/)).not.toBeNull();
		expect(screen.queryByText(/2 cambios pendientes/)).not.toBeNull();
	});

	it("shows the syncing state", () => {
		syncStatusState.isSyncing = true;
		syncStatusState.pendingCount = 3;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("syncing");
		expect(screen.queryByText(/Sincronizando/)).not.toBeNull();
		expect(screen.queryByText(/3 cambios pendientes/)).not.toBeNull();
	});

	it("shows the sync error state", () => {
		syncStatusState.lastSyncError = "Hay cambios offline que requieren revisión.";
		offlineStoreState.failedCount = 4;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("sync_error");
		expect(screen.queryByText(/4 cambios requieren revisión/)).not.toBeNull();
	});
});
