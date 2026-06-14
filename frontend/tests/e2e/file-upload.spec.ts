import fs from "node:fs";
import path from "node:path";
import { type APIRequestContext, expect, test } from "@playwright/test";
import { E2E_ADMIN } from "./auth-credentials";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const authDir = path.join(process.cwd(), "tests/e2e/fixtures/.auth");
const adminStorageState = path.join(authDir, "admin.json");
const sourceImagePath = path.join(
	process.cwd(),
	"public/images/optimized/login/chatgpt-image-25-may-2026-23-14-19-3-640.webp",
);

interface ResourceCreateResponse {
	success: boolean;
	data: {
		_id: string;
		name: string;
		type: string;
	};
}

interface FileListResponse {
	success: boolean;
	data: Array<{
		id: string;
		originalName: string;
		storedName: string;
		url: string;
		entityType: string;
		entityId: string;
		category: string;
		syncStatus: string;
	}>;
}

async function authenticate(request: APIRequestContext): Promise<string> {
	const response = await request.post(`${backendUrl}/api/auth/login`, {
		data: E2E_ADMIN,
	});
	expect(response.status()).toBe(200);
	const body = (await response.json()) as {
		success: boolean;
		data?: { accessToken?: string };
	};
	const accessToken = body.data?.accessToken;
	expect(body.success).toBe(true);
	expect(accessToken).toBeTruthy();
	return accessToken ?? "";
}

test.describe("real file upload", () => {
	test.use({ storageState: adminStorageState });

	test("uploads a real resource image, persists metadata, and renders after reload", async ({
		page,
		request,
	}) => {
		const accessToken = await authenticate(request);
		const resourceName = `E2E File Upload Tool ${Date.now()}`;
		const createResourceResponse = await request.post(`${backendUrl}/api/resources`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			data: {
				name: resourceName,
				type: "tool",
				description: "E2E owner for real file upload proof",
			},
		});
		expect(createResourceResponse.status()).toBe(201);
		const resourceBody = (await createResourceResponse.json()) as ResourceCreateResponse;
		expect(resourceBody.success).toBe(true);

		await page.goto(`/resources/${resourceBody.data._id}`);
		await expect(page.getByRole("heading", { name: resourceName })).toBeVisible();
		await expect(page.getByRole("heading", { name: "Galería de imágenes" })).toBeVisible();

		const uploadResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes("/api/backend/files/upload") &&
				response.request().method() === "POST",
		);

		const imageBuffer = fs.readFileSync(sourceImagePath);
		await page.getByLabel("Seleccionar imagen para adjuntar").setInputFiles({
			name: "e2e-resource-photo.webp",
			mimeType: "image/webp",
			buffer: imageBuffer,
		});

		const uploadResponse = await uploadResponsePromise;
		expect(uploadResponse.status()).toBe(201);
		await expect(page.getByRole("img", { name: "e2e-resource-photo.webp" })).toBeVisible();

		await page.reload();
		await expect(page.getByRole("img", { name: "e2e-resource-photo.webp" })).toBeVisible();

		const image = page.getByRole("img", { name: "e2e-resource-photo.webp" }).first();
		await expect(image).toBeVisible();
		await expect
			.poll(async () => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
			.toBeGreaterThan(0);
		const imageSrc = await image.getAttribute("src");
		expect(imageSrc).toMatch(/\/api\/files\/[^/]+\/content/);
		const storedImageResponse = await page.request.get(imageSrc ?? "");
		expect(storedImageResponse.status()).toBe(200);

		const filesResponse = await request.get(
			`${backendUrl}/api/files?entityType=tool&entityId=${resourceBody.data._id}`,
			{ headers: { Authorization: `Bearer ${accessToken}` } },
		);
		expect(filesResponse.status()).toBe(200);
		const filesBody = (await filesResponse.json()) as FileListResponse;
		expect(filesBody.success).toBe(true);
		expect(filesBody.data).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					originalName: "e2e-resource-photo.webp",
					entityType: "tool",
					entityId: resourceBody.data._id,
					category: "tool_image",
					syncStatus: "synced",
				}),
			]),
		);
	});
});
