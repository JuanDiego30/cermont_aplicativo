/**
 * PDF Generator Service — Document Production Layer
 */

import {
	type ChecklistDocument,
	type CostDocument,
	EVIDENCE_TYPE_LABELS_ES,
	type EvidenceDocument,
	ORDER_PRIORITY_LABELS_ES,
	ORDER_STATUS_LABELS_ES,
	ORDER_TYPE_LABELS_ES,
	type OrderDocument,
} from "@cermont/shared-types";
import type { Types } from "mongoose";
import { type Color, PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import { AppError } from "../../_shared/common/errors";
import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { getReportTemplateSettings } from "../../reports/application/settings.service";

const log = createLogger("pdf-generator");

// ── PDF CONSTANTS ──────────────────────────────────────────

const PAGE_WIDTH = 595.28; // A4 Width
const PAGE_HEIGHT = 841.89; // A4 Height
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_WIDTH = (CONTENT_WIDTH - 10) / 2;
const CARD_HEIGHT = 50;
const CARD_GAP = 10;

const COLORS = {
	navy: rgb(0.05, 0.1, 0.2),
	blue: rgb(0.1, 0.4, 0.9),
	blueSoft: rgb(0.94, 0.96, 1),
	green: rgb(0.1, 0.6, 0.3),
	greenSoft: rgb(0.92, 0.98, 0.95),
	amber: rgb(0.8, 0.5, 0),
	amberSoft: rgb(1, 0.98, 0.9),
	red: rgb(0.8, 0.1, 0.1),
	redSoft: rgb(1, 0.95, 0.95),
	slate: rgb(0.4, 0.5, 0.6),
	slateSoft: rgb(0.97, 0.98, 0.99),
	white: rgb(1, 1, 1),
	text: rgb(0.1, 0.1, 0.1),
	muted: rgb(0.5, 0.5, 0.5),
	border: rgb(0.9, 0.9, 0.9),
} as const;

type SummaryTone = "blue" | "green" | "amber" | "red" | "slate";

interface SummaryCard {
	label: string;
	value: string;
	tone?: SummaryTone;
}

interface PdfSettings {
	companyName?: string;
	primaryColor?: string;
}

interface PdfDrawOptions {
	labelWidth?: number;
	fontSize?: number;
}

interface PdfParagraphOptions {
	fontSize?: number;
	lineHeight?: number;
	align?: "left" | "center" | "right";
	color?: Color;
}

interface PdfLayout {
	pdfDoc: PDFDocument;
	page: PDFPage;
	pages: PDFPage[];
	font: PDFFont;
	boldFont: PDFFont;
	cursorY: number;
}

type PdfType = "technical" | "delivery";

interface GeneratePdfOptions {
	orderId: string;
	type: PdfType;
}

type PersonRef = string | { name?: string; email?: string; role?: string } | null;

interface OrderPdfRecord extends Omit<OrderDocument<Types.ObjectId>, "assetId" | "assetName"> {
	assetName: string;
	assetId: string;
	location: string;
	assignedToName?: string;
	supervisedByName?: string;
}

const SUMMARY_TONES: Record<SummaryTone, { background: Color; accent: Color }> = {
	blue: { background: COLORS.blueSoft, accent: COLORS.blue },
	green: { background: COLORS.greenSoft, accent: COLORS.green },
	amber: { background: COLORS.amberSoft, accent: COLORS.amber },
	red: { background: COLORS.redSoft, accent: COLORS.red },
	slate: { background: COLORS.slateSoft, accent: COLORS.slate },
} as const;

// ── UTILITIES ──────────────────────────────────────────────

function _getPersonLabel(value: PersonRef, fallback: string): string {
	if (!value) {
		return fallback;
	}
	if (typeof value === "string") {
		return value.trim() || fallback;
	}
	if (typeof value === "object") {
		if ("name" in value && typeof value.name === "string" && value.name.trim()) {
			return value.name.trim();
		}
	}
	return fallback;
}

function getStatusTone(status: string): SummaryTone {
	switch (status) {
		case "completed":
		case "closed":
		case "paid":
			return "green";
		case "on_hold":
		case "planning":
			return "amber";
		case "cancelled":
			return "red";
		default:
			return "blue";
	}
}

function formatDateTime(date?: Date | string): string {
	if (!date) {
		return "N/A";
	}
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("es-CO", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(amount);
}

function hexToRgbColor(hex: string): Color {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	return rgb(r, g, b);
}

// ── TEXT WRAPPING ──────────────────────────────────────────

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
	const words = String(text ?? "").split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		const width = font.widthOfTextAtSize(testLine, size);

		if (width <= maxWidth) {
			currentLine = testLine;
		} else {
			if (currentLine) {
				lines.push(currentLine);
			}
			currentLine = word;
		}
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
	for (const char of safeText) {
		if (font.widthOfTextAtSize(output + char, size) > targetWidth) {
			break;
		}
		output += char;
	}
	return output + suffix;
}

// ── DRAWING HELPERS ────────────────────────────────────────

function ensureSpace(layout: PdfLayout, requiredHeight: number): void {
	if (layout.cursorY - requiredHeight >= MARGIN) {
		return;
	}
	layout.page = layout.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	layout.pages.push(layout.page);
	layout.cursorY = PAGE_HEIGHT - MARGIN;
}

async function drawHeader(
	layout: PdfLayout,
	orderCode: string,
	title: string,
	subtitle: string,
	settings: PdfSettings,
): Promise<void> {
	const { page, boldFont, font } = layout;
	const primaryColor = settings.primaryColor ? hexToRgbColor(settings.primaryColor) : COLORS.navy;

	page.drawRectangle({
		x: 0,
		y: PAGE_HEIGHT - 122,
		width: PAGE_WIDTH,
		height: 122,
		color: primaryColor,
	});
	page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 122, width: 12, height: 122, color: COLORS.blue });

	page.drawText(settings.companyName || "CERMONT S.A.S.", {
		x: MARGIN,
		y: PAGE_HEIGHT - 40,
		size: 18,
		font: boldFont,
		color: COLORS.white,
	});
	page.drawText(title, {
		x: MARGIN,
		y: PAGE_HEIGHT - 64,
		size: 14,
		font: boldFont,
		color: COLORS.white,
	});
	page.drawText(subtitle, {
		x: MARGIN,
		y: PAGE_HEIGHT - 84,
		size: 9.5,
		font,
		color: COLORS.blueSoft,
	});
	page.drawText(orderCode, {
		x: PAGE_WIDTH - MARGIN - 120,
		y: PAGE_HEIGHT - 40,
		size: 11,
		font: boldFont,
		color: COLORS.white,
	});
	page.drawText(`Generado ${formatDateTime(new Date())}`, {
		x: PAGE_WIDTH - MARGIN - 160,
		y: PAGE_HEIGHT - 60,
		size: 8.5,
		font,
		color: COLORS.blueSoft,
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

function drawStatGrid(layout: PdfLayout, items: SummaryCard[]): void {
	for (let i = 0; i < items.length; i += 2) {
		ensureSpace(layout, CARD_HEIGHT + 10);
		const rowY = layout.cursorY - CARD_HEIGHT;
		drawStatCard(layout.page, layout.boldFont, items[i], MARGIN, rowY, CARD_WIDTH, CARD_HEIGHT);
		if (items[i + 1]) {
			drawStatCard(
				layout.page,
				layout.boldFont,
				items[i + 1],
				MARGIN + CARD_WIDTH + CARD_GAP,
				rowY,
				CARD_WIDTH,
				CARD_HEIGHT,
			);
		}
		layout.cursorY = rowY - 10;
	}
}

function drawStatCard(
	page: PDFPage,
	font: PDFFont,
	item: SummaryCard,
	x: number,
	y: number,
	width: number,
	height: number,
): void {
	const tone = SUMMARY_TONES[item.tone ?? "slate"];
	page.drawRectangle({
		x,
		y,
		width,
		height,
		color: tone.background,
		borderColor: COLORS.border,
		borderWidth: 1,
	});
	page.drawRectangle({ x, y: y + height - 5, width, height: 5, color: tone.accent });
	page.drawText(item.label.toUpperCase(), {
		x: x + 12,
		y: y + height - 19,
		size: 8,
		font,
		color: COLORS.muted,
	});
	page.drawText(truncateText(font, item.value, 12, width - 24), {
		x: x + 12,
		y: y + 14,
		size: 12,
		font,
		color: COLORS.text,
	});
}

function drawLabelValue(layout: PdfLayout, label: string, value: string, opts: PdfDrawOptions = {}): void {
	const labelWidth = opts.labelWidth ?? 145;
	const fontSize = opts.fontSize ?? 10.2;
	const valueLines = wrapText(layout.font, value, fontSize, CONTENT_WIDTH - labelWidth - 8);
	const h = Math.max(18, valueLines.length * 13 + 2);
	ensureSpace(layout, h + 4);
	layout.page.drawText(truncateText(layout.boldFont, label, fontSize, labelWidth - 4), {
		x: MARGIN,
		y: layout.cursorY,
		size: fontSize,
		font: layout.boldFont,
		color: COLORS.navy,
	});
	valueLines.forEach((line, idx) => {
		layout.page.drawText(line, {
			x: MARGIN + labelWidth,
			y: layout.cursorY - idx * 13,
			size: fontSize,
			font: layout.font,
			color: COLORS.text,
		});
	});
	layout.cursorY -= h;
}

function drawParagraph(layout: PdfLayout, text: string, opts: PdfParagraphOptions = {}): void {
	const fontSize = opts.fontSize ?? 10.5;
	const lines = wrapText(layout.font, text, fontSize, CONTENT_WIDTH);
	const totalH = lines.length * (fontSize + 4);
	ensureSpace(layout, totalH + 2);
	lines.forEach((line) => {
		if (!line) {
			layout.cursorY -= (fontSize + 4) * 0.5;
			return;
		}
		layout.page.drawText(line, {
			x: MARGIN,
			y: layout.cursorY,
			size: fontSize,
			font: layout.font,
			color: opts.color ?? COLORS.text,
		});
		layout.cursorY -= fontSize + 4;
	});
	layout.cursorY -= 4;
}

// ── MAIN EXPORT ────────────────────────────────────────────

export async function generateOrderPdf(options: GeneratePdfOptions): Promise<Buffer> {
	const { orderId, type } = options;
	log.info("Generating PDF", { orderId, type });

	const [orderResult, costs, evidences, checklists, settings] = await Promise.all([
		container.orderRepository.findByIdPopulated(orderId),
		container.costRepository.findLean({ orderId }, { createdAt: -1 }),
		container.evidenceRepository.findLean({ orderId, deletedAt: null }, { createdAt: -1 }),
		container.checklistRepository.findLean({ orderId }, { createdAt: -1 }),
		getReportTemplateSettings(),
	]);

	const order = orderResult as unknown as OrderPdfRecord | null;
	if (!order) {
		throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
	}

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

	const title = type === "delivery" ? "ACTA DE ENTREGA" : settings.headerText || "INFORME TÉCNICO";
	const subtitle =
		type === "delivery"
			? "Conformidad de entrega y cierre administrativo"
			: "Evidencia de campo y seguimiento operativo";

	await drawHeader(layout, order.code || orderId, title, subtitle, settings);

	// Sections
	drawOperationalSummarySection(layout, order, evidences);
	drawOperationalDataSection(layout, order);
	drawCostsSection(layout, costs);
	drawEvidenceSection(layout, evidences);
	await drawChecklistSection(layout, checklists);
	drawObservationsAndFooterSection(layout, order, type);

	drawPageNumbersAndFooters(
		layout,
		order.code || orderId,
		title,
		formatDateTime(new Date()),
		settings,
	);

	const pdfBytes = await pdfDoc.save();
	return Buffer.from(pdfBytes);
}

function drawOperationalSummarySection(
	layout: PdfLayout,
	order: OrderPdfRecord,
	evidences: EvidenceDocument[],
): void {
	drawSectionHeading(layout, "Resumen operativo");
	drawStatGrid(layout, [
		{ label: "Orden", value: order.code || "N/A", tone: "blue" },
		{
			label: "Estado",
			value:
				ORDER_STATUS_LABELS_ES[order.status as keyof typeof ORDER_STATUS_LABELS_ES] ?? order.status,
			tone: getStatusTone(order.status),
		},
		{
			label: "Prioridad",
			value:
				ORDER_PRIORITY_LABELS_ES[order.priority as keyof typeof ORDER_PRIORITY_LABELS_ES] ??
				order.priority,
			tone: "blue",
		},
		{
			label: "Tipo",
			value: ORDER_TYPE_LABELS_ES[order.type as keyof typeof ORDER_TYPE_LABELS_ES] ?? order.type,
			tone: "slate",
		},
		{ label: "Asignado", value: order.assignedToName || "Sin asignar", tone: "green" },
		{ label: "Evidencias", value: String(evidences.length), tone: "blue" },
	]);
}

function drawOperationalDataSection(layout: PdfLayout, order: OrderPdfRecord): void {
	drawSectionHeading(layout, "Datos de campo");
	drawLabelValue(layout, "Activo", `${order.assetName || "N/A"} (${order.assetId || "N/A"})`);
	drawLabelValue(layout, "Ubicación", order.location || "N/A");
	drawLabelValue(layout, "Descripción", order.description || "N/A");
	drawLabelValue(layout, "Inicio Real", formatDateTime(order.startedAt));
	drawLabelValue(layout, "Fin Real", formatDateTime(order.completedAt));
}

function drawCostsSection(layout: PdfLayout, costs: CostDocument[]): void {
	if (costs.length === 0) {
		return;
	}
	drawSectionHeading(layout, "Control de Costos");
	const total = costs.reduce((sum, c) => sum + (c.actualAmount || 0), 0);
	drawLabelValue(layout, "Total Real Ejecutado", formatCurrency(total));
	costs.slice(0, 5).forEach((c) => {
		drawLabelValue(layout, c.description, formatCurrency(c.actualAmount || 0), { fontSize: 9 });
	});
}

function drawEvidenceSection(layout: PdfLayout, evidences: EvidenceDocument[]): void {
	if (evidences.length === 0) {
		return;
	}
	drawSectionHeading(layout, "Registro Fotográfico");
	drawLabelValue(layout, "Total Fotos", String(evidences.length));
	evidences.slice(0, 5).forEach((e) => {
		drawLabelValue(
			layout,
			e.filename,
			`${EVIDENCE_TYPE_LABELS_ES[e.type as keyof typeof EVIDENCE_TYPE_LABELS_ES] ?? e.type} · ${formatDateTime(e.capturedAt)}`,
			{ fontSize: 9 },
		);
	});
}

async function drawChecklistSection(
	layout: PdfLayout,
	checklists: ChecklistDocument[],
): Promise<void> {
	if (checklists.length === 0) {
		return;
	}
	drawSectionHeading(layout, "Conformidad y Checklists");
	for (const cl of checklists.slice(0, 2)) {
		drawLabelValue(layout, cl.templateName || "Checklist", cl.status.toUpperCase());
		for (const item of cl.items.slice(0, 5)) {
			drawLabelValue(layout, item.description, item.completed ? "CUMPLIDO" : "PENDIENTE", {
				labelWidth: 180,
				fontSize: 9,
			});
		}
	}
}

function drawObservationsAndFooterSection(
	layout: PdfLayout,
	order: OrderPdfRecord,
	type: string,
): void {
	drawSectionHeading(layout, "Observaciones y Firmas");
	drawParagraph(layout, order.observations || "Sin observaciones adicionales.");
	if (type === "delivery") {
		drawParagraph(
			layout,
			"El presente documento certifica la entrega formal de los servicios contratados y la conformidad del cliente.",
			{ fontSize: 9, color: COLORS.muted },
		);
		ensureSpace(layout, 100);
		const y = layout.cursorY - 60;
		layout.page.drawLine({
			start: { x: MARGIN, y },
			end: { x: MARGIN + 180, y },
			thickness: 1,
			color: COLORS.text,
		});
		layout.page.drawLine({
			start: { x: PAGE_WIDTH - MARGIN - 180, y },
			end: { x: PAGE_WIDTH - MARGIN, y },
			thickness: 1,
			color: COLORS.text,
		});
		layout.page.drawText("Firma Responsable CERMONT", {
			x: MARGIN,
			y: y - 15,
			size: 8,
			font: layout.font,
		});
		layout.page.drawText("Firma Recibido Cliente", {
			x: PAGE_WIDTH - MARGIN - 180,
			y: y - 15,
			size: 8,
			font: layout.font,
		});
	}
}

function drawPageNumbersAndFooters(
	layout: PdfLayout,
	orderCode: string,
	title: string,
	genAt: string,
	settings: PdfSettings,
): void {
	layout.pages.forEach((page, idx) => {
		const footer = `${settings.companyName || "CERMONT S.A.S."} | ${orderCode} | ${title} | ${genAt}`;
		page.drawLine({
			start: { x: MARGIN, y: 30 },
			end: { x: PAGE_WIDTH - MARGIN, y: 30 },
			thickness: 0.5,
			color: COLORS.border,
		});
		page.drawText(footer, { x: MARGIN, y: 18, size: 7, font: layout.font, color: COLORS.muted });
		page.drawText(`Página ${idx + 1} de ${layout.pages.length}`, {
			x: PAGE_WIDTH - MARGIN - 50,
			y: 18,
			size: 7,
			font: layout.font,
			color: COLORS.muted,
		});
	});
}
