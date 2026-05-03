import type { OrderDocument, ProposalDocument, ProposalStatus } from "@cermont/shared-types";
import type { Types } from "mongoose";
import { type Color, PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { getReportTemplateSettings } from "../../reports/application/settings.service";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_GAP = 10;
const CARD_WIDTH = (CONTENT_WIDTH - CARD_GAP) / 2;
const CARD_HEIGHT = 58;
const TABLE_ROW_HEIGHT = 24;

const COLORS = {
	navy: rgb(0.05, 0.1, 0.2),
	blue: rgb(0.1, 0.4, 0.9),
	green: rgb(0.1, 0.6, 0.3),
	amber: rgb(0.8, 0.5, 0),
	red: rgb(0.8, 0.1, 0.1),
	slate: rgb(0.4, 0.5, 0.6),
	white: rgb(1, 1, 1),
	text: rgb(0.1, 0.1, 0.1),
	muted: rgb(0.5, 0.5, 0.5),
	border: rgb(0.9, 0.9, 0.9),
	softBlue: rgb(0.94, 0.96, 1),
	softGreen: rgb(0.92, 0.98, 0.95),
	softAmber: rgb(1, 0.98, 0.9),
	softRed: rgb(1, 0.95, 0.95),
	softSlate: rgb(0.97, 0.98, 0.99),
} as const;

type SummaryTone = "blue" | "green" | "amber" | "red" | "slate";

interface PdfLayout {
	pdfDoc: PDFDocument;
	page: PDFPage;
	pages: PDFPage[];
	font: PDFFont;
	boldFont: PDFFont;
	cursorY: number;
}

interface ProposalPdfContext {
	proposal: ProposalDocument;
	linkedOrder?: OrderDocument<Types.ObjectId>;
	settings: Awaited<ReturnType<typeof getReportTemplateSettings>>;
}

interface SummaryCard {
	label: string;
	value: string;
	tone: SummaryTone;
}

const SUMMARY_TONES: Record<SummaryTone, { background: Color; accent: Color }> = {
	blue: { background: COLORS.softBlue, accent: COLORS.blue },
	green: { background: COLORS.softGreen, accent: COLORS.green },
	amber: { background: COLORS.softAmber, accent: COLORS.amber },
	red: { background: COLORS.softRed, accent: COLORS.red },
	slate: { background: COLORS.softSlate, accent: COLORS.slate },
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatDate(value?: Date | string): string {
	if (!value) {
		return "N/D";
	}

	const date = value instanceof Date ? value : new Date(value);
	return date.toLocaleDateString("es-CO", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function formatDateTime(value?: Date | string): string {
	if (!value) {
		return "N/D";
	}

	const date = value instanceof Date ? value : new Date(value);
	return date.toLocaleDateString("es-CO", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function normalizeText(value?: string): string {
	const text = value?.trim();
	return text && text.length > 0 ? text : "N/D";
}

function getStatusLabel(status: ProposalStatus): string {
	switch (status) {
		case "draft":
			return "Borrador";
		case "sent":
			return "Enviada";
		case "approved":
			return "Aprobada";
		case "rejected":
			return "Rechazada";
		case "expired":
			return "Vencida";
		default:
			return status;
	}
}

function getStatusTone(status: ProposalStatus): SummaryTone {
	switch (status) {
		case "approved":
			return "green";
		case "sent":
			return "blue";
		case "rejected":
		case "expired":
			return "red";
		default:
			return "slate";
	}
}

function startNewPage(layout: PdfLayout): void {
	layout.page = layout.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	layout.pages.push(layout.page);
	layout.cursorY = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(layout: PdfLayout, requiredHeight: number): void {
	if (layout.cursorY - requiredHeight >= MARGIN) {
		return;
	}

	startNewPage(layout);
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
	const words = String(text ?? "").split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const nextLine = currentLine ? `${currentLine} ${word}` : word;
		if (font.widthOfTextAtSize(nextLine, size) <= maxWidth) {
			currentLine = nextLine;
			continue;
		}

		if (currentLine) {
			lines.push(currentLine);
		}
		currentLine = word;
	}

	if (currentLine) {
		lines.push(currentLine);
	}

	return lines;
}

function truncateText(font: PDFFont, text: string, size: number, maxWidth: number): string {
	const safeText = String(text ?? "");
	if (font.widthOfTextAtSize(safeText, size) <= maxWidth) {
		return safeText;
	}

	const suffix = "...";
	const targetWidth = maxWidth - font.widthOfTextAtSize(suffix, size);
	let output = "";

	for (const character of safeText) {
		if (font.widthOfTextAtSize(`${output}${character}`, size) > targetWidth) {
			break;
		}
		output += character;
	}

	return `${output}${suffix}`;
}

function hexToRgb(hex: string): Color {
	const normalized = hex.replace("#", "");
	const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
	const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
	const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;
	return rgb(red, green, blue);
}

function drawTextCell(
	page: PDFPage,
	font: PDFFont,
	text: string,
	size: number,
	x: number,
	y: number,
	width: number,
	color: Color,
	align: "left" | "right" = "left",
): void {
	const content = truncateText(font, text, size, width);
	const textWidth = font.widthOfTextAtSize(content, size);
	const drawX = align === "right" ? x + Math.max(width - textWidth, 0) : x;
	page.drawText(content, { x: drawX, y, size, font, color });
}

function drawHeader(
	layout: PdfLayout,
	proposal: ProposalDocument,
	linkedOrder: OrderDocument<Types.ObjectId> | undefined,
	settings: Awaited<ReturnType<typeof getReportTemplateSettings>>,
): void {
	const subtitle = linkedOrder ? `${proposal.title} · OT ${linkedOrder.code}` : proposal.title;

	layout.page.drawRectangle({
		x: 0,
		y: PAGE_HEIGHT - 122,
		width: PAGE_WIDTH,
		height: 122,
		color: settings.primaryColor ? hexToRgb(settings.primaryColor) : COLORS.navy,
	});
	layout.page.drawRectangle({
		x: 0,
		y: PAGE_HEIGHT - 122,
		width: 12,
		height: 122,
		color: COLORS.blue,
	});
	layout.page.drawText(settings.companyName || "CERMONT S.A.S.", {
		x: MARGIN,
		y: PAGE_HEIGHT - 40,
		size: 18,
		font: layout.boldFont,
		color: COLORS.white,
	});
	layout.page.drawText("PROPUESTA ECONÓMICA", {
		x: MARGIN,
		y: PAGE_HEIGHT - 64,
		size: 14,
		font: layout.boldFont,
		color: COLORS.white,
	});
	layout.page.drawText(subtitle, {
		x: MARGIN,
		y: PAGE_HEIGHT - 84,
		size: 9.5,
		font: layout.font,
		color: COLORS.softBlue,
	});
	layout.page.drawText(proposal.code, {
		x: PAGE_WIDTH - MARGIN - 120,
		y: PAGE_HEIGHT - 40,
		size: 11,
		font: layout.boldFont,
		color: COLORS.white,
	});
	layout.page.drawText(`Generado ${formatDateTime(new Date())}`, {
		x: PAGE_WIDTH - MARGIN - 160,
		y: PAGE_HEIGHT - 60,
		size: 8.5,
		font: layout.font,
		color: COLORS.softBlue,
	});

	layout.cursorY = PAGE_HEIGHT - 142;
}

function drawSectionHeading(layout: PdfLayout, title: string, subtitle?: string): void {
	const headingHeight = subtitle ? 42 : 30;
	ensureSpace(layout, headingHeight + 18);
	layout.page.drawText(title, {
		x: MARGIN,
		y: layout.cursorY,
		size: 14,
		font: layout.boldFont,
		color: COLORS.navy,
	});
	layout.cursorY -= 16;

	if (subtitle) {
		layout.page.drawText(subtitle, {
			x: MARGIN,
			y: layout.cursorY,
			size: 9.5,
			font: layout.font,
			color: COLORS.muted,
		});
		layout.cursorY -= 14;
	}

	layout.page.drawLine({
		start: { x: MARGIN, y: layout.cursorY },
		end: { x: PAGE_WIDTH - MARGIN, y: layout.cursorY },
		thickness: 1,
		color: COLORS.border,
	});
	layout.cursorY -= 14;
}

function drawSummaryCard(
	page: PDFPage,
	font: PDFFont,
	item: SummaryCard,
	x: number,
	y: number,
): void {
	const tone = SUMMARY_TONES[item.tone];
	page.drawRectangle({
		x,
		y,
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		color: tone.background,
		borderColor: COLORS.border,
		borderWidth: 1,
	});
	page.drawRectangle({
		x,
		y: y + CARD_HEIGHT - 5,
		width: CARD_WIDTH,
		height: 5,
		color: tone.accent,
	});
	page.drawText(item.label.toUpperCase(), {
		x: x + 12,
		y: y + CARD_HEIGHT - 19,
		size: 8,
		font,
		color: COLORS.muted,
	});
	page.drawText(truncateText(font, item.value, 12, CARD_WIDTH - 24), {
		x: x + 12,
		y: y + 14,
		size: 12,
		font,
		color: COLORS.text,
	});
}

function drawSummaryGrid(layout: PdfLayout, items: SummaryCard[]): void {
	for (let index = 0; index < items.length; index += 2) {
		ensureSpace(layout, CARD_HEIGHT + 10);
		const rowBottom = layout.cursorY - CARD_HEIGHT;
		drawSummaryCard(layout.page, layout.boldFont, items[index], MARGIN, rowBottom);
		if (items[index + 1]) {
			drawSummaryCard(
				layout.page,
				layout.boldFont,
				items[index + 1],
				MARGIN + CARD_WIDTH + CARD_GAP,
				rowBottom,
			);
		}
		layout.cursorY = rowBottom - 10;
	}
}

function drawLabelValue(
	layout: PdfLayout,
	label: string,
	value: string,
	labelWidth = 145,
	fontSize = 10.2,
): void {
	const valueLines = wrapText(layout.font, value, fontSize, CONTENT_WIDTH - labelWidth - 8);
	const blockHeight = Math.max(18, valueLines.length * 13 + 2);
	ensureSpace(layout, blockHeight + 4);
	layout.page.drawText(truncateText(layout.boldFont, label, fontSize, labelWidth - 4), {
		x: MARGIN,
		y: layout.cursorY,
		size: fontSize,
		font: layout.boldFont,
		color: COLORS.navy,
	});

	for (const [index, line] of valueLines.entries()) {
		layout.page.drawText(line, {
			x: MARGIN + labelWidth,
			y: layout.cursorY - index * 13,
			size: fontSize,
			font: layout.font,
			color: COLORS.text,
		});
	}

	layout.cursorY -= blockHeight;
}

function drawParagraph(layout: PdfLayout, text: string, fontSize = 10.5): void {
	const lines = wrapText(layout.font, text, fontSize, CONTENT_WIDTH);
	const totalHeight = lines.length * (fontSize + 4);
	ensureSpace(layout, totalHeight + 2);

	for (const line of lines) {
		if (!line) {
			layout.cursorY -= (fontSize + 4) * 0.5;
			continue;
		}

		layout.page.drawText(line, {
			x: MARGIN,
			y: layout.cursorY,
			size: fontSize,
			font: layout.font,
			color: COLORS.text,
		});
		layout.cursorY -= fontSize + 4;
	}

	layout.cursorY -= 4;
}

function drawItemsTable(layout: PdfLayout, proposal: ProposalDocument): void {
	const columns = {
		description: 220,
		quantity: 55,
		unit: 55,
		unitCost: 95,
		total: 90,
	} as const;

	drawSectionHeading(
		layout,
		"Ítems de la propuesta",
		"Detalle de servicios y materiales cotizados",
	);
	drawItemsTableHeader(layout, columns);

	for (const item of proposal.items) {
		if (layout.cursorY - TABLE_ROW_HEIGHT < MARGIN + 20) {
			startNewPage(layout);
			drawItemsTableHeader(layout, columns);
		}

		drawItemsTableRow(
			layout,
			item.description,
			String(item.quantity),
			item.unit,
			formatCurrency(item.unitCost),
			formatCurrency(item.total),
			columns,
		);
	}
}

function drawItemsTableHeader(
	layout: PdfLayout,
	columns: { description: number; quantity: number; unit: number; unitCost: number; total: number },
): void {
	ensureSpace(layout, TABLE_ROW_HEIGHT + 6);
	const rowTop = layout.cursorY;
	const rowBottom = rowTop - TABLE_ROW_HEIGHT;
	const textSize = 8.4;

	layout.page.drawRectangle({
		x: MARGIN,
		y: rowBottom,
		width: CONTENT_WIDTH,
		height: TABLE_ROW_HEIGHT,
		color: COLORS.softSlate,
		borderColor: COLORS.border,
		borderWidth: 1,
	});
	drawTableHeaderText(
		layout,
		"Descripción",
		MARGIN + 8,
		rowBottom + 7,
		columns.description - 16,
		textSize,
		"left",
	);
	drawTableHeaderText(
		layout,
		"Cantidad",
		MARGIN + columns.description + 8,
		rowBottom + 7,
		columns.quantity - 16,
		textSize,
		"right",
	);
	drawTableHeaderText(
		layout,
		"Unidad",
		MARGIN + columns.description + columns.quantity + 8,
		rowBottom + 7,
		columns.unit - 16,
		textSize,
		"left",
	);
	drawTableHeaderText(
		layout,
		"Valor unitario",
		MARGIN + columns.description + columns.quantity + columns.unit + 8,
		rowBottom + 7,
		columns.unitCost - 16,
		textSize,
		"right",
	);
	drawTableHeaderText(
		layout,
		"Subtotal",
		MARGIN + columns.description + columns.quantity + columns.unit + columns.unitCost + 8,
		rowBottom + 7,
		columns.total - 16,
		textSize,
		"right",
	);
	layout.cursorY = rowBottom - 4;
}

function drawTableHeaderText(
	layout: PdfLayout,
	text: string,
	x: number,
	y: number,
	width: number,
	size: number,
	align: "left" | "right",
): void {
	drawTextCell(layout.page, layout.boldFont, text, size, x, y, width, COLORS.navy, align);
}

function drawItemsTableRow(
	layout: PdfLayout,
	description: string,
	quantity: string,
	unit: string,
	unitCost: string,
	total: string,
	columns: { description: number; quantity: number; unit: number; unitCost: number; total: number },
): void {
	const rowTop = layout.cursorY;
	const rowBottom = rowTop - TABLE_ROW_HEIGHT;
	layout.page.drawRectangle({
		x: MARGIN,
		y: rowBottom,
		width: CONTENT_WIDTH,
		height: TABLE_ROW_HEIGHT,
		borderColor: COLORS.border,
		borderWidth: 1,
	});
	drawTextCell(
		layout.page,
		layout.font,
		description,
		8.7,
		MARGIN + 8,
		rowBottom + 7,
		columns.description - 16,
		COLORS.text,
	);
	drawTextCell(
		layout.page,
		layout.font,
		quantity,
		8.7,
		MARGIN + columns.description + 8,
		rowBottom + 7,
		columns.quantity - 16,
		COLORS.text,
		"right",
	);
	drawTextCell(
		layout.page,
		layout.font,
		unit,
		8.7,
		MARGIN + columns.description + columns.quantity + 8,
		rowBottom + 7,
		columns.unit - 16,
		COLORS.text,
	);
	drawTextCell(
		layout.page,
		layout.font,
		unitCost,
		8.7,
		MARGIN + columns.description + columns.quantity + columns.unit + 8,
		rowBottom + 7,
		columns.unitCost - 16,
		COLORS.text,
		"right",
	);
	drawTextCell(
		layout.page,
		layout.font,
		total,
		8.7,
		MARGIN + columns.description + columns.quantity + columns.unit + columns.unitCost + 8,
		rowBottom + 7,
		columns.total - 16,
		COLORS.text,
		"right",
	);
	layout.cursorY = rowBottom - 4;
}

function drawRequestSection(
	layout: PdfLayout,
	proposal: ProposalDocument,
	linkedOrder: OrderDocument<Types.ObjectId> | undefined,
): void {
	drawSectionHeading(
		layout,
		"Datos de la solicitud",
		"Información base usada para elaborar la propuesta",
	);
	drawLabelValue(
		layout,
		"Cliente",
		normalizeText(linkedOrder?.commercial?.clientName ?? proposal.clientName),
	);
	drawLabelValue(layout, "OT vinculada", linkedOrder?.code ?? "Sin orden vinculada");
	drawLabelValue(layout, "Activo", linkedOrder?.assetName ?? proposal.title);
	drawLabelValue(layout, "Ubicación", linkedOrder?.location ?? "N/D");
	drawLabelValue(layout, "Tipo de trabajo", linkedOrder?.type ?? "N/D");
	drawLabelValue(
		layout,
		"Descripción",
		linkedOrder?.description ?? proposal.notes ?? proposal.title,
		145,
		10.0,
	);
}

function drawTotalsSection(layout: PdfLayout, proposal: ProposalDocument): void {
	drawSectionHeading(layout, "Resumen económico");
	drawSummaryGrid(layout, [
		{ label: "Código", value: proposal.code, tone: "blue" },
		{ label: "Cliente", value: proposal.clientName, tone: "slate" },
		{
			label: "Estado",
			value: getStatusLabel(proposal.status),
			tone: getStatusTone(proposal.status),
		},
		{ label: "Vigencia", value: formatDate(proposal.validUntil), tone: "amber" },
		{ label: "Subtotal", value: formatCurrency(proposal.subtotal), tone: "blue" },
		{ label: "Total", value: formatCurrency(proposal.total), tone: "green" },
	]);
}

function drawApprovalSection(
	layout: PdfLayout,
	proposal: ProposalDocument,
	linkedOrder: OrderDocument<Types.ObjectId> | undefined,
): void {
	drawSectionHeading(layout, "Aprobación y trazabilidad");
	drawLabelValue(layout, "Estado de aprobación", getStatusLabel(proposal.status));
	drawLabelValue(
		layout,
		"Número de PO",
		proposal.poNumber ?? linkedOrder?.commercial?.poNumber ?? "Pendiente",
	);
	drawLabelValue(layout, "Fecha de aprobación", formatDateTime(proposal.approvedAt));
	drawLabelValue(layout, "Última actualización", formatDateTime(proposal.updatedAt));
}

function drawNotesSection(layout: PdfLayout, proposal: ProposalDocument): void {
	if (!proposal.notes) {
		return;
	}

	drawSectionHeading(layout, "Observaciones");
	drawParagraph(layout, proposal.notes);
}

function drawFooters(
	layout: PdfLayout,
	settings: Awaited<ReturnType<typeof getReportTemplateSettings>>,
): void {
	const totalPages = layout.pages.length;

	for (const [index, page] of layout.pages.entries()) {
		page.drawLine({
			start: { x: MARGIN, y: 36 },
			end: { x: PAGE_WIDTH - MARGIN, y: 36 },
			thickness: 1,
			color: COLORS.border,
		});
		page.drawText(settings.footerText || "CERMONT S.A.S.", {
			x: MARGIN,
			y: 20,
			size: 8,
			font: layout.font,
			color: COLORS.muted,
		});
		page.drawText(`Página ${index + 1} de ${totalPages}`, {
			x: PAGE_WIDTH - MARGIN - 92,
			y: 20,
			size: 8,
			font: layout.font,
			color: COLORS.muted,
		});
	}
}

export async function generateProposalPdf(context: ProposalPdfContext): Promise<Buffer> {
	const { proposal, linkedOrder, settings } = context;
	const pdfDoc = await PDFDocument.create();
	const layout: PdfLayout = {
		pdfDoc,
		page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
		pages: [],
		font: await pdfDoc.embedFont(StandardFonts.Helvetica),
		boldFont: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
		cursorY: PAGE_HEIGHT - MARGIN,
	};
	layout.pages.push(layout.page);

	drawHeader(layout, proposal, linkedOrder, settings);
	drawSummaryGrid(layout, [
		{ label: "Código", value: proposal.code, tone: "blue" },
		{ label: "Cliente", value: proposal.clientName, tone: "slate" },
		{
			label: "Estado",
			value: getStatusLabel(proposal.status),
			tone: getStatusTone(proposal.status),
		},
		{ label: "Vigencia", value: formatDate(proposal.validUntil), tone: "amber" },
	]);
	drawRequestSection(layout, proposal, linkedOrder);
	drawItemsTable(layout, proposal);
	drawTotalsSection(layout, proposal);
	drawApprovalSection(layout, proposal, linkedOrder);
	drawNotesSection(layout, proposal);
	drawFooters(layout, settings);

	const pdfBytes = await pdfDoc.save();
	return Buffer.from(pdfBytes);
}
