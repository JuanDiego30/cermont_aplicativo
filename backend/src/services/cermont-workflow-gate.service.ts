import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type DomainBlocker,
	mapLegacyServiceCaseStageToStep,
	type ServiceCaseStage,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../common/errors/AppError";
import { DeliveryRecord } from "../models/DeliveryRecord";
import { Document } from "../models/Document";
import { Evidence } from "../models/Evidence";
import { ExecutionSession, type ExecutionSessionDocument } from "../models/ExecutionSession";
import { Invoice } from "../models/Invoice";
import { Payment } from "../models/Payment";
import { PlanningPacket } from "../models/PlanningPacket";
import { ServiceCase, type ServiceCaseDocument } from "../models/ServiceCase";
import { ServiceEntrySheet } from "../models/ServiceEntrySheet";
import { User } from "../models/User";
import { createAuditLog } from "../modules/audit/audit.service";

const STEP_TO_STAGE_MAP: Record<CermontOperationalStepCode, ServiceCaseStage> = {
	step_01_work_request: "intake",
	step_02_site_visit: "assessment",
	step_03_proposal: "proposal",
	step_04_purchase_order: "authorization",
	step_05_planning: "planning",
	step_06_execution: "in_execution",
	step_07_technical_report: "technical_closure",
	step_08_delivery_record: "administrative_closure",
	step_09_client_signature: "administrative_closure",
	step_10_ses_submission: "ses_pending",
	step_11_ses_approval: "billing_pending",
	step_12_invoice_submission: "receivable_open",
	step_13_invoice_approval: "receivable_open",
	step_14_payment_closure: "paid",
};

type BlockerResolverContext = {
	orderId: Types.ObjectId | string;
	serviceCase: ServiceCaseDocument;
};

type BlockerResolver = (context: BlockerResolverContext) => Promise<DomainBlocker[]>;

function resolveCurrentStepCode(serviceCase: ServiceCaseDocument): CermontOperationalStepCode {
	return serviceCase.currentStepCode
		? (serviceCase.currentStepCode as CermontOperationalStepCode)
		: mapLegacyServiceCaseStageToStep(serviceCase.currentStage);
}

function assertValidServiceCaseId(serviceCaseId: string): void {
	if (!Types.ObjectId.isValid(serviceCaseId)) {
		throw new BadRequestError("INVALID_CASE_ID", "Invalid service case ID format");
	}
}

async function findServiceCaseOrThrow(serviceCaseId: string): Promise<ServiceCaseDocument> {
	const serviceCase = await ServiceCase.findById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("SERVICE_CASE_NOT_FOUND", "Service case not found");
	}

	return serviceCase;
}

function createBlocker(params: {
	artifactType: DomainBlocker["artifactType"];
	code: DomainBlocker["code"];
	field?: string;
	message: string;
	ownerRole: DomainBlocker["ownerRole"];
	recommendedAction: string;
	stepCode?: CermontOperationalStepCode;
}): DomainBlocker {
	return {
		...params,
		severity: "blocking",
	};
}

function createDocumentBlocker(params: {
	artifactType: DomainBlocker["artifactType"];
	field: string;
	message: string;
	ownerRole: DomainBlocker["ownerRole"];
	recommendedAction: string;
	stepCode: CermontOperationalStepCode;
}): DomainBlocker {
	return createBlocker({
		...params,
		code: "MISSING_STEP_REQUIRED_DOCUMENT",
	});
}

function createEvidenceBlocker(params: {
	artifactType: DomainBlocker["artifactType"];
	field: string;
	message: string;
	ownerRole: DomainBlocker["ownerRole"];
	recommendedAction: string;
	stepCode: CermontOperationalStepCode;
}): DomainBlocker {
	return createBlocker({
		...params,
		code: "MISSING_STEP_REQUIRED_EVIDENCE",
	});
}

function resolveOrderId(serviceCase: ServiceCaseDocument): Types.ObjectId | string {
	return serviceCase.artifacts.workOrder?.id || serviceCase._id;
}

