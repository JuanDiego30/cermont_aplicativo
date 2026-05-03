import { getBillingPipeline as fetchBillingPipeline } from "../../orders/application/billing.service";

export async function getBillingPipeline() {
	return fetchBillingPipeline();
}
