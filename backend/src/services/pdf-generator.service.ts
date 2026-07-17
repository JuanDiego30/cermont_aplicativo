/**
 * PDF Generator Service for Cermont Backend
 *
 * Generates technical and delivery PDFs for orders using the live data model,
 * including costs, evidences, checklist summaries and execution metadata.
 */

import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import { AppError } from "../common/errors";
import { createLogger } from "../common/utils/logger";
import { Checklist } from "../models/Checklist";
import { Cost } from "../models/Cost";
import { Evidence } from "../models/Evidence";
import { Order } from "../models/Order";
import { Proposal } from "../models/Proposal";

const log = createLogger("pdf-generator");

export type PdfType = "technical" | "delivery";

export interface GeneratePdfOptions {
	orderId: string;
	type: PdfType;
}

type PersonRef =
	| { name?: string; email?: string; role?: string }
	| { toString(): string }
	| string
	| null
	| undefined;

interface OrderPdfRecord {
	_id: { toString(): string };
	code: string;
	type: string;
	status: string;
	priority: string;
	description: string;
	assetId: string;
	assetName: string;
	location: string;
	assignedTo?: PersonRef;
	assignedToName?: string;
	supervisedBy?: PersonRef;
	materials?: Array<{
		name: string;
		quantity: number;
		unit: string;
		unitCost?: number;
		delivered?: boolean;
	}>;
	startedAt?: Date | string | null;
	completedAt?: Date | string | null;
	observations?: string | null;
	invoiceReady?: boolean;
	reportGenerated?: boolean;
	proposalId?: PersonRef;
	createdBy?: PersonRef;
	createdAt: Date | string;
	updatedAt: Date | string;
}

interface CostPdfRecord {
	category: string;
	description: string;
	estimatedAmount: number;
	actualAmount: number;
	taxAmount: number;
	taxRate: number;
	currency: string;
	notes?: string;
	recordedBy?: PersonRef;
	recordedAt?: Date | string;
	createdAt?: Date | string;
}

interface EvidencePdfRecord {
	type: string;
	filename: string;
	url: string;
	description?: string;
	capturedAt: Date | string;
	uploadedAt?: Date | string;
	gpsLocation?: { lat: number; lng: number; capturedAt?: Date | string };
}

interface ChecklistPdfRecord {
	type: string;
	status: string;
	items?: Array<{
		description?: string;
		checked: boolean;
		category?: string;
		observation?: string;
	}>;
	signature?: string | null;
	completedAt?: Date | string | null;
	observations?: string | null;
	createdAt?: Date | string;
}

interface PdfLayout {
	pdfDoc: PDFDocument;
	page: PDFPage;
	pages: PDFPage[];
	font: PDFFont;
	boldFont: PDFFont;
	cursorY: number;
}

interface SummaryCard {
	label: string;
	value: string;
	tone?: SummaryTone;
}

type SummaryTone = "blue" | "green" | "amber" | "red" | "slate";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_GAP = 12;
const CARD_HEIGHT = 58;
const CARD_WIDTH = (CONTENT_WIDTH - CARD_GAP) / 2;

const COLORS = {
	navy: rgb(0.06, 0.09, 0.16),
	blue: rgb(0.23, 0.47, 0.85),
	blueSoft: rgb(0.93, 0.96, 1),
	green: rgb(0.09, 0.64, 0.29),
	greenSoft: rgb(0.86, 0.97, 0.91),
	amber: rgb(0.85, 0.53, 0.02),
	amberSoft: rgb(0.99, 0.96, 0.79),
	red: rgb(0.86, 0.15, 0.15),
	redSoft: rgb(1, 0.91, 0.91),
	slate: rgb(0.39, 0.44, 0.52),
	slateSoft: rgb(0.96, 0.97, 0.98),
	border: rgb(0.86, 0.88, 0.9),
	text: rgb(0.12, 0.14, 0.18),
	muted: rgb(0.42, 0.47, 0.56),
	white: rgb(1, 1, 1),
};

const SUMMARY_TONES = {
	blue: { background: COLORS.blueSoft, accent: COLORS.blue },
	green: { background: COLORS.greenSoft, accent: COLORS.green },
	amber: { background: COLORS.amberSoft, accent: COLORS.amber },
	red: { background: COLORS.redSoft, accent: COLORS.red },
	slate: { background: COLORS.slateSoft, accent: COLORS.slate },
} as const;

