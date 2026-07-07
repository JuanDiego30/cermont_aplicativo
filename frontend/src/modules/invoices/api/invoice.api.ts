import { apiClient } from "@/lib/http/api-client";

export interface PipelineResponse {
	success: boolean;
	data: {
		serviceCaseId: string;
		pipeline: {
			ses: PipelineStage;
			invoice: PipelineStage;
			payment: PipelineStage;
		};
	};
}

export interface PipelineStage {
	status: string;
	amount: number;
	currency: string;
	createdAt?: string;
	code?: string;
	agingDays?: number;
}

export type InvoicePipeline = PipelineResponse["data"]["pipeline"];
export async function fetchInvoicePipeline(
	serviceCaseId: string,
): Promise<PipelineResponse["data"]> {
	const body = await apiClient.get<PipelineResponse>(
		`/service-cases/${encodeURIComponent(serviceCaseId)}/invoice-pipeline`,
	);
	if (!body.success) {
		throw new Error("Failed to fetch invoice pipeline");
	}
	return body.data;
}
