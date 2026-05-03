import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestBinaryDownload } from "../../src/_shared/lib/http/download-client";

const createObjectUrl = vi.fn(() => "blob:download-url");
const revokeObjectUrl = vi.fn();
const click = vi.fn();

function okBinaryResponse() {
	return new Response(new Blob(["binary"]), { status: 200 });
}

function errorJsonResponse() {
	return new Response(JSON.stringify({ message: "Report is not ready" }), {
		status: 409,
		headers: { "Content-Type": "application/json" },
	});
}

describe("download client", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: createObjectUrl,
		});
		Object.defineProperty(URL, "revokeObjectURL", {
			configurable: true,
			value: revokeObjectUrl,
		});
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		createObjectUrl.mockClear();
		revokeObjectUrl.mockClear();
		click.mockClear();
	});

	it("downloads a binary response through the HTTP infrastructure", async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue(okBinaryResponse());

		await requestBinaryDownload({
			path: "/reports/order/order-1/pdf",
			filename: "work-report-order-1.pdf",
			fallbackMessage: "Download failed",
		});

		expect(fetchMock).toHaveBeenCalledWith("/api/backend/reports/order/order-1/pdf", {
			credentials: "include",
			method: "GET",
		});
		expect(click).toHaveBeenCalledTimes(1);
		expect(revokeObjectUrl).toHaveBeenCalledWith("blob:download-url");
	});

	it("posts a typed JSON body for bulk binary downloads", async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue(okBinaryResponse());

		await requestBinaryDownload({
			path: "/reports/evidences/bulk-zip",
			filename: "evidences.zip",
			method: "POST",
			body: { orderIds: ["order-1", "order-2"] },
			fallbackMessage: "Download failed",
		});

		expect(fetchMock).toHaveBeenCalledWith("/api/backend/reports/evidences/bulk-zip", {
			body: JSON.stringify({ orderIds: ["order-1", "order-2"] }),
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
	});

	it("uses the API error message when the binary download fails", async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue(errorJsonResponse());

		await expect(
			requestBinaryDownload({
				path: "/reports/order/order-1/pdf",
				filename: "work-report-order-1.pdf",
				fallbackMessage: "Download failed",
			}),
		).rejects.toThrow("Report is not ready");
	});
});