const ORDER_TYPE_LABELS: Record<string, string> = {
	maintenance: "Mantenimiento",
	inspection: "Inspeccion",
	installation: "Instalacion",
	repair: "Reparacion",
	decommission: "Descomisionamiento",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
	open: "Abierta",
	assigned: "Asignada",
	in_progress: "En progreso",
	on_hold: "En pausa",
	completed: "Completada",
	closed: "Cerrada",
	cancelled: "Cancelada",
};

const ORDER_PRIORITY_LABELS: Record<string, string> = {
	low: "Baja",
	medium: "Media",
	high: "Alta",
	critical: "Crítica",
};

const COST_CATEGORY_LABELS: Record<string, string> = {
	labor: "Mano de obra",
	materials: "Materiales",
	equipment: "Equipos",
	overhead: "Gastos generales",
	tax: "Impuestos",
	other: "Otros",
};

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
	before: "Antes",
	during: "Durante",
	after: "Despues",
	defect: "Hallazgo",
	safety: "Seguridad",
	signature: "Firma",
};

const CHECKLIST_TYPE_LABELS: Record<string, string> = {
	pre_work: "Pre trabajo",
	post_work: "Post trabajo",
	safety: "Seguridad",
	quality: "Calidad",
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatDateTime(value?: Date | string | null): string {
	if (!value) {
		return "Sin fecha";
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Sin fecha";
	}

	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

function formatCurrency(value: number): string {
	return currencyFormatter.format(Number(value ?? 0));
}

function toNumber(value: unknown): number {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
}

function getPersonLabel(value: PersonRef, fallback: string): string {
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

		if ("email" in value && typeof value.email === "string" && value.email.trim()) {
			return value.email.trim();
		}

		if ("role" in value && typeof value.role === "string" && value.role.trim()) {
			return value.role.trim();
		}
	}

	return fallback;
}

function getStatusTone(status: string): SummaryTone {
	switch (status) {
		case "completed":
		case "closed":
			return "green";
		case "on_hold":
			return "amber";
		case "cancelled":
			return "red";
		default:
			return "blue";
	}
}

function getPriorityTone(priority: string): SummaryTone {
	switch (priority) {
		case "critical":
			return "red";
		case "high":
			return "amber";
		case "low":
			return "green";
		default:
			return "blue";
	}
}

function getTypeTone(type: string): SummaryTone {
	return type === "inspection" ? "amber" : "slate";
}

function labelForOrderType(type: string): string {
	return ORDER_TYPE_LABELS[type] ?? type;
}

function labelForOrderStatus(status: string): string {
	return ORDER_STATUS_LABELS[status] ?? status;
}

function labelForPriority(priority: string): string {
	return ORDER_PRIORITY_LABELS[priority] ?? priority;
}

function labelForCostCategory(category: string): string {
	return COST_CATEGORY_LABELS[category] ?? category;
}

function labelForEvidenceType(type: string): string {
	return EVIDENCE_TYPE_LABELS[type] ?? type;
}

function labelForChecklistType(type: string): string {
	return CHECKLIST_TYPE_LABELS[type] ?? type;
}

function splitWordByWidth(font: PDFFont, word: string, size: number, maxWidth: number): string[] {
	const chunks: string[] = [];
	let chunk = "";

	for (const char of word) {
		const nextChunk = `${chunk}${char}`;
		if (font.widthOfTextAtSize(nextChunk, size) <= maxWidth) {
			chunk = nextChunk;
			continue;
		}
		if (chunk) {
			chunks.push(chunk);
		}
		chunk = char;
	}

	if (chunk) {
		chunks.push(chunk);
	}

	return chunks;
}

function appendWrappedWord(
	lines: string[],
	font: PDFFont,
	currentLine: string,
	word: string,
	size: number,
	maxWidth: number,
): string {
	const candidate = currentLine ? `${currentLine} ${word}` : word;

	if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
		return candidate;
	}

	if (currentLine) {
		lines.push(currentLine);
	}

	if (font.widthOfTextAtSize(word, size) <= maxWidth) {
		return word;
	}

	const chunks = splitWordByWidth(font, word, size, maxWidth);
	lines.push(...chunks.slice(0, -1));
	return chunks.at(-1) ?? "";
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
	const normalized = String(text ?? "").replace(/\r\n/g, "\n");
	const paragraphs = normalized.split("\n");
	const lines: string[] = [];

	for (const paragraph of paragraphs) {
		const trimmed = paragraph.trim();

		if (!trimmed) {
			lines.push("");
			continue;
		}

		const words = trimmed.split(/\s+/);
		let currentLine = "";

		for (const word of words) {
			currentLine = appendWrappedWord(lines, font, currentLine, word, size, maxWidth);
		}

		if (currentLine) {
			lines.push(currentLine);
		}
	}

	return lines.length > 0 ? lines : [""];
}