async function countEvidenceByType(
	orderId: Types.ObjectId | string,
	type: "after" | "before" | "during",
): Promise<number> {
	return Evidence.countDocuments({
		orderId,
		type,
		deletedAt: null,
	});
}

async function findStepDocuments(
	serviceCase: ServiceCaseDocument,
	orderId: Types.ObjectId | string,
	stepCode: CermontOperationalStepCode,
) {
	return Document.find({
		targetStepCode: stepCode,
		$or: [
			{ linkedEntityId: serviceCase._id, linkedEntityType: "service_case" },
			{ order_id: orderId },
		],
	}).lean();
}

async function resolveWorkRequestBlockers({
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const wr = serviceCase.artifacts.workRequest;
	if (
		wr?.id &&
		(wr.status === "completed" || wr.status === "assigned" || wr.status === "in_progress")
	) {
		return [];
	}

	return [
		createDocumentBlocker({
			artifactType: "WorkRequest",
			field: "work_request",
			message: wr?.id
				? "La solicitud de servicio existe pero aún no está validada."
				: "Falta la solicitud de servicio registrada.",
			ownerRole: "residente",
			recommendedAction: wr?.id
				? "Validar y aprobar la solicitud de servicio."
				: "Registrar la solicitud de servicio.",
			stepCode: "step_01_work_request",
		}),
	];
}

async function resolveSiteVisitBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const blockers: DomainBlocker[] = [];
	const sv = serviceCase.artifacts.siteVisit;

	if (!sv?.id || sv.status !== "completed") {
		blockers.push(
			createDocumentBlocker({
				artifactType: "SiteVisit",
				field: "site_visit_report",
				message: sv?.id
					? "La visita técnica existe pero aún no está completada."
					: "Falta el reporte de visita técnica de sitio.",
				ownerRole: "residente",
				recommendedAction: sv?.id
					? "Completar y validar la visita técnica."
					: "Cargar el reporte de visita técnica.",
				stepCode: "step_02_site_visit",
			}),
		);
	}

	if ((await countEvidenceByType(orderId, "before")) === 0) {
		blockers.push(
			createEvidenceBlocker({
				artifactType: "SiteVisit",
				field: "before_photos",
				message: "Faltan fotos de evidencia del sitio antes de iniciar la obra.",
				ownerRole: "residente",
				recommendedAction: "Subir fotos de evidencia antes del inicio.",
				stepCode: "step_02_site_visit",
			}),
		);
	}

	return blockers;
}

