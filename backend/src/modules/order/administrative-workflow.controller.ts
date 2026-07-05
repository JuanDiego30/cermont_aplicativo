import type {
	ListDeliveryRecordsQuery,
	ListInvoicesQuery,
	ListPaymentsQuery,
	ListServiceEntrySheetsQuery,
	ListTechnicalReportsQuery,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { getString, requireUser } from "../../common/utils/request";
import * as ServiceCaseService from "../../modules/service-cases/service-case.service";
import * as CermontWorkflowGateService from "../../services/cermont-workflow-gate.service";
import * as WorkflowService from "./administrative-workflow.service";

type ListEnvelope<T> = {
	data: T[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};

function sendList<T>(res: Response, payload: ListEnvelope<T>): void {
	res.status(200).json({
		success: true,
		data: payload.data,
		meta: {
			total: payload.total,
			page: payload.page,
			limit: payload.limit,
			pages: payload.pages,
		},
	});
}

function actorFromRequest(req: Request) {
	const user = requireUser(req);
	return { _id: user._id, role: user.role };
}

export async function advanceServiceCaseByOrder(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const serviceCaseId = await ServiceCaseService.resolveServiceCaseIdForWorkOrder(
		String(req.params.id),
	);
	const result = await CermontWorkflowGateService.advanceServiceCaseStep(
		serviceCaseId,
		String(user._id),
		"ORDER_ADVANCE_STEP",
	);
	sendSuccess(res, result);
}

function optionalQueryString(value: Request["query"][string]): string | undefined {
	if (typeof value === "string" && value.length > 0) {
		return value;
	}
	if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
		return value[0];
	}
	return undefined;
}

function optionalQueryStringArray(value: Request["query"][string]): string[] | undefined {
	if (Array.isArray(value)) {
		const items = value.filter(
			(item): item is string => typeof item === "string" && item.length > 0,
		);
		return items.length > 0 ? items : undefined;
	}
	if (typeof value === "string" && value.length > 0) {
		return [value];
	}
	return undefined;
}

function queryNumber(value: Request["query"][string], fallback: number): number {
	const raw = optionalQueryString(value);
	if (!raw) {
		return fallback;
	}
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function technicalReportQuery(req: Request): ListTechnicalReportsQuery {
	return {
		workOrderId: optionalQueryString(req.query.workOrderId),
		executionSessionId: optionalQueryString(req.query.executionSessionId),
		status: optionalQueryString(req.query.status) as ListTechnicalReportsQuery["status"],
		page: queryNumber(req.query.page, 1),
		limit: queryNumber(req.query.limit, 20),
	};
}

function deliveryRecordQuery(req: Request): ListDeliveryRecordsQuery {
	return {
		workOrderId: optionalQueryString(req.query.workOrderId),
		technicalReportId: optionalQueryString(req.query.technicalReportId),
		status: optionalQueryString(req.query.status) as ListDeliveryRecordsQuery["status"],
		page: queryNumber(req.query.page, 1),
		limit: queryNumber(req.query.limit, 20),
	};
}

function serviceEntrySheetQuery(req: Request): ListServiceEntrySheetsQuery {
	return {
		status: optionalQueryStringArray(req.query.status) as ListServiceEntrySheetsQuery["status"],
		workOrderId: optionalQueryString(req.query.workOrderId),
		clientId: optionalQueryString(req.query.clientId),
		search: optionalQueryString(req.query.search),
		dateFrom: optionalQueryString(req.query.dateFrom),
		dateTo: optionalQueryString(req.query.dateTo),
		page: queryNumber(req.query.page, 1),
		limit: queryNumber(req.query.limit, 20),
	};
}

function invoiceQuery(req: Request): ListInvoicesQuery {
	return {
		status: optionalQueryStringArray(req.query.status) as ListInvoicesQuery["status"],
		workOrderId: optionalQueryString(req.query.workOrderId),
		clientId: optionalQueryString(req.query.clientId),
		search: optionalQueryString(req.query.search),
		dateFrom: optionalQueryString(req.query.dateFrom),
		dateTo: optionalQueryString(req.query.dateTo),
		page: queryNumber(req.query.page, 1),
		limit: queryNumber(req.query.limit, 20),
	};
}

function paymentQuery(req: Request): ListPaymentsQuery {
	return {
		invoiceId: optionalQueryString(req.query.invoiceId),
		workOrderId: optionalQueryString(req.query.workOrderId),
		clientId: optionalQueryString(req.query.clientId),
		status: optionalQueryString(req.query.status) as ListPaymentsQuery["status"],
		page: queryNumber(req.query.page, 1),
		limit: queryNumber(req.query.limit, 20),
	};
}

export async function listTechnicalReports(req: Request, res: Response): Promise<void> {
	const payload = await WorkflowService.listTechnicalReports(technicalReportQuery(req));
	sendList(res, payload);
}

export async function getTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.getTechnicalReportById(getString(req.params.id));
	res.status(200).json({ success: true, data: report });
}

export async function getTechnicalReportByOrder(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.getTechnicalReportByOrder(getString(req.params.id));
	res.status(200).json({ success: true, data: report });
}

export async function getTechnicalReportByExecutionSession(
	req: Request,
	res: Response,
): Promise<void> {
	const report = await WorkflowService.getTechnicalReportByExecutionSession(
		getString(req.params.id),
	);
	res.status(200).json({ success: true, data: report });
}

export async function createTechnicalReportFromExecutionSession(
	req: Request,
	res: Response,
): Promise<void> {
	const report = await WorkflowService.createTechnicalReportFromExecutionSession(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(201).json({ success: true, data: report });
}

export async function generateTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.generateTechnicalReport(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: report });
}

