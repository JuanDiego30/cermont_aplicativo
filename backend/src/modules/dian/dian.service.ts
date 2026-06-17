/**
 * DianService — Colombian Electronic Invoicing (Factura Electrónica DIAN)
 *
 * Generates UBL 2.1 XML invoices, submits to DIAN web services,
 * and tracks CUFE (Código Único de Facturación Electrónica).
 *
 * DIAN environment: https://www.dian.gov.co/
 * Standard: UBL 2.1 (ISO 20022)
 * Technical guide: Documentación técnica DIAN - Factura Electrónica de Venta
 */

import { createHash, randomUUID } from "node:crypto";
import type {
	DianConfigurationInput,
	DianConfigurationStatus,
	DianPublicConfiguration,
} from "@cermont/shared-types";
import { AppError, ForbiddenError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import type { AuthClaims } from "../../common/utils/request";
import { Invoice, type InvoiceDocument } from "../../models/Invoice";
import { createAuditLog } from "../audit/audit.service";
import { type DianConfigurationDocument, DianConfigurationModel } from "./dian.config.model";

const log = createLogger("dian-service");

// ─── CUFE Generation ─────────────────────────────────────────────────────
/**
 * Generates the CUFE according to DIAN technical standard.
 * CUFE = SHA-384 hash of the concatenated invoice fields.
 *
 * Fields to include (per DIAN Resolución 000085):
 * - NumFactura + FechaEmision + HoraEmision + NitOFE + NumDocAdquiriente
 * - + TotalSinImpuestos + TotalIVA + TotalConIVA + CUDE (opcional)
 * - + CodigoTecnologico + SoftwareSecurityCode (PIN)
 */
export function generateCufe(invoiceData: {
	invoiceNumber: string;
	issueDate: string;
	issueTime: string;
	sellerNit: string;
	buyerDoc: string;
	taxableAmount: number;
	ivaAmount: number;
	totalAmount: number;
	softwareSecurityCode: string;
}): string {
	const concatString = [
		invoiceData.invoiceNumber,
		invoiceData.issueDate,
		invoiceData.issueTime,
		invoiceData.sellerNit,
		invoiceData.buyerDoc,
		invoiceData.taxableAmount.toFixed(2),
		invoiceData.ivaAmount.toFixed(2),
		invoiceData.totalAmount.toFixed(2),
		"", // CUDE (not used)
		"2", // Software version
		invoiceData.softwareSecurityCode,
	].join("");

	return createHash("sha384").update(concatString, "utf8").digest("hex").toUpperCase();
}

// ─── UBL XML Generation ──────────────────────────────────────────────────
/**
 * Generates UBL 2.1 XML string for a DIAN electronic invoice.
 * Based on Resolución 000085 de 2022 (DIAN).
 */
function escapeXml(value: string | number): string {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export function generateUblXml(params: {
	invoiceNumber: string;
	prefix: string;
	issueDate: string;
	issueTime: string;
	invoiceType: string;
	currency: string;
	seller: { nit: string; businessName: string; address: string; phone: string; email: string };
	buyer: {
		documentType: string;
		documentNumber: string;
		businessName: string;
		address: string;
		email: string;
	};
	lineItems: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
	taxableAmount: number;
	ivaAmount: number;
	totalAmount: number;
	cufe: string;
	qrCode: string;
	technicalKey: string;
	softwareId: string;
	authorizationStartDate: string;
	authorizationEndDate: string;
	authorizationFrom: number;
	authorizationTo: number;
}): string {
	// Map DIAN document types
	const docTypeMap: Record<string, string> = {
		NIT: "1",
		CC: "2",
		CE: "3",
		PASAPORTE: "4",
	};

	// Map invoice types to DIAN codes
	const invoiceTypeMap: Record<string, string> = {
		FV: "01", // Factura de Venta
		NC: "02", // Nota Crédito
		ND: "03", // Nota Débito
	};

	const dianDocType = docTypeMap[params.buyer.documentType] ?? "2";
	const dianInvoiceType = invoiceTypeMap[params.invoiceType] ?? "01";
	const fullInvoiceNumber = escapeXml(`${params.prefix}${params.invoiceNumber}`);

	// ═══════════════════════════════════════════════════════════
	// Build UBL 2.1 Invoice XML
	// Schema: urn:oasis:names:specification:ubl:schema:xsd:Invoice-2
	// ═══════════════════════════════════════════════════════════
	return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:sts="dian:gov:co:facturaelectronica:Structures-2-1"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <sts:DianExtensions>
          <sts:InvoiceControl>
            <sts:InvoiceAuthorization>${escapeXml(params.technicalKey)}</sts:InvoiceAuthorization>
            <sts:AuthorizationPeriod>
              <cbc:StartDate>${escapeXml(params.authorizationStartDate)}</cbc:StartDate>
              <cbc:EndDate>${escapeXml(params.authorizationEndDate)}</cbc:EndDate>
            </sts:AuthorizationPeriod>
            <sts:AuthorizedInvoices>
              <sts:Prefix>${escapeXml(params.prefix)}</sts:Prefix>
              <sts:From>${params.authorizationFrom}</sts:From>
              <sts:To>${params.authorizationTo}</sts:To>
            </sts:AuthorizedInvoices>
          </sts:InvoiceControl>
          <sts:InvoiceIssuer>
            <sts:Identification>
              <sts:IdentificationType>1</sts:IdentificationType>
              <sts:Number>${escapeXml(params.seller.nit)}</sts:Number>
            </sts:Identification>
          </sts:InvoiceIssuer>
          <sts:SoftwareSecurity>
            <sts:SoftwareID>${escapeXml(params.softwareId)}</sts:SoftwareID>
            <sts:SoftwareSecurityCode>${escapeXml(params.technicalKey)}</sts:SoftwareSecurityCode>
          </sts:SoftwareSecurity>
        </sts:DianExtensions>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Factura Electronica de Venta</cbc:ProfileID>
  <cbc:ProfileExecutionID>1</cbc:ProfileExecutionID>
  <cbc:ID>${fullInvoiceNumber}</cbc:ID>
  <cbc:UUID schemeID="${escapeXml(params.cufe)}" schemeName="CUFE">${escapeXml(params.cufe)}</cbc:UUID>
  <cbc:IssueDate>${escapeXml(params.issueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${escapeXml(params.issueTime)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${dianInvoiceType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${escapeXml(params.currency)}</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${params.lineItems.length}</cbc:LineCountNumeric>

  <!-- Accounting Supplier (Seller) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="1">${escapeXml(params.seller.nit)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(params.seller.businessName)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:CityName>BOGOTÁ</cbc:CityName>
          <cbc:CountrySubentity>BOGOTÁ</cbc:CountrySubentity>
          <cbc:AddressLine>
            <cbc:Line>${escapeXml(params.seller.address)}</cbc:Line>
          </cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(params.seller.email)}</cbc:ElectronicMail>
        <cbc:Telephone>${escapeXml(params.seller.phone)}</cbc:Telephone>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Accounting Customer (Buyer) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${dianDocType}">${escapeXml(params.buyer.documentNumber)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(params.buyer.businessName)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:CityName>BOGOTÁ</cbc:CityName>
          <cbc:CountrySubentity>BOGOTÁ</cbc:CountrySubentity>
          <cbc:AddressLine>
            <cbc:Line>${escapeXml(params.buyer.address)}</cbc:Line>
          </cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(params.buyer.email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Tax Totals -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escapeXml(params.currency)}">${params.ivaAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${escapeXml(params.currency)}">${params.taxableAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${escapeXml(params.currency)}">${params.ivaAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>01</cbc:ID>
        <cbc:Name>IVA</cbc:Name>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escapeXml(params.currency)}">${params.taxableAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${escapeXml(params.currency)}">${params.taxableAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${escapeXml(params.currency)}">${params.totalAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${escapeXml(params.currency)}">${params.totalAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  ${params.lineItems
		.map(
			(item, idx) => `
  <!-- Invoice Line ${idx + 1} -->
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="ZZ">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${escapeXml(params.currency)}">${item.total.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(item.description)}</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${escapeXml(params.currency)}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
		)
		.join("")}
</Invoice>`;
}

interface PreparedDianInvoice {
	cufe: string;
	documentHash: string;
	invoiceNumber: string;
	ublXml: string;
}

interface DianSubmissionResponse {
	code: string;
	description: string;
	trackId?: string;
}

function assertInvoiceCanBeSent(invoice: InvoiceDocument): void {
	if (invoice.status !== "draft" && invoice.status !== "DRAFT") {
		throw new AppError(
			"Solo facturas en borrador pueden enviarse a DIAN",
			400,
			"INVALID_INVOICE_STATUS",
		);
	}
	if (!invoice.seller || !invoice.buyer) {
		throw new AppError(
			"La factura no tiene datos de vendedor o comprador para facturación electrónica",
			400,
			"MISSING_DIAN_DATA",
		);
	}
}

function assertDianConfigured(
	config: DianConfigurationDocument | null,
): asserts config is DianConfigurationDocument {
	if (!config?.isEnabled) {
		throw new AppError(
			"DIAN no está configurado. Configure los parámetros de facturación electrónica primero.",
			400,
			"DIAN_NOT_CONFIGURED",
		);
	}
	if (!config.softwarePin || !config.technicalKey) {
		throw new AppError(
			"Las credenciales DIAN están incompletas",
			400,
			"DIAN_CREDENTIALS_INCOMPLETE",
		);
	}
}

function prepareDianInvoice(
	invoice: InvoiceDocument,
	config: DianConfigurationDocument,
	reservedNumber: number,
): PreparedDianInvoice {
	if (!invoice.seller || !invoice.buyer) {
		throw new AppError(
			"La factura no tiene datos de vendedor o comprador para facturación electrónica",
			400,
			"MISSING_DIAN_DATA",
		);
	}

	const invoiceNumber = `${config.resolutionPrefix}${reservedNumber}`;
	const issueDate = invoice.issueDate ?? new Date();
	const [issueDateStr = "", issueTimeWithMilliseconds = "00:00:00"] = issueDate
		.toISOString()
		.split("T");
	const issueTimeStr = issueTimeWithMilliseconds.split(".")[0] ?? "00:00:00";
	const totalAmount = invoice.totalAmount ?? invoice.total ?? 0;
	const ivaAmount = invoice.ivaAmount ?? invoice.taxAmount ?? 0;
	const taxableAmount = totalAmount - ivaAmount;
	const cufe = generateCufe({
		invoiceNumber,
		issueDate: issueDateStr,
		issueTime: issueTimeStr,
		sellerNit: invoice.seller.nit,
		buyerDoc: invoice.buyer.documentNumber,
		taxableAmount,
		ivaAmount,
		totalAmount,
		softwareSecurityCode: config.softwarePin,
	});
	const ublXml = generateUblXml({
		invoiceNumber: String(reservedNumber),
		prefix: config.resolutionPrefix,
		issueDate: issueDateStr,
		issueTime: issueTimeStr,
		invoiceType: invoice.tipoDocumento ?? "FV",
		currency: invoice.currency ?? "COP",
		seller: invoice.seller,
		buyer: invoice.buyer,
		lineItems: (invoice.invoiceLines ?? []).map((line) => ({
			description: line.description,
			quantity: line.quantity,
			unitPrice: line.unitPrice,
			total: line.total,
		})),
		taxableAmount,
		ivaAmount,
		totalAmount,
		cufe,
		qrCode: `https://cermont.com.co/factura/${cufe}`,
		technicalKey: config.technicalKey,
		softwareId: config.softwareId,
		authorizationStartDate: config.resolutionStartDate.toISOString().slice(0, 10),
		authorizationEndDate: config.resolutionEndDate.toISOString().slice(0, 10),
		authorizationFrom: config.resolutionFrom,
		authorizationTo: config.resolutionTo,
	});

	return {
		cufe,
		documentHash: createHash("sha256").update(ublXml, "utf8").digest("hex"),
		invoiceNumber,
		ublXml,
	};
}

function submitDianInvoice(
	config: DianConfigurationDocument,
	invoiceId: string,
	prepared: PreparedDianInvoice,
): DianSubmissionResponse {
	if (config.environment === "test") {
		const response = {
			code: "OK",
			description: "Factura recibida por DIAN (modo prueba)",
			trackId: String(`TEST-${randomUUID()}`).slice(0, 12),
		};
		log.info("DIAN test mode: simulated submission", {
			invoiceId,
			cufe: prepared.cufe,
			trackId: response.trackId,
		});
		return response;
	}

	log.error("DIAN production gateway is not configured", {
		invoiceId,
		documentHash: prepared.documentHash,
	});
	throw new AppError(
		"La pasarela DIAN de producción requiere certificado y firma XAdES configurados",
		503,
		"DIAN_PRODUCTION_GATEWAY_UNAVAILABLE",
	);
}

async function persistDianSubmission(
	invoice: InvoiceDocument,
	config: DianConfigurationDocument,
	prepared: PreparedDianInvoice,
	response: DianSubmissionResponse,
	userId?: string,
): Promise<void> {
	const sentAt = new Date();
	const dianTrackId = response.trackId ?? "N/A";
	const dianNote = `[DIAN] Enviada: ${sentAt.toISOString()} - Track: ${dianTrackId}`;

	invoice.cufe = prepared.cufe;
	invoice.qrCode = `https://cermont.com.co/factura/${prepared.cufe}`;
	invoice.invoiceNumber = prepared.invoiceNumber;
	invoice.numeroResolucion = config.resolutionNumber;
	invoice.status = "issued";
	invoice.dianStatus = "accepted";
	invoice.dianTrackId = dianTrackId;
	invoice.dianDocumentHash = prepared.documentHash;
	delete invoice.dianErrorCode;
	invoice.issuedAt = sentAt;
	invoice.notes = invoice.notes ? `${invoice.notes}\n${dianNote}` : dianNote;
	invoice.commandHistory.push({
		clientMutationId: String(randomUUID()),
		command: "DIAN_SEND",
		recordedAt: sentAt,
	});
	await invoice.save();

	if (userId) {
		await createAuditLog({
			userId,
			action: "INVOICE_SENT_TO_DIAN",
			entity: "Invoice",
			entityId: invoice._id.toString(),
			metadata: JSON.stringify({ cufe: prepared.cufe, trackId: dianTrackId }),
		});
	}
}

function toPublicConfiguration(config: DianConfigurationDocument): DianPublicConfiguration {
	return {
		testSetId: config.testSetId,
		softwareId: config.softwareId,
		resolutionNumber: config.resolutionNumber,
		resolutionDate: config.resolutionDate.toISOString(),
		resolutionStartDate: config.resolutionStartDate.toISOString(),
		resolutionEndDate: config.resolutionEndDate.toISOString(),
		resolutionPrefix: config.resolutionPrefix,
		resolutionFrom: config.resolutionFrom,
		resolutionTo: config.resolutionTo,
		environment: config.environment,
		isEnabled: config.isEnabled,
		lastInvoiceNumber: config.lastInvoiceNumber,
		credentialStatus: {
			softwarePin: "configured",
			technicalKey: "configured",
		},
	};
}

function getMissingConfigurationFields(config: DianConfigurationDocument): string[] {
	const missingFields: string[] = [];
	if (!config.softwarePin) {
		missingFields.push("softwarePin");
	}
	if (!config.technicalKey) {
		missingFields.push("technicalKey");
	}
	if (!config.resolutionDate) {
		missingFields.push("resolutionDate");
	}
	if (!config.resolutionStartDate) {
		missingFields.push("resolutionStartDate");
	}
	if (!config.resolutionEndDate) {
		missingFields.push("resolutionEndDate");
	}
	return missingFields;
}

async function loadDianConfiguration(): Promise<DianConfigurationDocument | null> {
	return DianConfigurationModel.findOne({ singletonKey: "dian" }).select(
		"+softwarePin +technicalKey",
	);
}

function assertResolutionIsActive(config: DianConfigurationDocument, now: Date): void {
	if (now < config.resolutionStartDate || now > config.resolutionEndDate) {
		throw new AppError(
			"La resolución de facturación DIAN no está vigente",
			400,
			"DIAN_RESOLUTION_NOT_ACTIVE",
		);
	}
}

async function claimInvoiceForSubmission(invoiceId: string): Promise<InvoiceDocument> {
	const invoice = await Invoice.findOneAndUpdate(
		{
			_id: invoiceId,
			status: { $in: ["draft", "DRAFT"] },
			$or: [{ dianStatus: { $exists: false } }, { dianStatus: { $in: ["not_sent", "failed"] } }],
		},
		{
			$set: { dianStatus: "submitting" },
			$unset: { dianErrorCode: "" },
		},
		{ returnDocument: "after" },
	);
	if (invoice) {
		assertInvoiceCanBeSent(invoice);
		return invoice;
	}

	const existing = await Invoice.findById(invoiceId);
	if (!existing) {
		throw new AppError("Factura no encontrada", 404, "INVOICE_NOT_FOUND");
	}
	if (existing.dianStatus === "submitting") {
		throw new AppError(
			"La factura ya está siendo enviada a DIAN",
			409,
			"DIAN_SUBMISSION_IN_PROGRESS",
		);
	}
	throw new AppError(
		"La factura no está disponible para envío a DIAN",
		409,
		"DIAN_INVOICE_NOT_SENDABLE",
	);
}

async function reserveInvoiceNumber(
	config: DianConfigurationDocument,
): Promise<{ config: DianConfigurationDocument; number: number }> {
	const currentNumber = Math.max(config.lastInvoiceNumber, config.resolutionFrom - 1);
	const nextNumber = currentNumber + 1;
	if (nextNumber > config.resolutionTo) {
		throw new AppError(
			"La resolución DIAN agotó su rango de numeración autorizado",
			409,
			"DIAN_NUMBER_RANGE_EXHAUSTED",
		);
	}

	const updated = await DianConfigurationModel.findOneAndUpdate(
		{
			_id: config._id,
			lastInvoiceNumber: config.lastInvoiceNumber,
		},
		{ $set: { lastInvoiceNumber: nextNumber } },
		{ returnDocument: "after" },
	).select("+softwarePin +technicalKey");
	if (!updated) {
		const refreshed = await loadDianConfiguration();
		assertDianConfigured(refreshed);
		return reserveInvoiceNumber(refreshed);
	}
	return { config: updated, number: nextNumber };
}

async function markSubmissionFailed(invoiceId: string, error: Error): Promise<void> {
	await Invoice.updateOne(
		{ _id: invoiceId, dianStatus: "submitting" },
		{
			$set: {
				dianStatus: "failed",
				dianErrorCode: error instanceof AppError ? error.code : "DIAN_SUBMISSION_FAILED",
			},
		},
	);
}

// ─── Service ─────────────────────────────────────────────────────────────

export const DianService = {
	async getConfiguration(): Promise<DianConfigurationStatus> {
		const config = await loadDianConfiguration();
		if (!config) {
			return { status: "not_configured" };
		}
		const missingFields = getMissingConfigurationFields(config);
		if (missingFields.length > 0) {
			return { status: "invalid_configuration", missingFields };
		}
		return { status: "configured", configuration: toPublicConfiguration(config) };
	},

	async upsertConfiguration(
		input: DianConfigurationInput,
		userId: string,
	): Promise<DianConfigurationStatus> {
		const existing = await DianConfigurationModel.findOne({ singletonKey: "dian" }).select(
			"lastInvoiceNumber resolutionFrom",
		);
		const lastInvoiceNumber = existing
			? Math.max(existing.lastInvoiceNumber, input.resolutionFrom - 1)
			: input.resolutionFrom - 1;
		const config = await DianConfigurationModel.findOneAndUpdate(
			{ singletonKey: "dian" },
			{
				$set: {
					...input,
					lastInvoiceNumber,
					updatedBy: userId,
				},
				$setOnInsert: { singletonKey: "dian" },
			},
			{
				upsert: true,
				returnDocument: "after",
				runValidators: true,
				setDefaultsOnInsert: true,
			},
		).select("+softwarePin +technicalKey");
		if (!config) {
			throw new AppError(
				"No se pudo guardar la configuración DIAN",
				500,
				"DIAN_CONFIG_SAVE_FAILED",
			);
		}
		await createAuditLog({
			userId,
			action: "DIAN_CONFIGURATION_UPDATED",
			entity: "DianConfiguration",
			entityId: config._id.toString(),
			metadata: JSON.stringify({
				environment: config.environment,
				resolutionNumber: config.resolutionNumber,
				resolutionFrom: config.resolutionFrom,
				resolutionTo: config.resolutionTo,
			}),
		});
		return { status: "configured", configuration: toPublicConfiguration(config) };
	},

	/**
	 * Send an invoice to DIAN.
	 * Generates UBL XML, computes CUFE, and submits to DIAN web service.
	 */
	async sendInvoice(invoiceId: string, userId?: string) {
		const config = await loadDianConfiguration();
		assertDianConfigured(config);
		assertResolutionIsActive(config, new Date());
		if (config.environment === "production") {
			throw new AppError(
				"La pasarela DIAN de producción requiere certificado y firma XAdES configurados",
				503,
				"DIAN_PRODUCTION_GATEWAY_UNAVAILABLE",
			);
		}

		const invoice = await claimInvoiceForSubmission(invoiceId);
		try {
			const reservation = await reserveInvoiceNumber(config);
			const prepared = prepareDianInvoice(invoice, reservation.config, reservation.number);
			const dianResponse = submitDianInvoice(reservation.config, invoiceId, prepared);
			await persistDianSubmission(invoice, reservation.config, prepared, dianResponse, userId);

			return {
				invoiceId: invoice._id,
				invoiceNumber: invoice.invoiceNumber,
				cufe: prepared.cufe,
				status: invoice.status,
				dianStatus: invoice.dianStatus,
				documentHash: prepared.documentHash,
				dianResponse,
			};
		} catch (error) {
			const failure = error instanceof Error ? error : new Error(String(error));
			await markSubmissionFailed(invoiceId, failure);
			throw failure;
		}
	},

	/**
	 * Check the DIAN status of an electronic invoice.
	 */
	async checkInvoiceStatus(invoiceId: string, user: AuthClaims) {
		const invoice = await Invoice.findById(invoiceId);
		if (!invoice) {
			throw new AppError("Factura no encontrada", 404, "INVOICE_NOT_FOUND");
		}
		if (user.role === "cliente" && invoice.clientId.toString() !== user._id) {
			throw new ForbiddenError("No tiene acceso al estado DIAN de esta factura");
		}

		if (!invoice.cufe) {
			throw new AppError("La factura no ha sido enviada a DIAN", 400, "NO_DIAN_SENT");
		}

		const config = await loadDianConfiguration();
		assertDianConfigured(config);
		if (config.environment === "test") {
			return {
				cufe: invoice.cufe,
				status: invoice.dianStatus,
				description: "Documento aceptado por DIAN (modo prueba)",
				trackId: invoice.dianTrackId ?? "",
				timestamp: new Date().toISOString(),
			};
		}

		throw new AppError(
			"La consulta DIAN de producción requiere certificado y firma XAdES configurados",
			503,
			"DIAN_PRODUCTION_GATEWAY_UNAVAILABLE",
		);
	},

	/**
	 * Get electronic invoicing report for a date range.
	 */
	async getReport(from: Date, to: Date) {
		const invoices = await Invoice.find({
			issuedAt: { $gte: from, $lte: to },
			cufe: { $exists: true, $ne: "" },
		})
			.select(
				"code invoiceNumber cufe status dianStatus dianTrackId issuedAt clientName totalAmount",
			)
			.sort({ issuedAt: -1 })
			.lean();

		return {
			total: invoices.length,
			accepted: invoices.filter((i) => i.dianStatus === "accepted").length,
			rejected: invoices.filter((i) => i.dianStatus === "rejected").length,
			pending: invoices.filter((i) => i.dianStatus === "submitting").length,
			invoices,
		};
	},
};
