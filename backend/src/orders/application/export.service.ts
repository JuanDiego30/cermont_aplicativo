import { OrderListQuerySchema } from "@cermont/shared-types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { OrderResponse } from "../domain/helpers";
import { listOrders } from "./crud.service";

function csvCell(value: unknown): string {
	const text = value === null || value === undefined ? "" : String(value);
	return `"${text.replaceAll('"', '""')}"`;
}

function ordersToCsv(orders: OrderResponse[]): string {
	const headers = [
		"code",
		"type",
		"status",
		"priority",
		"assetName",
		"location",
		"assignedToName",
		"createdAt",
		"dueDate",
	];
	const rows = orders.map((order) =>
		[
			order.code,
			order.type,
			order.status,
			order.priority,
			order.assetName,
			order.location,
			order.assignedToName,
			order.createdAt,
			order.dueDate,
		]
			.map(csvCell)
			.join(","),
	);

	return [headers.join(","), ...rows].join("\n");
}

export async function exportOrdersCsv(rawQuery: unknown): Promise<string> {
	const query = OrderListQuerySchema.parse(rawQuery);
	const result = await listOrders(1, query.limit, query);
	return ordersToCsv(result.orders);
}

export async function exportOrdersPdf(rawQuery: unknown): Promise<Buffer> {
	const query = OrderListQuerySchema.parse(rawQuery);
	const result = await listOrders(1, query.limit, query);
	const pdf = await PDFDocument.create();
	const page = pdf.addPage([842, 595]);
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const margin = 36;
	let y = 548;

	page.drawText("Ordenes de Trabajo", {
		x: margin,
		y,
		size: 18,
		font: boldFont,
		color: rgb(0.06, 0.16, 0.32),
	});
	y -= 28;

	const headers = ["Codigo", "Tipo", "Estado", "Prioridad", "Activo", "Tecnico"];
	const widths = [92, 96, 110, 80, 220, 160];
	let x = margin;
	for (const [index, header] of headers.entries()) {
		page.drawText(header, { x, y, size: 9, font: boldFont, color: rgb(0.2, 0.25, 0.32) });
		x += widths[index] ?? 90;
	}
	y -= 14;

	for (const order of result.orders.slice(0, 40)) {
		if (y < 36) {
			break;
		}
		x = margin;
		const values = [
			order.code,
			order.type,
			order.status,
			order.priority,
			order.assetName,
			order.assignedToName ?? "Sin asignar",
		];
		for (const [index, value] of values.entries()) {
			page.drawText(String(value).slice(0, 32), {
				x,
				y,
				size: 8,
				font,
				color: rgb(0.1, 0.12, 0.16),
			});
			x += widths[index] ?? 90;
		}
		y -= 13;
	}

	const bytes = await pdf.save();
	return Buffer.from(bytes);
}