async function resolveProposalBlockers({
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const p = serviceCase.artifacts.proposal;
	if (p?.id && p.status === "approved") {
		return [];
	}

	return [
		createDocumentBlocker({
			artifactType: "Proposal",
			field: "proposal_document",
			message: p?.id
				? "La propuesta existe pero aún no está aprobada."
				: "Falta la propuesta económica elaborada y guardada.",
			ownerRole: "residente",
			recommendedAction: p?.id
				? "Obtener aprobación del cliente para la propuesta."
				: "Elaborar y guardar la propuesta económica.",
			stepCode: "step_03_proposal",
		}),
	];
}

async function resolvePurchaseOrderBlockers({
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const po = serviceCase.artifacts.purchaseOrder;
	if (po?.id && po.status === "approved") {
		return [];
	}

	return [
		createDocumentBlocker({
			artifactType: "PurchaseOrderAuthorization",
			field: "purchase_order",
			message: po?.id
				? "La Orden de Compra existe pero aún no está aprobada."
				: "Falta la Orden de Compra (PO) aprobada y firmada por el cliente.",
			ownerRole: "gerente",
			recommendedAction: po?.id
				? "Obtener aprobación formal de la PO."
				: "Cargar la Orden de Compra aprobada.",
			stepCode: "step_04_purchase_order",
		}),
	];
}

async function resolvePlanningBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const pp = serviceCase.artifacts.planningPacket;
	const queryOrderId = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;
	const planningPacket = await PlanningPacket.findOne({ workOrderId: queryOrderId }).lean();

	const blockers: DomainBlocker[] = [];
	const hasPlanningPacket = pp?.id || planningPacket;

	if (!hasPlanningPacket) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "PlanningPacket",
				field: "planning_packet",
				message: "Falta el paquete de planeación de recursos asignados.",
				ownerRole: "residente",
				recommendedAction: "Cargar la planeación de recursos.",
				stepCode: "step_05_planning",
			}),
		);
		return blockers;
	}

	const status = planningPacket ? planningPacket.status : pp?.status;
	if (status !== "approved") {
		blockers.push(
			createDocumentBlocker({
				artifactType: "PlanningPacket",
				field: "planning_packet",
				message: "La planeación existe pero aún no está aprobada.",
				ownerRole: "residente",
				recommendedAction: "Aprobar el paquete de planeación.",
				stepCode: "step_05_planning",
			}),
		);
	}

	if (planningPacket) {
		if (!planningPacket.crew || planningPacket.crew.length === 0) {
			blockers.push(
				createBlocker({
					artifactType: "PlanningPacket",
					code: "MISSING_CREW_ASSIGNMENT",
					field: "crew",
					message: "Falta asignar el personal (crew) para la ejecución del servicio.",
					ownerRole: "residente",
					recommendedAction: "Asignar personal al crew de planeación.",
					stepCode: "step_05_planning",
				}),
			);
		}

		if (!planningPacket.tools || planningPacket.tools.length === 0) {
			blockers.push(
				createBlocker({
					artifactType: "PlanningPacket",
					code: "MISSING_TOOLS",
					field: "tools",
					message: "Falta registrar o asignar herramientas para la planeación.",
					ownerRole: "residente",
					recommendedAction: "Asignar herramientas al paquete de planeación.",
					stepCode: "step_05_planning",
				}),
			);
		}

		if (
			planningPacket.readinessChecklist &&
			planningPacket.readinessChecklist.length > 0 &&
			planningPacket.readinessChecklist.some((item: { checked?: boolean }) => !item.checked)
		) {
			blockers.push(
				createBlocker({
					artifactType: "PlanningPacket",
					code: "TEMPLATE_RESPONSE_NOT_VALIDATED",
					field: "readinessChecklist",
					message: "Existen elementos de la lista de chequeo de planeación pendientes por validar.",
					ownerRole: "residente",
					recommendedAction: "Completar todos los elementos de la lista de chequeo.",
					stepCode: "step_05_planning",
				}),
			);
		}
	}

	return blockers;
}

function pushSessionDetailBlockers(
	blockers: DomainBlocker[],
	executionSession: ExecutionSessionDocument | null,
) {
	if (!executionSession?.dynamicFormResponses.length) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "MISSING_DYNAMIC_FORM_RESPONSE",
				field: "execution_dynamic_form",
				message: "Falta diligenciar el formulario dinámico o checklist operativo de ejecución.",
				ownerRole: "supervisor",
				recommendedAction: "Completar el formulario operativo del paso 6.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if (!executionSession?.materialsUsed.length) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "MISSING_MATERIALS_USED",
				field: "materials_used",
				message: "Falta registrar los materiales consumidos durante la ejecución.",
				ownerRole: "supervisor",
				recommendedAction: "Registrar los materiales y cantidades usados en ejecución.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if (!executionSession?.laborEntries.length) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "MISSING_LABOR_TIME",
				field: "labor_entries",
				message: "Falta registrar el tiempo de mano de obra de la ejecución.",
				ownerRole: "supervisor",
				recommendedAction: "Registrar el tiempo de mano de obra por técnico en la sesión.",
				stepCode: "step_06_execution",
			}),
		);
	}
}

