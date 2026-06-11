/**
 * Safety Analysis (AST) API Service
 *
 * Thin wrapper over `apiClient` for `/api/asts` endpoints.
 */

import type { AST, ASTStatus, CreateAST, SignAST, UpdateAST } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface ASTListEnvelope {
	success: boolean;
	data: AST[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listASTs(orderId?: string, status?: string): Promise<ASTListEnvelope> {
	const searchParams = new URLSearchParams();
	if (orderId) {
		searchParams.set("orderId", orderId);
	}
	if (status) {
		searchParams.set("status", status);
	}
	const query = searchParams.toString();
	return apiClient.get<ASTListEnvelope>(`/asts${query ? `?${query}` : ""}`);
}

export async function getAST(id: string): Promise<AST> {
	const envelope = await apiClient.get<{ success: true; data: AST }>(`/asts/${id}`);
	return envelope.data;
}

export async function createAST(input: CreateAST): Promise<AST> {
	const envelope = await apiClient.post<{ success: true; data: AST }>("/asts", input);
	return envelope.data;
}

export async function updateAST(id: string, input: UpdateAST): Promise<AST> {
	const envelope = await apiClient.patch<{ success: true; data: AST }>(`/asts/${id}`, input);
	return envelope.data;
}

export async function transitionAST(id: string, status: ASTStatus): Promise<AST> {
	const envelope = await apiClient.post<{ success: true; data: AST }>(`/asts/${id}/transition`, {
		status,
	});
	return envelope.data;
}

export async function signAST(id: string, input: SignAST): Promise<AST> {
	const envelope = await apiClient.post<{ success: true; data: AST }>(`/asts/${id}/sign`, input);
	return envelope.data;
}
