import type { Request, Response } from "express";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ValidationError } from "../../src/_shared/common/errors";
import { validateQuery } from "../../src/_shared/middlewares/validate";

describe("validation middleware", () => {
	it("replaces query data with the parsed schema result", async () => {
		const schema = z.object({
			page: z.coerce.number().int().positive(),
		});
		const originalQuery = { page: "2", stale: "remove-me" };
		const req = { query: originalQuery } as Request;
		const next = vi.fn();

		await validateQuery(schema)(req, {} as Response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.query).toEqual({ page: 2 });
		expect(req.query).not.toBe(originalQuery);
		expect(originalQuery).toEqual({ page: "2", stale: "remove-me" });
	});

	it("stores parsed query data when Express exposes req.query as getter-only", async () => {
		const schema = z.object({
			limit: z.coerce.number().int().positive().default(20),
			pagination: z.enum(["offset", "cursor"]).default("offset"),
		});
		const req = {} as Request;
		Object.defineProperty(req, "query", {
			get: () => ({ pagination: "cursor" }),
			configurable: true,
			enumerable: true,
		});
		const next = vi.fn();

		await validateQuery(schema)(req, {} as Response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.query).toEqual({ limit: 20, pagination: "cursor" });
	});

	it("stores parsed query data on a real Express request", async () => {
		const schema = z.object({
			limit: z.coerce.number().int().positive().default(20),
			pagination: z.enum(["offset", "cursor"]).default("offset"),
		});
		const app = express();

		app.get("/orders", validateQuery(schema), (req, res) => {
			res.json({ query: req.query });
		});

		const response = await request(app).get("/orders").query({ pagination: "cursor" }).expect(200);

		expect(response.body).toEqual({
			query: { limit: 20, pagination: "cursor" },
		});
	});

	it("fails before calling the next middleware when the schema rejects input", async () => {
		const schema = z.object({
			page: z.coerce.number().int().positive(),
		});
		const req = { query: { page: "0" } } as Request;
		const next = vi.fn();

		await expect(validateQuery(schema)(req, {} as Response, next)).rejects.toThrow(ValidationError);
		expect(next).not.toHaveBeenCalled();
	});
});