export async function updateTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.updateTechnicalReport(getString(req.params.id), req.body);
	res.status(200).json({ success: true, data: report });
}

export async function submitTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.submitTechnicalReport(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: report });
}

export async function approveTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.approveTechnicalReport(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: report });
}

export async function rejectTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.rejectTechnicalReport(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: report });
}

export async function cancelTechnicalReport(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.cancelTechnicalReport(getString(req.params.id));
	res.status(200).json({ success: true, data: report });
}

export async function attachTechnicalReportEvidence(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.attachTechnicalReportEvidence(
		getString(req.params.id),
		req.body.evidenceId,
	);
	res.status(200).json({ success: true, data: report });
}

export async function attachTechnicalReportDocument(req: Request, res: Response): Promise<void> {
	const report = await WorkflowService.attachTechnicalReportDocument(
		getString(req.params.id),
		req.body.documentId,
	);
	res.status(200).json({ success: true, data: report });
}

export async function listDeliveryRecords(req: Request, res: Response): Promise<void> {
	const payload = await WorkflowService.listDeliveryRecords(deliveryRecordQuery(req));
	sendList(res, payload);
}

export async function getDeliveryRecord(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.getDeliveryRecordById(getString(req.params.id));
	res.status(200).json({ success: true, data: record });
}

export async function getDeliveryRecordByOrder(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.getDeliveryRecordByOrder(getString(req.params.id));
	res.status(200).json({ success: true, data: record });
}

export async function createDeliveryRecordFromTechnicalReport(
	req: Request,
	res: Response,
): Promise<void> {
	const record = await WorkflowService.createDeliveryRecordFromTechnicalReport(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(201).json({ success: true, data: record });
}

export async function sendDeliveryRecord(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.sendDeliveryRecord(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: record });
}

export async function signDeliveryRecord(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.signDeliveryRecord(getString(req.params.id), req.body);
	res.status(200).json({ success: true, data: record });
}

export async function rejectDeliveryRecord(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.rejectDeliveryRecord(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: record });
}

export async function cancelDeliveryRecord(req: Request, res: Response): Promise<void> {
	const record = await WorkflowService.cancelDeliveryRecord(getString(req.params.id));
	res.status(200).json({ success: true, data: record });
}

