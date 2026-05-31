"use client";

import type {
	CermontOperationalStepCode,
	ClosureReport,
	Invoice,
	Payment,
	ServiceEntrySheet,
} from "@cermont/shared-types";
import type { LucideIcon } from "lucide-react";
import {
	ArrowRight,
	Banknote,
	FileCheck2,
	FileText,
	Loader2,
	PlusCircle,
	Receipt,
	UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format-date";
import {
	useCreateDeliveryRecordFromTechnicalReport,
	useInvoicesList,
	useOrderDeliveryRecord,
	useOrderTechnicalReport,
	usePaymentsList,
	useServiceEntrySheetsList,
} from "@/modules/billing/queries";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import {
	type AdministrativeWorkflowCardStatus,
	administrativeWorkflowStatusLabel,
	administrativeWorkflowStatusTone,
	hasDeliveryRecord,
	hasTechnicalReport,
	resolveGroupedRequirementMessage,
	resolveGroupedRequirementStatus,
} from "./order-administrative-workflow";

interface OrderAdministrativeWorkflowLaneProps {
	closureReport?: ClosureReport;
	orderId: string;
}

function hasValue(value: string | undefined): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function joinDetails(details: Array<string | undefined>): string {
	return details.filter(hasValue).join(" · ");
}

function pluralizeRecords(
	total: number | undefined,
	singular: string,
	plural: string,
): string | undefined {
	if (typeof total !== "number" || total <= 1) {
		return;
	}

	return `${total} ${total === 1 ? singular : plural} vinculados a esta OT.`;
}

function canInvoiceProceed(status: ServiceEntrySheet["status"] | undefined): boolean {
	return status === "approved";
}

function canPaymentProceed(status: Invoice["status"] | undefined): boolean {
	return (
		status === "approved" ||
		status === "accepted" ||
		status === "partially_paid" ||
		status === "paid"
	);
}

export function OrderAdministrativeWorkflowLane({
	closureReport,
	orderId,
}: OrderAdministrativeWorkflowLaneProps) {
	const { push } = useRouter();
	const technicalReportQuery = useOrderTechnicalReport(orderId);
	const deliveryRecordQuery = useOrderDeliveryRecord(orderId);
	const serviceEntrySheetQuery = useServiceEntrySheetsList({ workOrderId: orderId, limit: 5 });
	const invoiceQuery = useInvoicesList({ workOrderId: orderId, limit: 5 });
	const paymentQuery = usePaymentsList({ workOrderId: orderId, limit: 5 });

	const technicalReport = technicalReportQuery.data;
	const deliveryReadModel = deliveryRecordQuery.data;
	const deliveryRecord = hasDeliveryRecord(deliveryReadModel) ? deliveryReadModel : void 0;
	const latestServiceEntrySheet = serviceEntrySheetQuery.data?.items[0];
	const latestInvoice = invoiceQuery.data?.items[0];
	const latestPayment = paymentQuery.data?.items[0];
	const createDeliveryRecord = useCreateDeliveryRecordFromTechnicalReport(
		hasTechnicalReport(technicalReport) ? technicalReport._id : "",
	);

	const isLoadingAdministrativeFlow =
		technicalReportQuery.isLoading &&
		deliveryRecordQuery.isLoading &&
		serviceEntrySheetQuery.isLoading &&
		invoiceQuery.isLoading &&
		paymentQuery.isLoading;

	const canCreateDeliveryFromOrder =
		hasTechnicalReport(technicalReport) &&
		technicalReport.status === "approved" &&
		deliveryRecord === void 0;

	const handleCreateDeliveryRecord = async () => {
		if (!hasTechnicalReport(technicalReport)) {
			return;
		}

		try {
			const response = await createDeliveryRecord.mutateAsync({});
			if (!response.data) {
				throw new Error("Could not create the delivery record");
			}
			toast.success("Delivery record created");
			push(`/delivery-records/${response.data._id}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not create the delivery record");
		}
	};

	if (isLoadingAdministrativeFlow) {
		return <AdministrativeWorkflowLaneSkeleton />;
	}

	return (
		<section
			aria-label="Administrative chain for the work order"
			className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
		>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Administrative chain
					</h3>
					<p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
						Track delivery record, SES, invoice, and payment from the same order without losing
						document support.
					</p>
				</div>
				<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">OT {orderId}</p>
			</div>

			<div className="mt-4 grid gap-3 xl:grid-cols-2">
				<AdministrativeWorkflowCard
					description={resolveDeliveryDescription({
						canCreateDeliveryFromOrder,
						deliveryRecord,
						groupedMessage: resolveGroupedRequirementMessage(closureReport, [
							"acta_delivery",
							"client_signature",
						]),
						technicalReport,
					})}
					icon={FileText}
					orderId={orderId}
					primaryAction={
						deliveryRecord ? (
							<WorkflowLink
								href={`/delivery-records/${deliveryRecord._id}`}
								label="Open delivery record"
							/>
						) : canCreateDeliveryFromOrder ? (
							<WorkflowButton
								label={
									createDeliveryRecord.isPending
										? "Creating delivery record..."
										: "Create delivery record"
								}
								icon={createDeliveryRecord.isPending ? Loader2 : PlusCircle}
								onClick={handleCreateDeliveryRecord}
								pending={createDeliveryRecord.isPending}
							/>
						) : (
							false
						)
					}
					status={resolveGroupedRequirementStatus(closureReport, [
						"acta_delivery",
						"client_signature",
					])}
					supportDescription="Attach the signed record, client approval, or closeout observations."
					supportStepCode={
						deliveryRecord?.status === "signed"
							? "step_09_client_signature"
							: "step_08_delivery_record"
					}
					supportTitle="Attach delivery or signature support"
					title="Delivery record and client sign-off"
					value={deliveryRecord?.code ?? "No linked delivery record"}
				/>

				<AdministrativeWorkflowCard
					description={resolveSESDescription({
						deliveryRecordStatus: deliveryRecord?.status,
						groupedMessage: resolveGroupedRequirementMessage(closureReport, [
							"ses_filing",
							"ses_approval",
						]),
						recordCount: serviceEntrySheetQuery.data?.total,
						serviceEntrySheet: latestServiceEntrySheet,
					})}
					icon={FileCheck2}
					orderId={orderId}
					primaryAction={
						latestServiceEntrySheet ? (
							<WorkflowLink href={`/billing/ses/${latestServiceEntrySheet._id}`} label="Open SES" />
						) : (
							<WorkflowLink
								href={`/billing/ses?workOrderId=${encodeURIComponent(orderId)}`}
								label="View order SES"
							/>
						)
					}
					status={resolveGroupedRequirementStatus(closureReport, ["ses_filing", "ses_approval"])}
					supportDescription="Attach Ariba filing evidence, approval proof, and contract attachments."
					supportStepCode={
						latestServiceEntrySheet?.status === "approved"
							? "step_11_ses_approval"
							: "step_10_ses_submission"
					}
					supportTitle="Attach SES support"
					title="SES / Ariba"
					value={latestServiceEntrySheet?.code ?? "No linked SES"}
				/>

				<AdministrativeWorkflowCard
					description={resolveInvoiceDescription({
						groupedMessage: resolveGroupedRequirementMessage(closureReport, [
							"invoice_sent",
							"invoice_approval",
						]),
						invoice: latestInvoice,
						recordCount: invoiceQuery.data?.total,
						serviceEntrySheetStatus: latestServiceEntrySheet?.status,
					})}
					icon={Receipt}
					orderId={orderId}
					primaryAction={
						latestInvoice ? (
							<WorkflowLink href={`/billing/invoices/${latestInvoice._id}`} label="Open invoice" />
						) : (
							<WorkflowLink
								href={`/billing/invoices?workOrderId=${encodeURIComponent(orderId)}`}
								label="View invoicing"
							/>
						)
					}
					status={resolveGroupedRequirementStatus(closureReport, [
						"invoice_sent",
						"invoice_approval",
					])}
					supportDescription="Attach the issued invoice, approval proof, and collection support."
					supportStepCode={
						latestInvoice &&
						(latestInvoice.status === "approved" ||
							latestInvoice.status === "accepted" ||
							latestInvoice.status === "paid")
							? "step_13_invoice_approval"
							: "step_12_invoice_submission"
					}
					supportTitle="Attach invoice support"
					title="Factura"
					value={latestInvoice?.invoiceNumber ?? latestInvoice?.code ?? "No linked invoice"}
				/>

				<AdministrativeWorkflowCard
					description={resolvePaymentDescription({
						groupedMessage: resolveGroupedRequirementMessage(closureReport, ["payment_support"]),
						invoiceStatus: latestInvoice?.status,
						payment: latestPayment,
						recordCount: paymentQuery.data?.total,
					})}
					icon={Banknote}
					orderId={orderId}
					primaryAction={
						latestPayment ? (
							<WorkflowLink href={`/payments/${latestPayment._id}`} label="Open payment" />
						) : (
							<WorkflowLink
								href={`/payments?workOrderId=${encodeURIComponent(orderId)}`}
								label="View order payments"
							/>
						)
					}
					status={resolveGroupedRequirementStatus(closureReport, ["payment_support"])}
					supportDescription="Attach bank support, payment proof, and reconciliation evidence."
					supportStepCode="step_14_payment_closure"
					supportTitle="Attach payment support"
					title="Payment and reconciliation"
					value={latestPayment?.paymentReference ?? "No reconciled payment"}
				/>
			</div>
		</section>
	);
}

function resolveDeliveryDescription({
	canCreateDeliveryFromOrder,
	deliveryRecord,
	groupedMessage,
	technicalReport,
}: {
	canCreateDeliveryFromOrder: boolean;
	deliveryRecord?: { signedAt?: string; status: string };
	groupedMessage?: string | undefined;
	technicalReport?: { approvedAt?: string; generatedAt?: string; status: string };
}): string {
	if (deliveryRecord) {
		return (
			joinDetails([
				`Status ${deliveryRecord.status}`,
				deliveryRecord.signedAt
					? `Signed ${formatDate(deliveryRecord.signedAt, "dd MMM yyyy HH:mm")}`
					: void 0,
				groupedMessage,
			]) || "Delivery record linked to this order."
		);
	}

	if (canCreateDeliveryFromOrder) {
		return "The technical report is already approved. Create the delivery record here and continue with client sign-off.";
	}

	if (technicalReport && technicalReport.status !== "not_created") {
		return (
			joinDetails([
				`Technical report status ${technicalReport.status}`,
				technicalReport.approvedAt
					? `Approved ${formatDate(technicalReport.approvedAt, "dd MMM yyyy HH:mm")}`
					: technicalReport.generatedAt
						? `Generated ${formatDate(technicalReport.generatedAt, "dd MMM yyyy HH:mm")}`
						: void 0,
				groupedMessage,
			]) || "Approve the technical report before creating the delivery record."
		);
	}

	return groupedMessage ?? "No approved technical report is linked to this order yet.";
}

function resolveSESDescription({
	deliveryRecordStatus,
	groupedMessage,
	recordCount,
	serviceEntrySheet,
}: {
	deliveryRecordStatus?: string;
	groupedMessage?: string | undefined;
	recordCount?: number;
	serviceEntrySheet?: ServiceEntrySheet;
}): string {
	if (serviceEntrySheet) {
		return (
			joinDetails([
				`Status ${serviceEntrySheet.status}`,
				serviceEntrySheet.aribaDocumentNumber
					? `Ariba ${serviceEntrySheet.aribaDocumentNumber}`
					: void 0,
				pluralizeRecords(recordCount, "SES record", "SES records"),
				groupedMessage,
			]) || "SES linked to this order."
		);
	}

	if (deliveryRecordStatus === "signed") {
		return (
			groupedMessage ??
			"The delivery record is already signed. Continue SES filing and approval from billing or attach the external support."
		);
	}

	return groupedMessage ?? "SES depends on a client-signed delivery record.";
}

function resolveInvoiceDescription({
	groupedMessage,
	invoice,
	recordCount,
	serviceEntrySheetStatus,
}: {
	groupedMessage?: string | undefined;
	invoice?: Invoice;
	recordCount?: number;
	serviceEntrySheetStatus?: ServiceEntrySheet["status"];
}): string {
	if (invoice) {
		return (
			joinDetails([
				`Status ${invoice.status}`,
				invoice.dueDate ? `Due ${formatDate(invoice.dueDate, "dd MMM yyyy")}` : void 0,
				pluralizeRecords(recordCount, "invoice", "invoices"),
				groupedMessage,
			]) || "Invoice linked to this order."
		);
	}

	if (canInvoiceProceed(serviceEntrySheetStatus)) {
		return (
			groupedMessage ??
			"The SES is already approved. Continue billing from the invoicing module or attach the issued support."
		);
	}

	return groupedMessage ?? "Invoice issuance depends on an approved SES.";
}

function resolvePaymentDescription({
	groupedMessage,
	invoiceStatus,
	payment,
	recordCount,
}: {
	groupedMessage?: string | undefined;
	invoiceStatus?: Invoice["status"];
	payment?: Payment;
	recordCount?: number;
}): string {
	if (payment) {
		return (
			joinDetails([
				`Status ${payment.status}`,
				payment.paidAt ? `Paid ${formatDate(payment.paidAt, "dd MMM yyyy HH:mm")}` : void 0,
				pluralizeRecords(recordCount, "payment", "payments"),
				groupedMessage,
			]) || "Payment linked to this order."
		);
	}

	if (canPaymentProceed(invoiceStatus)) {
		return (
			groupedMessage ??
			"The invoice is far enough along to register or reconcile payment and attach banking support."
		);
	}

	return groupedMessage ?? "Payment reconciliation depends on an approved invoice.";
}

function AdministrativeWorkflowCard({
	description,
	icon: Icon,
	orderId,
	primaryAction,
	status,
	supportDescription,
	supportStepCode,
	supportTitle,
	title,
	value,
}: {
	description: string;
	icon: LucideIcon;
	orderId: string;
	primaryAction?: ReactNode;
	status: AdministrativeWorkflowCardStatus;
	supportDescription: string;
	supportStepCode: CermontOperationalStepCode;
	supportTitle: string;
	title: string;
	value: string;
}) {
	return (
		<article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
						<Icon className="size-4" aria-hidden="true" />
					</div>
					<div>
						<p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
						<p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{value}</p>
					</div>
				</div>
				<span
					className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${administrativeWorkflowStatusTone(status)}`}
				>
					{administrativeWorkflowStatusLabel(status)}
				</span>
			</div>

			<p className="mt-4 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{description}</p>

			<div className="mt-4 flex flex-wrap gap-2">
				{primaryAction}
				<ContextualDocumentUploadModal
					defaultOrderId={orderId}
					defaultPurpose="closing_evidence"
					defaultStepCode={supportStepCode}
					description={supportDescription}
					title={supportTitle}
				>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
					>
						<UploadCloud className="size-4" aria-hidden="true" />
						Attach support
					</button>
				</ContextualDocumentUploadModal>
			</div>
		</article>
	);
}

function WorkflowLink({ href, label }: { href: string; label: string }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			{label}
			<ArrowRight className="size-4" aria-hidden="true" />
		</Link>
	);
}

function WorkflowButton({
	icon: Icon,
	label,
	onClick,
	pending,
}: {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	pending?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={pending}
			className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
		>
			<Icon className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
			{label}
		</button>
	);
}

function AdministrativeWorkflowLaneSkeleton() {
	const skeletonItems = Array.from({ length: 4 }, (_, index) => `workflow-skeleton-${index}`);

	return (
		<section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
			<div className="h-5 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
			<div className="mt-2 h-4 w-80 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
			<div className="mt-4 grid gap-3 xl:grid-cols-2">
				{skeletonItems.map((item) => (
					<div
						key={item}
						className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
					/>
				))}
			</div>
		</section>
	);
}