async function checkExecutionSessionBlockers(
	es: { id: string | Types.ObjectId; code?: string; status: string; updatedAt: Date } | null,
	orderId: string,
	executionSession: ExecutionSessionDocument | null,
	stepDocuments: Array<{ title: string }>,
): Promise<DomainBlocker[]> {
	const blockers: DomainBlocker[] = [];
	const hasAstDocument = stepDocuments.some((document) => /ast/i.test(document.title));
	const hasPtwDocument = stepDocuments.some((document) => /ptw|permiso/i.test(document.title));

	if (!es?.id || (es.status !== "completed" && es.status !== "finished")) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "ExecutionSession",
				field: "execution_session",
				message: es?.id
					? "La sesión de ejecución existe pero aún no está completada."
					: "Falta registrar la sesión de ejecución en campo.",
				ownerRole: "supervisor",
				recommendedAction: es?.id
					? "Completar la sesión de ejecución en campo."
					: "Registrar la sesión de ejecución en campo.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if (!hasAstDocument) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "ExecutionSession",
				field: "ast_document",
				message: "Falta el AST asociado a la ejecución.",
				ownerRole: "hes",
				recommendedAction: "Cargar el AST aprobado para la actividad.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if (!hasPtwDocument) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "ExecutionSession",
				field: "ptw_document",
				message: "Falta el permiso de trabajo o PTW de la ejecución.",
				ownerRole: "hes",
				recommendedAction: "Cargar el PTW o permiso de trabajo vigente.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if ((await countEvidenceByType(orderId, "during")) === 0) {
		blockers.push(
			createEvidenceBlocker({
				artifactType: "ExecutionSession",
				field: "during_photos",
				message: "Faltan fotos de evidencia del trabajo durante la ejecución.",
				ownerRole: "supervisor",
				recommendedAction: "Subir fotos de evidencia en ejecución.",
				stepCode: "step_06_execution",
			}),
		);
	}

	pushSessionDetailBlockers(blockers, executionSession);

	const session = executionSession as ExecutionSessionDocument & {
		incidents?: Array<{ resolved?: boolean }>;
		signatures?: Array<{ role?: string }>;
	};

	if (session?.incidents?.some((incident) => incident.resolved !== true)) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "CLOSING_PACKAGE_INCOMPLETE",
				field: "incidents",
				message: "Existen incidentes de ejecución sin resolver o sin cierre documentado.",
				ownerRole: "supervisor",
				recommendedAction: "Resolver incidentes abiertos antes de cerrar la ejecución.",
				stepCode: "step_06_execution",
			}),
		);
	}

	const signatureRoles = (session?.signatures || []).map((signature) =>
		String(signature.role || "").toLowerCase(),
	);
	if (!signatureRoles.some((role) => role.includes("tecnico"))) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "MISSING_TECHNICAL_SIGNATURE",
				field: "firma_tecnico",
				message: "Falta la firma técnica que respalda la ejecución realizada.",
				ownerRole: "tecnico",
				recommendedAction: "Registrar firma del técnico responsable.",
				stepCode: "step_06_execution",
			}),
		);
	}

	if (!signatureRoles.some((role) => role.includes("supervisor"))) {
		blockers.push(
			createBlocker({
				artifactType: "ExecutionSession",
				code: "MISSING_SUPERVISOR_SIGNATURE",
				field: "firma_supervisor",
				message: "Falta la validación o firma del supervisor del servicio.",
				ownerRole: "supervisor",
				recommendedAction: "Registrar firma de supervisor antes de avanzar al informe.",
				stepCode: "step_06_execution",
			}),
		);
	}

	return blockers;
}

async function resolveExecutionBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const es = serviceCase.artifacts.executionSession;
	const executionSession = await ExecutionSession.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "cancelled" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_06_execution");

	return checkExecutionSessionBlockers(
		es as { id: string | Types.ObjectId; code?: string; status: string; updatedAt: Date } | null,
		String(orderId),
		executionSession,
		stepDocuments,
	);
}

