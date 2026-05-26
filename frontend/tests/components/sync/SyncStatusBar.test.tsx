import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";

const connectivityState = { isOnline: true };
const syncManagerState = {
	status: "idle" as "idle" | "syncing" | "error",
	pendingCount: 0,
	deadLetterCount: 0,
};

vi.mock("@/lib/offline/connectivity", () => ({
	useConnectivity: () => connectivityState,
}));

vi.mock("@/lib/offline/sync-manager", () => ({
	useSyncManager: () => syncManagerState,
}));

describe("SyncStatusBar", () => {
	beforeEach(() => {
		connectivityState.isOnline = true;
		syncManagerState.status = "idle";
		syncManagerState.pendingCount = 0;
		syncManagerState.deadLetterCount = 0;
	});

	it("shows the online state", () => {
		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("online");
		expect(screen.queryByText("En línea")).not.toBeNull();
	});

	it("shows the offline state", () => {
		connectivityState.isOnline = false;
		syncManagerState.pendingCount = 2;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("offline");
		expect(screen.queryByText(/Sin conexión/)).not.toBeNull();
		expect(screen.queryByText(/2 cambios pendientes/)).not.toBeNull();
	});

	it("shows the syncing state", () => {
		syncManagerState.status = "syncing";
		syncManagerState.pendingCount = 3;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("syncing");
		expect(screen.queryByText(/Sincronizando/)).not.toBeNull();
		expect(screen.queryByText(/3 cambios pendientes/)).not.toBeNull();
	});

	it("shows the sync error state", () => {
		syncManagerState.status = "error";
		syncManagerState.deadLetterCount = 4;

		render(<SyncStatusBar />);

		expect(screen.getByRole("status").getAttribute("data-state")).toBe("sync_error");
		expect(screen.queryByText(/4 cambios requieren revisión/)).not.toBeNull();
	});
});
