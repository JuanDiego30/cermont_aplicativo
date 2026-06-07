import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index";

describe("uploaded file serving", () => {
	it("does not expose the configured local upload directory as a public web root", async () => {
		const uploadsDir = path.resolve(process.cwd(), "uploads");
		await mkdir(uploadsDir, { recursive: true });
		await writeFile(path.join(uploadsDir, "static-proof.txt"), "cermont-upload-proof");

		const response = await request(app).get("/uploads/static-proof.txt");

		expect(response.status).toBe(404);
		expect(response.text).not.toContain("cermont-upload-proof");
	});
});