async function resolveTechnicalReportBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const blockers: DomainBlocker[] = [];
	const tr = serviceCase.artifacts.technicalReport;

	if (!tr?.id || tr.status !== "approved") {
		blockers.push(
			createDocumentBlocker({
				artifactType: "TechnicalReport",
				field: "technical_report",
				message: tr?.id
					? "El informe técnico existe pero aún no está aprobado."
					: "Falta el informe técnico final estructurado.",
				ownerRole: "residente",
				recommendedAction: tr?.id
					? "Aprobar el informe técnico final."
					: "Cargar el informe técnico final.",
				stepCode: "step_07_technical_report",
			}),
		);
	}

	if ((await countEvidenceByType(orderId, "after")) === 0) {
		blockers.push(
			createEvidenceBlocker({
				artifactType: "TechnicalReport",
				field: "after_photos",
				message: "Faltan fotos de evidencia de los acabados finales (después).",
				ownerRole: "residente",
				recommendedAction: "Subir fotos de evidencia después del trabajo.",
				stepCode: "step_07_technical_report",
			}),
		);
	}

	return blockers;
}

async function resolveDeliveryRecordBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_08_delivery_record");
	if (serviceCase.artifacts.deliveryRecord?.id || stepDocuments.length > 0) {
		return [];
	}

	return [
		createDocumentBlocker({
			artifactType: "DeliveryRecord",
			field: "delivery_record",
			message: "Falta generar el acta de entrega formal.",
			ownerRole: "residente",
			recommendedAction: "Generar el acta de entrega formal.",
			stepCode: "step_08_delivery_record",
		}),
	];
}

async function resolveClientSignatureBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const signedRecord = await DeliveryRecord.findOne({
		workOrderId: orderId,
		status: "signed",
	});
	const signatureDocuments = await findStepDocuments(
		serviceCase,
		orderId,
		"step_09_client_signature",
	);
	if (signedRecord || signatureDocuments.length > 0) {
		return [];
	}

	return [
		createDocumentBlocker({
			artifactType: "DeliveryRecord",
			field: "signed_delivery_record",
			message: "Falta el acta de entrega firmada formalmente por el cliente.",
			ownerRole: "residente",
			recommendedAction: "Cargar el acta de entrega firmada.",
			stepCode: "step_09_client_signature",
		}),
	];
}

async function resolveSesSubmissionBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const ses = serviceCase.artifacts.serviceEntrySheet;
	const sesRecord = await ServiceEntrySheet.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "cancelled" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_10_ses_submission");
	const blockers: DomainBlocker[] = [];

	const sesIsSubmitted =
		(ses?.id && (ses.status === "submitted" || ses.status === "approved")) ||
		sesRecord?.status === "submitted" ||
		sesRecord?.status === "approved";

	if (!sesIsSubmitted) {
		blockers.push(
			createBlocker({
				artifactType: "ServiceEntrySheet",
				code: "SES_NOT_CREATED",
				field: "service_entry_sheet",
				message: "Falta crear o radicar la SES en Ariba.",
				ownerRole: "administrativo",
				recommendedAction: "Crear y radicar la SES asociada al caso.",
				stepCode: "step_10_ses_submission",
			}),
		);
	}

	if (!stepDocuments.length) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "ServiceEntrySheet",
				field: "ses_receipt",
				message: "Falta el soporte documental de radicación SES.",
				ownerRole: "administrativo",
				recommendedAction: "Cargar el comprobante o recibo de radicación SES.",
				stepCode: "step_10_ses_submission",
			}),
		);
	}

	return blockers;
}

