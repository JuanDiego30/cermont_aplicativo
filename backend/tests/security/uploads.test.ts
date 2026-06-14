import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import multer from "multer";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../src/common/errors";
import {
	cleanupOrphanedFiles,
	evidenceUpload,
	handleUploadError,
	MAX_FILE_SIZE,
	processUploadedFile,
	scanWithClamAV,
	upload,
	validateUploadedFileHeaders,
} from "../../src/middlewares/uploadMiddleware";

const createdFiles: string[] = [];
const onePixelPng = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
	"base64",
);

function createUploadTestApp() {
	const testApp = express();
	testApp.post(
		"/upload",
		upload.single("file"),
		handleUploadError,
		processUploadedFile,
		(req, res) => {
			if (req.file?.storedPath) {
				createdFiles.push(req.file.storedPath);
			}
			res.status(201).json({
				success: true,
				data: {
					originalName: req.file?.originalname,
					storedName: req.file?.filename,
				},
			});
		},
	);
	testApp.use(errorHandler);
	return testApp;
}

afterEach(async () => {
	vi.restoreAllMocks();
	await Promise.all(
		createdFiles.splice(0).map(async (filePath) => {
			await fs.rm(filePath, { force: true });
		}),
	);
});

describe("secure upload pipeline", () => {
	it("passes through requests that do not contain a file", async () => {
		const testApp = express();
		testApp.post("/upload", validateUploadedFileHeaders, processUploadedFile, (_req, res) => {
			res.status(204).end();
		});

		const response = await request(testApp).post("/upload");

		expect(response.status).toBe(204);
	});

	it("stores a path-like original filename under a UUID filename", async () => {
		const response = await request(createUploadTestApp())
			.post("/upload")
			.attach("file", onePixelPng, {
				filename: "../../../etc/passwd.png",
				contentType: "image/png",
			});

		expect(response.status).toBe(201);
		expect(response.body.data.originalName).toBe("passwd.png");
		expect(response.body.data.storedName).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i,
		);
		expect(path.basename(createdFiles[0])).toBe(response.body.data.storedName);
	});

	it("stores non-image documents without image processing", async () => {
		const pdf = Buffer.from("%PDF-1.7\nsecure evidence");
		const response = await request(createUploadTestApp()).post("/upload").attach("file", pdf, {
			filename: "evidence.pdf",
			contentType: "application/pdf",
		});

		expect(response.status).toBe(201);
		expect(response.body.data.storedName).toMatch(/^[0-9a-f-]{36}\.pdf$/i);
		expect(await fs.readFile(createdFiles[0])).toEqual(pdf);
	});

	it("rejects a spoofed PNG with HTTP 415", async () => {
		const response = await request(createUploadTestApp())
			.post("/upload")
			.attach("file", Buffer.from("MZ executable payload"), {
				filename: "evidence.png",
				contentType: "image/png",
			});

		expect(response.status).toBe(415);
		expect(response.body).toMatchObject({
			success: false,
			error: { code: "FILE_SIGNATURE_MISMATCH" },
		});
	});

	it("rejects a disallowed MIME type before reading the file body", async () => {
		const response = await request(createUploadTestApp())
			.post("/upload")
			.attach("file", Buffer.from("plain text"), {
				filename: "notes.txt",
				contentType: "text/plain",
			});

		expect(response.status).toBe(415);
		expect(response.body.error.message).toContain("Invalid file type");
	});

	it("rejects a valid MIME type with a disallowed extension", async () => {
		const response = await request(createUploadTestApp())
			.post("/upload")
			.attach("file", onePixelPng, {
				filename: "evidence.exe",
				contentType: "image/png",
			});

		expect(response.status).toBe(415);
		expect(response.body.error.message).toContain("Invalid file extension");
	});

	it("restricts evidence uploads to image formats", async () => {
		const testApp = express();
		testApp.post("/evidence", evidenceUpload.single("file"), handleUploadError, (_req, res) => {
			res.status(201).end();
		});
		testApp.use(errorHandler);

		const response = await request(testApp)
			.post("/evidence")
			.attach("file", Buffer.from("%PDF-1.7\n"), {
				filename: "evidence.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).toBe(415);
		expect(response.body.error.message).toContain("Only JPEG, PNG, WebP, and GIF");
	});

	it("passes header validation failures to the error handler", async () => {
		const testApp = express();
		testApp.post(
			"/upload",
			upload.single("file"),
			handleUploadError,
			validateUploadedFileHeaders,
			(_req, res) => {
				res.status(201).end();
			},
		);
		testApp.use(errorHandler);

		const response = await request(testApp)
			.post("/upload")
			.attach("file", Buffer.from("not a png"), {
				filename: "evidence.png",
				contentType: "image/png",
			});

		expect(response.status).toBe(415);
		expect(response.body.error.code).toBe("FILE_SIGNATURE_MISMATCH");
	});

	it("rejects files larger than 20 MB with HTTP 413", async () => {
		const oversized = Buffer.alloc(MAX_FILE_SIZE + 1, 0x61);
		const response = await request(createUploadTestApp())
			.post("/upload")
			.attach("file", oversized, {
				filename: "oversized.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).toBe(413);
		expect(response.body).toEqual({
			success: false,
			error: {
				code: "FILE_TOO_LARGE",
				message: "File too large. Max size: 20MB",
			},
		});
	});

	it("maps Multer file-count errors to the stable API error", async () => {
		const testApp = express();
		testApp.post(
			"/upload",
			(_req, _res, next) => {
				next(new multer.MulterError("LIMIT_FILE_COUNT"));
			},
			handleUploadError,
		);

		const response = await request(testApp).post("/upload");

		expect(response.status).toBe(400);
		expect(response.body.error.code).toBe("FILE_COUNT_EXCEEDED");
	});

	it("delegates non-Multer errors to the application error handler", async () => {
		const testApp = express();
		testApp.post(
			"/upload",
			(_req, _res, next) => {
				next(new Error("storage unavailable"));
			},
			handleUploadError,
		);
		testApp.use(errorHandler);

		const response = await request(testApp).post("/upload");

		expect(response.status).toBe(500);
	});

	it("allows uploads when ClamAV is explicitly disabled", async () => {
		await expect(scanWithClamAV(Buffer.from("safe"), "safe.pdf")).resolves.toBe(true);
	});

	it("removes upload files older than the configured retention window", async () => {
		const cleanupFile = path.resolve("uploads", `cleanup-${Date.now()}.pdf`);
		await fs.mkdir(path.dirname(cleanupFile), { recursive: true });
		await fs.writeFile(cleanupFile, "%PDF-1.7\n");
		const oldTime = new Date("2020-01-01T00:00:00.000Z");
		await fs.utimes(cleanupFile, oldTime, oldTime);

		await cleanupOrphanedFiles(30);

		expect(fsSync.existsSync(cleanupFile)).toBe(false);
	});

	it("logs cleanup failures without crashing the worker", async () => {
		vi.spyOn(fsSync, "readdirSync").mockImplementation(() => {
			throw new Error("disk unavailable");
		});

		await expect(cleanupOrphanedFiles()).resolves.toBeUndefined();
	});
});
