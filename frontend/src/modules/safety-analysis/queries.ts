"use client";

/**
 * Safety Analysis (AST) — TanStack Query hooks
 */

import type { ASTStatus, CreateAST, SignAST } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAST, listASTs, signAST, transitionAST } from "./api/asts-api";

const AST_KEYS = {
	all: ["asts"] as const,
	list: (orderId: string, status: string) => [...AST_KEYS.all, "list", orderId, status] as const,
	detail: (id: string) => [...AST_KEYS.all, "detail", id] as const,
};

export function useASTs(orderId: string, status = "") {
	return useQuery({
		queryKey: AST_KEYS.list(orderId, status),
		queryFn: () => listASTs(orderId, status || undefined),
		enabled: Boolean(orderId),
	});
}

export function useCreateAST() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateAST) => createAST(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: AST_KEYS.all });
		},
	});
}

export function useTransitionAST() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: ASTStatus }) => transitionAST(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: AST_KEYS.all });
		},
	});
}

export function useSignAST() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: SignAST }) => signAST(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: AST_KEYS.all });
		},
	});
}