async function resolveSesApprovalBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const sesRecord = await ServiceEntrySheet.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "cancelled" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_11_ses_approval");
	const blockers: DomainBlocker[] = [];
	const sesApproved =
		(serviceCase.artifacts.serviceEntrySheet?.id &&
			serviceCase.artifacts.serviceEntrySheet.status === "approved") ||
		sesRecord?.status === "approved";
	if (!sesApproved) {
		blockers.push(
			createBlocker({
				artifactType: "ServiceEntrySheet",
				code: "SES_NOT_APPROVED",
				field: "service_entry_sheet_approval",
				message: "La hoja de entrada de servicio (SES) aún no ha sido aprobada por el cliente.",
				ownerRole: "administrativo",
				recommendedAction: "Verificar y aprobar la SES radicada.",
				stepCode: "step_11_ses_approval",
			}),
		);
	}

	if (!stepDocuments.length) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "ServiceEntrySheet",
				field: "ses_approval_document",
				message: "Falta el soporte documental de aprobación SES.",
				ownerRole: "administrativo",
				recommendedAction: "Cargar el documento o evidencia de aprobación SES.",
				stepCode: "step_11_ses_approval",
			}),
		);
	}

	return blockers;
}

async function resolveInvoiceSubmissionBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const inv = serviceCase.artifacts.invoice;
	const invoiceRecord = await Invoice.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "cancelled" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_12_invoice_submission");
	const blockers: DomainBlocker[] = [];

	const invoiceWasSent =
		(inv?.id &&
			(inv.status === "sent" ||
				inv.status === "submitted" ||
				inv.status === "approved" ||
				inv.status === "accepted" ||
				inv.status === "paid")) ||
		invoiceRecord?.status === "sent" ||
		invoiceRecord?.status === "submitted" ||
		invoiceRecord?.status === "approved" ||
		invoiceRecord?.status === "accepted" ||
		invoiceRecord?.status === "paid";

	if (!invoiceWasSent) {
		blockers.push(
			createBlocker({
				artifactType: "Invoice",
				code: "INVOICE_NOT_CREATED",
				field: "invoice",
				message: "Falta emitir y enviar la factura de venta correspondiente.",
				ownerRole: "administrativo",
				recommendedAction: "Crear y enviar la factura de venta.",
				stepCode: "step_12_invoice_submission",
			}),
		);
	}

	if (!stepDocuments.length) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "Invoice",
				field: "invoice_document",
				message: "Falta el soporte documental de envío o emisión de factura.",
				ownerRole: "administrativo",
				recommendedAction: "Cargar la factura enviada al cliente.",
				stepCode: "step_12_invoice_submission",
			}),
		);
	}

	return blockers;
}

async function resolveInvoiceApprovalBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const invoiceRecord = await Invoice.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "cancelled" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_13_invoice_approval");
	const blockers: DomainBlocker[] = [];
	const invoiceApproved =
		(serviceCase.artifacts.invoice?.id &&
			(serviceCase.artifacts.invoice.status === "approved" ||
				serviceCase.artifacts.invoice.status === "accepted" ||
				serviceCase.artifacts.invoice.status === "paid")) ||
		invoiceRecord?.status === "approved" ||
		invoiceRecord?.status === "accepted" ||
		invoiceRecord?.status === "paid";

	if (!invoiceApproved) {
		blockers.push(
			createBlocker({
				artifactType: "Invoice",
				code: "INVOICE_NOT_APPROVED",
				field: "invoice_approval",
				message: "La factura de venta aún no ha sido aprobada para pago.",
				ownerRole: "administrativo",
				recommendedAction: "Obtener la aprobación de la factura para pago.",
				stepCode: "step_13_invoice_approval",
			}),
		);
	}

	if (!stepDocuments.length) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "Invoice",
				field: "invoice_approval_document",
				message: "Falta el soporte documental de aprobación de factura.",
				ownerRole: "administrativo",
				recommendedAction: "Cargar el soporte o correo de aprobación de factura.",
				stepCode: "step_13_invoice_approval",
			}),
		);
	}

	return blockers;
}

