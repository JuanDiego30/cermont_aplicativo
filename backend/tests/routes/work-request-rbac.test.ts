import express from "express";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";

const handlers = vi.hoisted(() => ({
	create: vi.fn((_req, res) => res.status(201).json({ success: true })),
	update: vi.fn((_req, res) => res.status(200).json({ success: true })),
}));
const authContext = vi.hoisted((): { role: "cliente" | "tecnico" } => ({ role: "cliente" }));

vi.mock("../../src/middlewares/auth.middleware", () => ({
	authenticate: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
		req.user = {
			_id: "507f1f77bcf86cd799439011",
			email: "client@example.com",
			role: authContext.role,
		};
		next();
	},
}));

vi.mock("../../src/modules/work-requests/work-requests.controller", () => ({
	createWorkRequest: handlers.create,
	updateWorkRequest: handlers.update,
	getWorkRequests: vi.fn(),
	getWorkRequest: vi.fn(),
	updateWorkRequestStatus: vi.fn(),
	qualifyWorkRequest: vi.fn(),
	deleteWorkRequest: vi.fn(),
	createSiteVisit: vi.fn(),
	listSiteVisits: vi.fn(),
}));

import workRequestRouter from "../../src/modules/work-requests/work-requests.routes";

const validPayload = {
	requesterName: "Ana Cliente",
	clientName: "Cliente Prueba",
	serviceSite: "Sede Norte",
	serviceType: "mantenimiento",
	sourceChannel: "portal_client",
	shortDescription: "Falla eléctrica",
	description: "La instalación presenta una falla eléctrica.",
	requiresSiteVisit: true,
	urgency: "medium",
	tags: [],
	classifications: [],
	initialEvidences: [],
	customFields: {},
};

describe("work request client RBAC", () => {
	test("rejects update access for a technical role outside field management", async () => {
		authContext.role = "tecnico";
		const app = express();
		app.use(express.json());
		app.use("/work-requests", workRequestRouter);

		await request(app)
			.patch("/work-requests/507f1f77bcf86cd799439099")
			.send({ shortDescription: "Cambio no autorizado" })
			.expect(403);

		expect(handlers.update).not.toHaveBeenCalled();
		authContext.role = "cliente";
	});

	test("keeps canonical client create and update-own paths reachable", async () => {
		authContext.role = "cliente";
		const app = express();
		app.use(express.json());
		app.use("/work-requests", workRequestRouter);

		await request(app).post("/work-requests").send(validPayload).expect(201);
		await request(app)
			.patch("/work-requests/507f1f77bcf86cd799439099")
			.send({ shortDescription: "Falla corregida" })
			.expect(200);

		expect(handlers.create).toHaveBeenCalledTimes(1);
		expect(handlers.update).toHaveBeenCalledTimes(1);
	});
});