function truncateText(font: PDFFont, text: string, size: number, maxWidth: number): string {
	const safeText = String(text ?? "");
	if (font.widthOfTextAtSize(safeText, size) <= maxWidth) {
		return safeText;
	}

	const suffix = "...";
	const targetWidth = maxWidth - font.widthOfTextAtSize(suffix, size);
	if (targetWidth <= 0) {
		return suffix;
	}

	let output = "";
	for (const char of safeText) {
		const candidate = `${output}${char}`;
		if (font.widthOfTextAtSize(candidate, size) > targetWidth) {
			break;
		}
		output = candidate;
	}

	return `${output}${suffix}`;
}

function ensureSpace(layout: PdfLayout, requiredHeight: number): void {
	if (layout.cursorY - requiredHeight >= MARGIN) {
		return;
	}

	layout.page = layout.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	layout.pages.push(layout.page);
	layout.cursorY = PAGE_HEIGHT - MARGIN;
}

function drawHeader(layout: PdfLayout, orderCode: string, title: string, subtitle: string): void {
	const { page, boldFont, font } = layout;

	page.drawRectangle({
		x: 0,
		y: PAGE_HEIGHT - 122,
		width: PAGE_WIDTH,
		height: 122,
		color: COLORS.navy,
	});

	page.drawRectangle({
		x: 0,
		y: PAGE_HEIGHT - 122,
		width: 12,
		height: 122,
		color: COLORS.blue,
	});

	page.drawText("CERMONT S.A.S.", {
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

function drawStatCard(
	page: PDFPage,
	fonts: { bold: PDFFont },
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

	page.drawRectangle({
		x,
		y: y + height - 5,
		width,
		height: 5,
		color: tone.accent,
	});

	page.drawText(item.label.toUpperCase(), {
		x: x + 12,
		y: y + height - 19,
		size: 8,
		font: fonts.bold,
		color: COLORS.muted,
	});

	const value = truncateText(fonts.bold, item.value, 12, width - 24);
	page.drawText(value, {
		x: x + 12,
		y: y + 14,
		size: 12,
		font: fonts.bold,
		color: COLORS.text,
	});
}

function drawStatGrid(layout: PdfLayout, items: SummaryCard[]): void {
	for (let index = 0; index < items.length; index += 2) {
		ensureSpace(layout, CARD_HEIGHT + 10);

		const rowY = layout.cursorY - CARD_HEIGHT;
		drawStatCard(
			layout.page,
			{ bold: layout.boldFont },
			items[index],
			MARGIN,
			rowY,
			CARD_WIDTH,
			CARD_HEIGHT,
		);

		const nextItem = items[index + 1];
		if (nextItem) {
			drawStatCard(
				layout.page,
				{ bold: layout.boldFont },
				nextItem,
				MARGIN + CARD_WIDTH + CARD_GAP,
				rowY,
				CARD_WIDTH,
				CARD_HEIGHT,
			);
		}

		layout.cursorY = rowY - 10;
	}
}

function drawLabelValue(
	layout: PdfLayout,
	label: string,
	value: string,
	options: { labelWidth?: number; fontSize?: number } = {},
): void {
	const labelWidth = options.labelWidth ?? 145;
	const fontSize = options.fontSize ?? 10.2;
	const valueWidth = CONTENT_WIDTH - labelWidth - 8;
	const valueLines = wrapText(layout.font, value, fontSize, valueWidth);
	const estimatedHeight = Math.max(18, valueLines.length * 13 + 2);

	ensureSpace(layout, estimatedHeight + 4);

	layout.page.drawText(truncateText(layout.boldFont, label, fontSize, labelWidth - 4), {
		x: MARGIN,
		y: layout.cursorY,
		size: fontSize,
		font: layout.boldFont,
		color: COLORS.navy,
	});

	valueLines.forEach((line, index) => {
		layout.page.drawText(line, {
			x: MARGIN + labelWidth,
			y: layout.cursorY - index * 13,
			size: fontSize,
			font: layout.font,
			color: COLORS.text,
		});
	});

	layout.cursorY -= estimatedHeight;
}

function drawParagraph(
	layout: PdfLayout,
	text: string,
	options: { fontSize?: number; color?: typeof COLORS.text | typeof COLORS.muted } = {},
): void {
	const fontSize = options.fontSize ?? 10.5;
	const color = options.color ?? COLORS.text;
	const lines = wrapText(layout.font, text, fontSize, CONTENT_WIDTH);
	const lineHeight = fontSize + 4;
	const totalHeight = lines.length * lineHeight;

	ensureSpace(layout, totalHeight + 2);

	lines.forEach((line) => {
		if (!line) {
			layout.cursorY -= lineHeight * 0.5;
			return;
		}

		layout.page.drawText(line, {
			x: MARGIN,
			y: layout.cursorY,
			size: fontSize,
			font: layout.font,
			color,
		});
		layout.cursorY -= lineHeight;
	});

	layout.cursorY -= 4;
}

function summarizeCosts(costs: CostPdfRecord[]): {
	totalEstimated: number;
	totalActual: number;
	totalTax: number;
	variance: number;
	variancePercent: number | null;
	byCategory: Record<string, { estimated: number; actual: number; tax: number; variance: number }>;
} {
	const summary = costs.reduce(
		(accumulator, cost) => {
			const estimatedAmount = toNumber(cost.estimatedAmount);
			const actualAmount = toNumber(cost.actualAmount);
			const taxAmount = toNumber(cost.taxAmount);
			const variance = actualAmount - estimatedAmount;

			accumulator.totalEstimated += estimatedAmount;
			accumulator.totalActual += actualAmount;
			accumulator.totalTax += taxAmount;

			const category = cost.category || "other";
			accumulator.byCategory[category] = accumulator.byCategory[category] ?? {
				estimated: 0,
				actual: 0,
				tax: 0,
				variance: 0,
			};

			accumulator.byCategory[category].estimated += estimatedAmount;
			accumulator.byCategory[category].actual += actualAmount;
			accumulator.byCategory[category].tax += taxAmount;
			accumulator.byCategory[category].variance += variance;

			return accumulator;
		},
		{
			totalEstimated: 0,
			totalActual: 0,
			totalTax: 0,
			byCategory: {} as Record<
				string,
				{ estimated: number; actual: number; tax: number; variance: number }
			>,
		},
	);

	const variance = summary.totalActual - summary.totalEstimated;

	return {
		...summary,
		variance,
		variancePercent: summary.totalEstimated > 0 ? variance / summary.totalEstimated : null,
	};
}

function summarizeEvidence(evidences: EvidencePdfRecord[]): Record<string, number> {
	return evidences.reduce(
		(accumulator, evidence) => {
			accumulator[evidence.type] = (accumulator[evidence.type] ?? 0) + 1;
			return accumulator;
		},
		{} as Record<string, number>,
	);
}

function summarizeChecklists(checklists: ChecklistPdfRecord[]): {
	total: number;
	completed: number;
	pending: number;
	itemsChecked: number;
	itemsTotal: number;
	signatures: number;
} {
	return checklists.reduce(
		(accumulator, checklist) => {
			accumulator.total += 1;
			if (checklist.status === "completed") {
				accumulator.completed += 1;
			} else {
				accumulator.pending += 1;
			}

			accumulator.signatures += checklist.signature ? 1 : 0;
			accumulator.itemsTotal += checklist.items?.length ?? 0;
			accumulator.itemsChecked += checklist.items?.filter((item) => item.checked).length ?? 0;

			return accumulator;
		},
		{ total: 0, completed: 0, pending: 0, itemsChecked: 0, itemsTotal: 0, signatures: 0 },
	);
}

function drawChecklistItems(
	layout: PdfLayout,
	items: NonNullable<ChecklistPdfRecord["items"]>,
): void {
	for (const item of items.slice(0, 8)) {
		const itemLabel = item.description || item.category || "Item";
		const itemValue = `${item.checked ? "Cumplido" : "Pendiente"}${item.observation ? ` · ${item.observation}` : ""}`;
		drawLabelValue(layout, itemLabel, itemValue, { labelWidth: 175, fontSize: 9.4 });
	}
}

async function drawChecklistSignature(layout: PdfLayout, signature: string): Promise<void> {
	const signatureMatch = signature.match(/^data:(image\/(png|jpe?g));base64,(.+)$/i);

	if (!signatureMatch) {
		drawLabelValue(layout, "Firma del checklist", "Firma registrada");
		return;
	}

	const mimeType = signatureMatch[1].toLowerCase();
	const encodedImage = signatureMatch[3];
	const imageBytes = Buffer.from(encodedImage, "base64");
	const embeddedImage = mimeType.includes("png")
		? await layout.pdfDoc.embedPng(imageBytes)
		: await layout.pdfDoc.embedJpg(imageBytes);

	ensureSpace(layout, 110);
	layout.page.drawText("Firma del checklist", {
		x: MARGIN,
		y: layout.cursorY,
		size: 9.5,
		font: layout.boldFont,
		color: COLORS.navy,
	});

	layout.page.drawImage(embeddedImage, {
		x: MARGIN,
		y: layout.cursorY - 70,
		width: 150,
		height: 60,
	});
	layout.cursorY -= 88;
}

async function drawChecklistDetails(
	layout: PdfLayout,
	checklists: ChecklistPdfRecord[],
): Promise<void> {
	if (checklists.length === 0) {
		drawParagraph(layout, "Aun no se han creado checklists para esta orden.");
		return;
	}

	const recentChecklists = checklists.slice(0, 3);

	for (const checklist of recentChecklists) {
		const items = checklist.items ?? [];
		const completedItems = items.filter((item) => item.checked).length;
		const header = `${checklist.status} · ${completedItems}/${items.length} items${checklist.signature ? " · con firma" : " · sin firma"}`;

		drawLabelValue(layout, labelForChecklistType(checklist.type), header);
		drawChecklistItems(layout, items);

		if (checklist.signature) {
			await drawChecklistSignature(layout, checklist.signature);
		}
	}
}

interface PdfReportContext {
	orderId: string;
	type: PdfType;
	order: OrderPdfRecord;
	costs: CostPdfRecord[];
	evidences: EvidencePdfRecord[];
	checklists: ChecklistPdfRecord[];
	costTotals: ReturnType<typeof summarizeCosts>;
	evidenceTotals: ReturnType<typeof summarizeEvidence>;
	checklistTotals: ReturnType<typeof summarizeChecklists>;
	assignedToLabel: string;
	supervisorLabel: string;
	createdByLabel: string;
	orderCode: string;
	title: string;
	subtitle: string;
}

function drawOperationalSummarySection(layout: PdfLayout, context: PdfReportContext): void {
	drawSectionHeading(
		layout,
		"Resumen operativo",
		"Indicadores clave de la orden y su trazabilidad",
	);
	drawStatGrid(layout, [
		{ label: "Orden", value: context.orderCode, tone: "blue" },
		{
			label: "Estado",
			value: labelForOrderStatus(context.order.status),
			tone: getStatusTone(context.order.status),
		},
		{
			label: "Prioridad",
			value: labelForPriority(context.order.priority),
			tone: getPriorityTone(context.order.priority),
		},
		{
			label: "Tipo",
			value: labelForOrderType(context.order.type),
			tone: getTypeTone(context.order.type),
		},
		{ label: "Asignado a", value: context.assignedToLabel, tone: "green" },
		{ label: "Materiales", value: String(context.order.materials?.length ?? 0), tone: "blue" },
		{ label: "Costos activos", value: String(context.costs.length), tone: "amber" },
		{ label: "Evidencias", value: String(context.evidences.length), tone: "blue" },
	]);
}

function drawOperationalDataSection(layout: PdfLayout, context: PdfReportContext): void {
	drawSectionHeading(
		layout,
		"Datos operativos",
		"Informacion base para ejecucion, cierre y auditoria",
	);
	drawLabelValue(layout, "Activo", `${context.order.assetName} (${context.order.assetId})`);
	drawLabelValue(layout, "Ubicacion", context.order.location);
	drawLabelValue(layout, "Descripcion", context.order.description);
	drawLabelValue(layout, "Creada por", context.createdByLabel);
	drawLabelValue(layout, "Supervisor", context.supervisorLabel);
	drawLabelValue(layout, "Inicio real", formatDateTime(context.order.startedAt));
	drawLabelValue(layout, "Cierre real", formatDateTime(context.order.completedAt));
	drawLabelValue(layout, "Factura lista", context.order.invoiceReady ? "Si" : "No");
	drawLabelValue(layout, "Reporte generado", context.order.reportGenerated ? "Si" : "No");
}

function drawMaterialsSection(layout: PdfLayout, order: OrderPdfRecord): void {
	drawSectionHeading(
		layout,
		"Materiales utilizados",
		"Materiales asociados directamente a la orden",
	);
	if ((order.materials?.length ?? 0) === 0) {
		drawParagraph(layout, "No se registraron materiales para esta orden.");
		return;
	}

	for (const material of order.materials ?? []) {
		const quantityText = `${material.quantity} ${material.unit}`;
		const unitCostText =
			material.unitCost !== undefined ? ` · ${formatCurrency(material.unitCost)} / unidad` : "";
		const deliveredText = material.delivered ? " · entregado" : " · pendiente de entrega";
		drawLabelValue(layout, material.name, `${quantityText}${unitCostText}${deliveredText}`);
	}
}

function drawCostsSection(
	layout: PdfLayout,
	costs: CostPdfRecord[],
	costTotals: ReturnType<typeof summarizeCosts>,
): void {
	drawSectionHeading(
		layout,
		"Costos registrados",
		"Consolidado activo por categoria y detalle reciente",
	);
	drawLabelValue(layout, "Total estimado", formatCurrency(costTotals.totalEstimated));
	drawLabelValue(layout, "Total real", formatCurrency(costTotals.totalActual));
	drawLabelValue(layout, "Impuestos", formatCurrency(costTotals.totalTax));
	drawLabelValue(layout, "Variance", formatCurrency(costTotals.variance));
	for (const category of ["labor", "materials", "equipment", "overhead", "tax", "other"] as const) {
		drawLabelValue(
			layout,
			labelForCostCategory(category),
			formatCurrency(costTotals.byCategory[category]?.actual ?? 0),
		);
	}

	if (costs.length === 0) {
		drawParagraph(layout, "No hay costos registrados para esta orden.");
		return;
	}

	for (const cost of costs.slice(0, 5)) {
		const summary = `${labelForCostCategory(cost.category)} · estimado ${formatCurrency(cost.estimatedAmount)} · real ${formatCurrency(cost.actualAmount)} · impuestos ${formatCurrency(cost.taxAmount)} · variance ${formatCurrency(cost.actualAmount - cost.estimatedAmount)}`;
		drawLabelValue(layout, cost.description, summary);
	}
}

function drawEvidenceSection(
	layout: PdfLayout,
	evidences: EvidencePdfRecord[],
	evidenceTotals: ReturnType<typeof summarizeEvidence>,
): void {
	drawSectionHeading(
		layout,
		"Evidencias",
		"Soportes visuales y de trazabilidad capturados durante la ejecucion",
	);
	drawLabelValue(layout, "Total evidencias", String(evidences.length));
	for (const evidenceType of [
		"before",
		"during",
		"after",
		"defect",
		"safety",
		"signature",
	] as const) {
		drawLabelValue(
			layout,
			labelForEvidenceType(evidenceType),
			String(evidenceTotals[evidenceType] ?? 0),
		);
	}

	const gpsEvidences = evidences.filter((evidence) => evidence.gpsLocation);
	drawLabelValue(layout, "Evidencias con GPS", String(gpsEvidences.length));

	if (evidences.length === 0) {
		drawParagraph(layout, "No se registraron evidencias para esta orden.");
		return;
	}

	for (const evidence of evidences.slice(0, 5)) {
		const summary = `${labelForEvidenceType(evidence.type)} · ${formatDateTime(evidence.capturedAt)}${evidence.description ? ` · ${evidence.description}` : ""}`;
		drawLabelValue(layout, evidence.filename, summary);
	}
}

async function drawChecklistSection(
	layout: PdfLayout,
	checklists: ChecklistPdfRecord[],
	checklistTotals: ReturnType<typeof summarizeChecklists>,
): Promise<void> {
	drawSectionHeading(
		layout,
		"Checklist y conformidad",
		"Estado de los controles y firmas capturadas",
	);
	drawLabelValue(layout, "Checklists", String(checklistTotals.total));
	drawLabelValue(layout, "Completados", String(checklistTotals.completed));
	drawLabelValue(layout, "Pendientes", String(checklistTotals.pending));
	drawLabelValue(
		layout,
		"Items verificados",
		`${checklistTotals.itemsChecked}/${checklistTotals.itemsTotal}`,
	);
	drawLabelValue(layout, "Firmas registradas", String(checklistTotals.signatures));
	await drawChecklistDetails(layout, checklists);
}

function drawDeliverySignatureBlock(layout: PdfLayout, font: PDFFont): void {
	ensureSpace(layout, 72);
	layout.page.drawLine({
		start: { x: MARGIN, y: layout.cursorY - 8 },
		end: { x: MARGIN + 200, y: layout.cursorY - 8 },
		thickness: 1,
		color: COLORS.border,
	});
	layout.page.drawLine({
		start: { x: MARGIN + 250, y: layout.cursorY - 8 },
		end: { x: MARGIN + 450, y: layout.cursorY - 8 },
		thickness: 1,
		color: COLORS.border,
	});

	layout.page.drawText("Firma entrega", {
		x: MARGIN,
		y: layout.cursorY - 24,
		size: 8,
		font,
		color: COLORS.muted,
	});
	layout.page.drawText("Firma recibe", {
		x: MARGIN + 250,
		y: layout.cursorY - 24,
		size: 8,
		font,
		color: COLORS.muted,
	});
	layout.cursorY -= 48;
}

function drawClosingSection(layout: PdfLayout, context: PdfReportContext, font: PDFFont): void {
	drawSectionHeading(
		layout,
		"Observaciones y cierre",
		"Resumen narrativo para seguimiento tecnico y administrativo",
	);
	drawParagraph(layout, context.order.observations || "Sin observaciones registradas.");
	drawParagraph(layout, `Descripcion base de la OT: ${context.order.description}`);

	if (context.type === "delivery") {
		drawParagraph(
			layout,
			"El presente documento deja constancia de la entrega operativa, la conformidad de la ejecucion y la trazabilidad de la evidencia asociada.",
		);
		drawDeliverySignatureBlock(layout, font);
	}
}

function drawPageFooters(layout: PdfLayout, font: PDFFont, orderCode: string, title: string): void {
	const generatedAt = formatDateTime(new Date());
	layout.pages.forEach((page, index) => {
		const footerText = `Cermont S.A.S. | ${orderCode} | ${title}`;
		const pageText = `Pagina ${index + 1} de ${layout.pages.length}`;
		const footerWidth = layout.font.widthOfTextAtSize(footerText, 8);
		const pageWidth = layout.font.widthOfTextAtSize(pageText, 8);

		page.drawLine({
			start: { x: MARGIN, y: 28 },
			end: { x: PAGE_WIDTH - MARGIN, y: 28 },
			thickness: 1,
			color: COLORS.border,
		});

		page.drawText(`${footerText} | ${generatedAt}`, {
			x: MARGIN,
			y: 15,
			size: 8,
			font,
			color: COLORS.muted,
		});

		page.drawText(pageText, {
			x: PAGE_WIDTH - MARGIN - pageWidth,
			y: 15,
			size: 8,
			font,
			color: COLORS.muted,
		});

		if (footerWidth > CONTENT_WIDTH) {
			page.drawText(orderCode, {
				x: PAGE_WIDTH - MARGIN - 120,
				y: 15,
				size: 8,
				font,
				color: COLORS.muted,
			});
		}
	});
}

/**
 * Generate a detailed PDF document for an order.
 */
export async function generateOrderPdf(options: GeneratePdfOptions): Promise<Buffer> {
	const { orderId, type } = options;

	log.info("Generating PDF", { orderId, type });

	const [orderResult, costs, evidences, checklists] = await Promise.all([
		Order.findById(orderId)
			.populate("assignedTo", "name email role")
			.populate("supervisedBy", "name email role")
			.populate("createdBy", "name email role")
			.lean(),
		Cost.find({ orderId }).sort({ createdAt: -1 }).lean<CostPdfRecord[]>(),
		Evidence.find({ orderId, deletedAt: null }).sort({ createdAt: -1 }).lean<EvidencePdfRecord[]>(),
		Checklist.find({ orderId }).sort({ createdAt: -1 }).lean<ChecklistPdfRecord[]>(),
	]);

	const order = orderResult as OrderPdfRecord | null;

	if (!order) {
		throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
	}

	const costTotals = summarizeCosts(costs);
	const evidenceTotals = summarizeEvidence(evidences);
	const checklistTotals = summarizeChecklists(checklists);

	const assignedToLabel = getPersonLabel(order.assignedTo, order.assignedToName ?? "Sin asignar");
	const supervisorLabel = getPersonLabel(order.supervisedBy, "Sin supervisor");
	const createdByLabel = getPersonLabel(order.createdBy, "Sistema");
	const orderCode = order.code || orderId;
	const title = type === "delivery" ? "ACTA DE ENTREGA" : "INFORME TECNICO";
	const subtitle =
		type === "delivery"
			? "Cierre administrativo, conformidad y trazabilidad de entrega"
			: "Ejecucion operativa, seguimiento y evidencia de campo";

	const pdfDoc = await PDFDocument.create();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const layout: PdfLayout = {
		pdfDoc,
		page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
		pages: [],
		font,
		boldFont,
		cursorY: PAGE_HEIGHT - MARGIN,
	};

	layout.pages.push(layout.page);
	const context: PdfReportContext = {
		orderId,
		type,
		order,
		costs,
		evidences,
		checklists,
		costTotals,
		evidenceTotals,
		checklistTotals,
		assignedToLabel,
		supervisorLabel,
		createdByLabel,
		orderCode,
		title,
		subtitle,
	};

	drawHeader(layout, context.orderCode, context.title, context.subtitle);
	drawOperationalSummarySection(layout, context);
	drawOperationalDataSection(layout, context);
	drawMaterialsSection(layout, context.order);
	drawCostsSection(layout, context.costs, context.costTotals);
	drawEvidenceSection(layout, context.evidences, context.evidenceTotals);
	await drawChecklistSection(layout, context.checklists, context.checklistTotals);
	drawClosingSection(layout, context, font);
	drawPageFooters(layout, font, context.orderCode, context.title);

	const pdfBytes = await pdfDoc.save();

	try {
		await Order.updateOne({ _id: orderId }, { $set: { reportGenerated: true } });
	} catch (error) {
		log.warn("Unable to update reportGenerated flag", {
			orderId,
			error: error instanceof Error ? error.message : String(error),
		});
	}

	log.info("PDF generated successfully", { orderId, type, size: pdfBytes.length });

	return Buffer.from(pdfBytes);
}

export async function generateProposalCostPdf(proposalId: string): Promise<Buffer> {
	const proposal = await Proposal.findById(proposalId).lean();

	if (!proposal) {
		throw new AppError("Proposal not found", 404, "PROPOSAL_NOT_FOUND");
	}

	const pdfDoc = await PDFDocument.create();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

	const state = {
		page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
		cursorY: PAGE_HEIGHT - MARGIN,
	};

	const drawText = (text: string, size = 10, customFont?: PDFFont) => {
		state.page.drawText(text, { x: MARGIN, y: state.cursorY, size, font: customFont ?? font });
		state.cursorY -= size + 4;
	};

	const bold = (text: string, size = 10) => drawText(text, size, boldFont);

	drawProposalPdfHeader(proposal as unknown as Record<string, unknown>, proposalId, bold, drawText, state);
	state.cursorY -= 8;

	if (proposal.items && proposal.items.length > 0) {
		drawProposalPdfItemsSection(proposal as unknown as Record<string, unknown>, pdfDoc, state, drawText, bold);
	}

	const pdfBytes = await pdfDoc.save();
	return Buffer.from(pdfBytes);
}

function drawProposalPdfHeader(
	proposal: Record<string, unknown>,
	proposalId: string,
	bold: (text: string, size?: number) => void,
	drawText: (text: string, size?: number, font?: PDFFont) => void,
	state: { cursorY: number },
): void {
	bold("DESGLOSE DE COSTOS - PROPUESTA", 16);
	state.cursorY -= 8;
	bold(`Propuesta: ${proposal.code || proposalId}`, 11);
	drawText(`Cliente: ${proposal.clientName}`);
	drawText(`Titulo: ${proposal.title}`);
	drawText(`Estado: ${proposal.status}`);
}

function drawProposalPdfItemsSection(
	proposal: Record<string, unknown>,
	pdfDoc: PDFDocument,
	state: { page: PDFPage; cursorY: number },
	drawText: (text: string, size?: number, font?: PDFFont) => void,
	bold: (text: string, size?: number) => void,
): void {
	bold("Items:", 11);
	state.cursorY -= 4;

	const headers = ["Descripcion", "Unidad", "Cant.", "P. Unit.", "Total"];
	bold(headers.join(" | "), 9);
	state.cursorY -= 2;

	for (const item of proposal.items as Array<Record<string, unknown>>) {
		const line = [
			(item.description as string)?.slice(0, 25) || "",
			(item.unit as string) || "",
			String(item.quantity ?? ""),
			String(item.unitCost ?? ""),
			String(item.total ?? ""),
		].join(" | ");
		drawText(line, 8);

		if (state.cursorY < 60) {
			state.page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
			state.cursorY = PAGE_HEIGHT - MARGIN;
		}
	}

	state.cursorY -= 4;
	bold(`Subtotal: $${Number(proposal.subtotal ?? 0).toFixed(2)}`, 10);
	bold(`Total: $${Number(proposal.total ?? 0).toFixed(2)}`, 11);
}