async function resolvePaymentClosureBlockers({
	orderId,
	serviceCase,
}: BlockerResolverContext): Promise<DomainBlocker[]> {
	const paymentRecord = await Payment.findOne({
		$or: [{ workOrderId: orderId }, { serviceCaseId: serviceCase._id }],
		status: { $ne: "rejected" },
	}).lean();
	const stepDocuments = await findStepDocuments(serviceCase, orderId, "step_14_payment_closure");
	const blockers: DomainBlocker[] = [];

	const paymentReconciled =
		(serviceCase.artifacts.payment?.id && serviceCase.artifacts.payment.status === "reconciled") ||
		paymentRecord?.status === "reconciled";

	if (!paymentReconciled) {
		blockers.push(
			createBlocker({
				artifactType: "Payment",
				code: "PAYMENT_NOT_RECONCILED",
				field: "payment_reconciliation",
				message: "El pago final del servicio no ha sido conciliado en cuentas bancarias.",
				ownerRole: "administrativo",
				recommendedAction: "Subir comprobante de pago y conciliar cuenta.",
				stepCode: "step_14_payment_closure",
			}),
		);
	}

	if (!stepDocuments.length) {
		blockers.push(
			createDocumentBlocker({
				artifactType: "Payment",
				field: "payment_voucher",
				message: "Falta el comprobante documental del pago recibido.",
				ownerRole: "administrativo",
				recommendedAction: "Cargar comprobante o soporte bancario del pago.",
				stepCode: "step_14_payment_closure",
			}),
		);
	}

	if (!paymentRecord?.supportingDocumentUrl && !stepDocuments.length) {
		blockers.push(
			createEvidenceBlocker({
				artifactType: "Payment",
				field: "bank_statement",
				message: "Falta la evidencia bancaria para soportar la conciliación final.",
				ownerRole: "administrativo",
				recommendedAction: "Adjuntar extracto o soporte bancario del pago.",
				stepCode: "step_14_payment_closure",
			}),
		);
	}

	return blockers;
}

const STEP_BLOCKER_RESOLVERS: Record<CermontOperationalStepCode, BlockerResolver> = {
	step_01_work_request: resolveWorkRequestBlockers,
	step_02_site_visit: resolveSiteVisitBlockers,
	step_03_proposal: resolveProposalBlockers,
	step_04_purchase_order: resolvePurchaseOrderBlockers,
	step_05_planning: resolvePlanningBlockers,
	step_06_execution: resolveExecutionBlockers,
	step_07_technical_report: resolveTechnicalReportBlockers,
	step_08_delivery_record: resolveDeliveryRecordBlockers,
	step_09_client_signature: resolveClientSignatureBlockers,
	step_10_ses_submission: resolveSesSubmissionBlockers,
	step_11_ses_approval: resolveSesApprovalBlockers,
	step_12_invoice_submission: resolveInvoiceSubmissionBlockers,
	step_13_invoice_approval: resolveInvoiceApprovalBlockers,
	step_14_payment_closure: resolvePaymentClosureBlockers,
};

async function calculateBlockersForServiceCase(
	serviceCase: ServiceCaseDocument,
): Promise<DomainBlocker[]> {
	const currentStepCode = resolveCurrentStepCode(serviceCase);
	const resolver = STEP_BLOCKER_RESOLVERS[currentStepCode];

	return resolver({
		orderId: resolveOrderId(serviceCase),
		serviceCase,
	});
}

/**
 * Calculates all current blockers for a service case's active step.
 */
export async function calculateStepBlockers(serviceCaseId: string): Promise<DomainBlocker[]> {
	assertValidServiceCaseId(serviceCaseId);
	const serviceCase = await findServiceCaseOrThrow(serviceCaseId);
	return calculateBlockersForServiceCase(serviceCase);
}

/**
 * Checks whether the service case is cleared to advance to the next step.
 */
export async function canAdvanceToNextStep(
	serviceCaseId: string,
): Promise<{ canAdvance: boolean; blockers: DomainBlocker[] }> {
	const blockers = await calculateStepBlockers(serviceCaseId);
	const hasCriticalBlockers = blockers.some((blocker) => blocker.severity === "blocking");

	return {
		canAdvance: !hasCriticalBlockers,
		blockers,
	};
}

/**
 * Validates if the service case has met all requirements for a specific step (used for details validation API)
 */
