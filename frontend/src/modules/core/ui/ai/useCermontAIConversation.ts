"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/http/api-client";
import { useServiceCase } from "@/modules/service-cases/queries";
import type { AssistantChatRequest } from "@cermont/shared-types";

export interface AIEnvelope {
	message: string;
	suggestedActions?: string[];
	actions?: string[];
	threadId?: string;
	reply?: string;
	blockers?: string[];
}

export interface AiMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	actions?: string[];
	serviceCaseId?: string;
	threadId?: string;
}

export const ENABLE_AI = process.env.NEXT_PUBLIC_ENABLE_CERMONT_AI === "true";

export const QUICK_PROMPTS = ENABLE_AI
	? ["Resumir caso", "Buscar faltantes", "Redactar borrador", "¿Qué necesito para avanzar?"]
	: ["Resumir caso", "Buscar faltantes", "Redactar borrador"];

interface AiStatusResponse {
	success: boolean;
	data: {
		enabled: boolean;
		provider: string;
		status: string;
	};
}

function createMessageId(role: AiMessage["role"]): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return `${role}-${crypto.randomUUID()}`;
	}
	return `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useCermontAIConversation() {
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const statusQuery = useQuery({
		queryKey: ["ai", "status"],
		queryFn: () => apiClient.get<AiStatusResponse>("/ai/status"),
		staleTime: 30_000,
		retry: 1,
	});
	const isEnabled = statusQuery.data?.data.enabled ?? ENABLE_AI;
	const serviceCaseIdFromUrl = useMemo(() => {
		const match = pathname.match(/\/service-cases\/([^/]+)/);
		return match ? match[1] : null;
	}, [pathname]);
	const { data: workflow } = useServiceCase(serviceCaseIdFromUrl ?? "");

	const serviceCaseId = workflow?.data?.serviceCaseId;
	const currentModule = pathname ?? null;

	const [messages, setMessages] = useState<AiMessage[]>(() => {
		if (ENABLE_AI) {
			return [
				{
					id: createMessageId("assistant"),
					role: "assistant",
					content:
						"Hola, soy **Cermont AI**. Puedo ayudarte con el caso actual. ¿Qué deseas hacer?",
					actions: ["Resumir caso", "Buscar faltantes", "Redactar borrador"],
				},
			];
		}
		return [
			{
				id: createMessageId("assistant"),
				role: "assistant",
				content:
					"**Cermont AI** no está disponible en este momento. " +
					"Puedes usar los comandos de abajo para obtener información del caso sin conexión al asistente.\n\n" +
					"Contacta al administrador para activar el servicio de IA.",
				actions: ["Resumir caso", "Buscar faltantes", "Redactar borrador"],
			},
		];
	});
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeThreadId, setActiveThreadId] = useState<string>();

	const mutation = useMutation({
		mutationFn: async (query: string) => {
			const payload: AssistantChatRequest = {
				serviceCaseId: serviceCaseId ?? "",
				message: query,
				...(activeThreadId ? { threadId: activeThreadId } : {}),
				...(currentModule ? { currentModule } : {}),
			};

			const response = await apiClient.post<{ success: boolean; data: AIEnvelope }>(
				"/ai/chat",
				payload,
			);
			const data = (response.data as AIEnvelope) ?? {};
			return {
				message: data.reply ?? data.message ?? "",
				suggestedActions: data.suggestedActions ?? data.actions,
				threadId: data.threadId,
				blockers: data.blockers,
			} satisfies AIEnvelope;
		},
		onSuccess: (data) => {
			if (data.threadId) {
				setActiveThreadId(data.threadId);
			}
			void queryClient.invalidateQueries({ queryKey: ["ai", "chat"] });
			setMessages((prev) => [
				...prev.map((msg) =>
					msg.id === prev[prev.length - 1]?.id
						? {
								...msg,
								threadId: data.threadId ?? msg.threadId,
								serviceCaseId: msg.serviceCaseId ?? serviceCaseId,
							}
						: msg,
				),
				{
					id: createMessageId("assistant"),
					role: "assistant",
					content: data.message,
					actions: data.suggestedActions,
					serviceCaseId,
					threadId: data.threadId,
				},
			]);
		},
		onError: () => {
			setMessages((prev) => [
				...prev,
				{
					id: createMessageId("assistant"),
					role: "assistant",
					content:
						"Ha ocurrido un error al conectar con mis sistemas. Por favor, intenta de nuevo más tarde.",
					serviceCaseId,
				},
			]);
		},
	});

	useEffect(() => {
		const messageCount = messages.length;

		if (!messageCount) {
			return;
		}

		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	}, [messages.length]);

	const handleSend = (text: string = input) => {
		if (!isEnabled || !text.trim() || mutation.isPending) {
			return;
		}

		if (!serviceCaseId) {
			setMessages((prev) => [
				...prev,
				{
					id: createMessageId("assistant"),
					role: "assistant",
					content:
						"Selecciona un caso de servicio para poder usar Cermont AI. Navega a un caso de servicio e intenta de nuevo.",
				},
			]);
			return;
		}

		const userMessage = text.trim();
		setMessages((prev) => [
			...prev,
			{
				id: createMessageId("user"),
				role: "user",
				content: userMessage,
				serviceCaseId,
				threadId: activeThreadId,
			},
		]);
		if (text === input) {
			setInput("");
		}

		mutation.mutate(userMessage);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return {
		messages,
		input,
		setInput,
		handleSend,
		handleKeyDown,
		isPending: mutation.isPending,
		serviceCaseId,
		activeThreadId,
		messagesEndRef,
		containerRef,
		isEnabled,
		currentModule,
	};
}
