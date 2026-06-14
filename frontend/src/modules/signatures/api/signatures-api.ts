/**
 * Client Signatures API Service
 *
 * Thin wrapper over `apiClient` for `/api/signatures` endpoints.
 */

import type { ClientSignature, CreateClientSignatureInput } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export type CaptureSignatureInput = Omit<CreateClientSignatureInput, "ipAddress" | "userAgent">;

export async function captureClientSignature(
	input: CaptureSignatureInput,
): Promise<ClientSignature> {
	const envelope = await apiClient.post<{ success: true; data: ClientSignature }>(
		"/signatures",
		input,
	);
	return envelope.data;
}
