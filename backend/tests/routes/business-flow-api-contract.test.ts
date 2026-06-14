import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index";

const protectedWorkflowEndpoints = [
	{ step: 1, name: "work request", path: "/api/work-requests" },
	{ step: 2, name: "site visit", path: "/api/site-visits" },
	{ step: 3, name: "proposal", path: "/api/proposals" },
	{ step: 4, name: "purchase order", path: "/api/purchase-orders" },
	{ step: 5, name: "planning packet", path: "/api/planning-packets" },
	{ step: 6, name: "execution session", path: "/api/execution-sessions" },
	{ step: 7, name: "evidence", path: "/api/evidences" },
	{ step: 8, name: "technical report", path: "/api/technical-reports" },
	{ step: 9, name: "delivery record", path: "/api/delivery-records" },
	{ step: 10, name: "client signature", path: "/api/signatures" },
	{ step: 11, name: "service entry sheet", path: "/api/service-entry-sheets" },
	{ step: 12, name: "invoice submission", path: "/api/invoices" },
	{ step: 13, name: "invoice approval", path: "/api/invoices" },
	{ step: 14, name: "payment closure", path: "/api/payments" },
] as const;

describe("14-step API contract", () => {
	it.each(protectedWorkflowEndpoints)("mounts step $step $name behind authentication", async ({
		path,
	}) => {
		const response = await request(app).get(path);

		expect(response.status).toBe(401);
		expect(response.body).toMatchObject({
			success: false,
			error: { code: "UNAUTHORIZED" },
		});
	});

	it("publishes every canonical workflow endpoint in OpenAPI", async () => {
		const response = await request(app).get("/api/docs/openapi.json");

		expect(response.status).toBe(200);
		for (const endpoint of protectedWorkflowEndpoints) {
			expect(response.body.paths).toHaveProperty(endpoint.path);
		}
	});
});