export async function listServiceEntrySheets(req: Request, res: Response): Promise<void> {
	const payload = await WorkflowService.listServiceEntrySheets(serviceEntrySheetQuery(req));
	sendList(res, payload);
}

export async function getServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const ses = await WorkflowService.getServiceEntrySheetById(getString(req.params.id));
	res.status(200).json({ success: true, data: ses });
}

export async function getServiceEntrySheetByDeliveryRecord(
	req: Request,
	res: Response,
): Promise<void> {
	const ses = await WorkflowService.getServiceEntrySheetByDeliveryRecord(getString(req.params.id));
	res.status(200).json({ success: true, data: ses });
}

export async function createServiceEntrySheetFromDeliveryRecord(
	req: Request,
	res: Response,
): Promise<void> {
	const ses = await WorkflowService.createServiceEntrySheetFromDeliveryRecord(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(201).json({ success: true, data: ses });
}

export async function submitServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const ses = await WorkflowService.submitServiceEntrySheet(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: ses });
}

export async function approveServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const ses = await WorkflowService.approveServiceEntrySheet(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: ses });
}

export async function rejectServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const ses = await WorkflowService.rejectServiceEntrySheet(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: ses });
}

export async function cancelServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const ses = await WorkflowService.cancelServiceEntrySheet(getString(req.params.id));
	res.status(200).json({ success: true, data: ses });
}

export async function listInvoices(req: Request, res: Response): Promise<void> {
	const payload = await WorkflowService.listInvoices(invoiceQuery(req));
	sendList(res, payload);
}

export async function getInvoice(req: Request, res: Response): Promise<void> {
	const invoice = await WorkflowService.getInvoiceById(getString(req.params.id));
	res.status(200).json({ success: true, data: invoice });
}

export async function createInvoiceFromServiceEntrySheet(
	req: Request,
	res: Response,
): Promise<void> {
	const invoice = await WorkflowService.createInvoiceFromServiceEntrySheet(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(201).json({ success: true, data: invoice });
}

export async function submitInvoice(req: Request, res: Response): Promise<void> {
	const invoice = await WorkflowService.submitInvoice(
		getString(req.params.id),
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: invoice });
}

export async function approveInvoice(req: Request, res: Response): Promise<void> {
	const invoice = await WorkflowService.approveInvoice(
		getString(req.params.id),
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: invoice });
}

export async function rejectInvoice(req: Request, res: Response): Promise<void> {
	const invoice = await WorkflowService.rejectInvoice(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: invoice });
}

export async function cancelInvoice(req: Request, res: Response): Promise<void> {
	const invoice = await WorkflowService.cancelInvoice(getString(req.params.id));
	res.status(200).json({ success: true, data: invoice });
}

export async function listPayments(req: Request, res: Response): Promise<void> {
	const payload = await WorkflowService.listPayments(paymentQuery(req));
	sendList(res, payload);
}

export async function getPayment(req: Request, res: Response): Promise<void> {
	const payment = await WorkflowService.getPaymentById(getString(req.params.id));
	res.status(200).json({ success: true, data: payment });
}

export async function registerPaymentForInvoice(req: Request, res: Response): Promise<void> {
	const payment = await WorkflowService.registerPaymentForInvoice(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(201).json({ success: true, data: payment });
}

export async function reconcilePayment(req: Request, res: Response): Promise<void> {
	const payment = await WorkflowService.reconcilePayment(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: payment });
}

export async function rejectPayment(req: Request, res: Response): Promise<void> {
	const payment = await WorkflowService.rejectPayment(
		getString(req.params.id),
		req.body,
		actorFromRequest(req),
	);
	res.status(200).json({ success: true, data: payment });
}

export async function generateAutoDraftReport(req: Request, res: Response): Promise<void> {
	const { serviceCaseId } = req.params as { serviceCaseId: string };
	const actor = actorFromRequest(req);
	const report = await WorkflowService.generateAutoDraftReport(serviceCaseId, actor);
	res.status(200).json({ success: true, data: report });
}