export async function validateStepReadiness(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
): Promise<{ canAdvance: boolean; missingRequirements: string[]; blockers: DomainBlocker[] }> {
	assertValidServiceCaseId(serviceCaseId);
	const serviceCase = await findServiceCaseOrThrow(serviceCaseId);
	const currentStepCode = resolveCurrentStepCode(serviceCase);

	const step = CERMONT_OPERATIONAL_STEPS.find((current) => current.code === stepCode);
	if (!step) {
		throw new BadRequestError("INVALID_STEP_CODE", `Invalid step code: ${stepCode}`);
	}

	const currentStep = CERMONT_OPERATIONAL_STEPS.find((current) => current.code === currentStepCode);
	const currentStepNumber = currentStep ? currentStep.stepNumber : 1;

	if (step.stepNumber < currentStepNumber) {
		return { canAdvance: true, missingRequirements: [], blockers: [] };
	}

	if (step.stepNumber === currentStepNumber) {
		const blockers = await calculateBlockersForServiceCase(serviceCase);
		return {
			canAdvance: blockers.length === 0,
			missingRequirements: blockers.map((blocker) => blocker.message),
			blockers,
		};
	}

	return {
		canAdvance: false,
		missingRequirements: ["Paso futuro no alcanzado"],
		blockers: [
			createDocumentBlocker({
				artifactType: "WorkRequest",
				field: "workflow_sequence",
				message: "Paso futuro no alcanzado",
				ownerRole: "residente",
				recommendedAction: "Completar los pasos previos primero.",
				stepCode: stepCode,
			}),
		],
	};
}

/**
 * Advances the active operational step of a service case.
 */
export async function advanceServiceCaseStep(
	serviceCaseId: string,
	userId: string,
	command: string,
): Promise<ServiceCaseDocument> {
	assertValidServiceCaseId(serviceCaseId);
	const serviceCase = await findServiceCaseOrThrow(serviceCaseId);
	const currentStepCode = resolveCurrentStepCode(serviceCase);
	const blockers = await calculateBlockersForServiceCase(serviceCase);

	if (blockers.some((blocker) => blocker.severity === "blocking")) {
		throw new BadRequestError(
			`Cannot advance step due to active blockers: ${blockers.map((blocker) => blocker.message).join(", ")}`,
			"STEP_TRANSITION_BLOCKED",
			blockers,
		);
	}

	const currentIndex = CERMONT_OPERATIONAL_STEPS.findIndex((step) => step.code === currentStepCode);
	if (currentIndex === -1) {
		throw new BadRequestError("INVALID_STEP_CODE", "Active step code is invalid");
	}

	if (currentIndex === CERMONT_OPERATIONAL_STEPS.length - 1) {
		throw new BadRequestError(
			"FINAL_STEP_REACHED",
			"The service case is already in the final step",
		);
	}

	const nextStep = CERMONT_OPERATIONAL_STEPS[currentIndex + 1];
	const nextStage = STEP_TO_STAGE_MAP[nextStep.code];
	const previousStepCode = currentStepCode;

	serviceCase.currentStepCode = nextStep.code;
	serviceCase.currentStage = nextStage;

	const actor = await User.findById(userId);
	const actorRole = actor ? actor.role : "supervisor";

	serviceCase.timeline.push({
		eventId: `evt_${Date.now()}`,
		stage: nextStage,
		command,
		occurredAt: new Date(),
		actorId: new Types.ObjectId(userId),
		actorRole,
		notes: `Advanced operational step from ${previousStepCode} to ${nextStep.code}`,
	});

	const newBlockers = await calculateBlockersForServiceCase(serviceCase);
	serviceCase.blockers = newBlockers.map((blocker) => ({ ...blocker }));

	await serviceCase.save();

	await createAuditLog({
		userId,
		entity: "ServiceCase",
		entityId: serviceCase._id.toString(),
		action: "SERVICE_CASE_STEP_ADVANCED",
		after: {
			previousStepCode,
			newStepCode: nextStep.code,
			newStage: nextStage,
		},
	});

	return serviceCase;
}
