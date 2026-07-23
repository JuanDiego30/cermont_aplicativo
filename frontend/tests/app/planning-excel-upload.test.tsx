import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExcelUploadCard, validateExcelFile } from "@/app/(dashboard)/planning/ExcelUploadCard";

const mocks = vi.hoisted(() => ({
	toastError: vi.fn(),
	toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		error: mocks.toastError,
		success: mocks.toastSuccess,
	},
}));

vi.mock("@/modules/documents/ui/ContextualDocumentUploadModal", () => ({
	ContextualDocumentUploadModal: ({ children }: { children: ReactNode }) => children,
}));

describe("ExcelUploadCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects a non-Excel file with a visible Sonner error", async () => {
		render(<ExcelUploadCard />);
		const malformedFile = new File(["not an excel workbook"], "recursos.txt", {
			type: "text/plain",
		});

		fireEvent.change(screen.getByLabelText("Seleccionar Excel"), {
			target: { files: [malformedFile] },
		});

		await waitFor(() =>
			expect(mocks.toastError).toHaveBeenCalledWith(
				"Formato no soportado. Sube un archivo .xlsx o .xls",
			),
		);
		expect(screen.queryByText("recursos.txt")).toBeNull();
	});

	it("rejects extension and MIME spoofing and files larger than 10 MB", async () => {
		const spoofedFile = new File(["plain text"], "recursos.xlsx", { type: "text/plain" });
		const oversizedFile = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "recursos.xlsx", {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		await expect(validateExcelFile(spoofedFile)).resolves.toBe("invalid-format");
		await expect(validateExcelFile(oversizedFile)).resolves.toBe("too-large");
	});

	it("rejects text masquerading as an XLSX workbook", async () => {
		render(<ExcelUploadCard />);
		const fakeWorkbook = new File(["plain text"], "recursos.xlsx", {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		fireEvent.change(screen.getByLabelText("Seleccionar Excel"), {
			target: { files: [fakeWorkbook] },
		});

		await waitFor(() =>
			expect(mocks.toastError).toHaveBeenCalledWith(
				"Formato no soportado. Sube un archivo .xlsx o .xls",
			),
		);
		expect(screen.queryByText("recursos.xlsx")).toBeNull();
	});

	it("accepts a valid XLSX signature and exposes the continuation action", async () => {
		render(<ExcelUploadCard />);
		const workbook = new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], "recursos.xlsx", {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		fireEvent.change(screen.getByLabelText("Seleccionar Excel"), {
			target: { files: [workbook] },
		});

		await waitFor(() =>
			expect(mocks.toastSuccess).toHaveBeenCalledWith("Archivo Excel validado"),
		);
		expect(screen.getByText("recursos.xlsx")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Continuar carga" })).toBeTruthy();
	});
});
