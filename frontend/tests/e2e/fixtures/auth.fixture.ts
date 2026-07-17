import { test as base, type APIRequestContext, expect, request } from "@playwright/test";
import { getE2ECredentials, loginAsUser, hasE2ECredentials } from "../auth-credentials";

export type AuthFixture = {
	apiContext: APIRequestContext;
	authToken: string;
	userId: string;
};

export const test = base.extend<AuthFixture>({
	authToken: [
		async ({ page }, use) => {
			test.skip(!hasE2ECredentials(), "E2E credentials not configured");

			let token = "";
			page.on("request", (req) => {
				const auth = req.headers()["authorization"];
				if (auth?.startsWith("Bearer ") && !token) {
					token = auth.replace("Bearer ", "");
				}
			});

			await loginAsUser(page, getE2ECredentials());

			await page.waitForURL(/dashboard/, { timeout: 15_000 });
			await page.waitForTimeout(2000);

			await use(token);
		},
		{ scope: "test" },
	],

	apiContext: [
		async ({ authToken }, use) => {
			const ctx = await request.newContext({
				baseURL: `${(process.env.E2E_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "")}/`,
				extraHTTPHeaders: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			});
			await use(ctx);
			await ctx.dispose();
		},
		{ scope: "test" },
	],

	userId: [
		async ({ apiContext }, use) => {
			const resp = await apiContext.get("auth/me");
			const body = await resp.json().catch(() => ({ data: null }));
			await use(body?.data?._id ?? "");
		},
		{ scope: "test" },
	],
});

export { expect };
