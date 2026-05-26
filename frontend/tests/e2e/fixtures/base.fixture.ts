import path from "node:path";
import { type Browser, test as base, expect, type Page } from "@playwright/test";
import type { E2EApiClient } from "./api-client.fixture";
import { createE2EApiClient } from "./api-client.fixture";

const AUTH_DIR = path.join(process.cwd(), "tests/e2e/fixtures/.auth");

type Cleanup = {
	trackOrder: (orderId: string) => void;
	trackKit: (kitId: string) => void;
};

async function openAuthedPage(
	browser: Browser,
	storageStateFile: string,
): Promise<{ page: Page; close: () => Promise<void> }> {
	const context = await browser.newContext({ storageState: storageStateFile });
	const page = await context.newPage();

	return {
		page,
		close: async () => {
			await context.close();
		},
	};
}

export const test = base.extend<{
	adminPage: Page;
	supervisorPage: Page;
	technicianPage: Page;
	apiClient: E2EApiClient;
	cleanup: Cleanup;
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture convention
	apiClient: async ({}, setApiClient) => {
		const client = await createE2EApiClient();
		try {
			await setApiClient(client);
		} finally {
			await client.dispose();
		}
	},

	cleanup: async ({ apiClient }, setCleanup) => {
		const orderIds = new Set<string>();
		const kitIds = new Set<string>();

		const cleanup: Cleanup = {
			trackOrder: (orderId) => {
				if (orderId) {
					orderIds.add(orderId);
				}
			},
			trackKit: (kitId) => {
				if (kitId) {
					kitIds.add(kitId);
				}
			},
		};

		try {
			await setCleanup(cleanup);
		} finally {
			for (const kitId of kitIds) {
				await apiClient.deleteKit(kitId).catch(() => undefined);
			}

			for (const orderId of orderIds) {
				await apiClient.deleteOrder(orderId).catch(() => undefined);
			}
		}
	},

	adminPage: async ({ browser }, setAdminPage) => {
		const auth = await openAuthedPage(browser, path.join(AUTH_DIR, "admin.json"));
		try {
			await setAdminPage(auth.page);
		} finally {
			await auth.close();
		}
	},

	supervisorPage: async ({ browser }, setSupervisorPage) => {
		const auth = await openAuthedPage(browser, path.join(AUTH_DIR, "supervisor.json"));
		try {
			await setSupervisorPage(auth.page);
		} finally {
			await auth.close();
		}
	},

	technicianPage: async ({ browser }, setTechnicianPage) => {
		const auth = await openAuthedPage(browser, path.join(AUTH_DIR, "technician.json"));
		try {
			await setTechnicianPage(auth.page);
		} finally {
			await auth.close();
		}
	},
});

export { expect };
