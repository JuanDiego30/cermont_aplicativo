"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOTION } from "@/components/motion/motion-classes";
import { useUIStore } from "@/store/ui.store";

gsap.registerPlugin(useGSAP);

import type { AssistantChatRequest } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useServiceCase } from "@/modules/service-cases/queries";

interface AIEnvelope {
	message: string;
	suggestedActions?: string[];
	actions?: string[];
	// Backend AssistantChatResponse shape
	threadId?: string;
	reply?: string;
	blockers?: string[];
}

interface AiMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	actions?: string[];
	serviceCaseId?: string;
	threadId?: string;
}

const QUICK_PROMPTS = [
	"Estado de órdenes",
	"Generar informe técnico",
	"Stock crítico",
	"Resumen del día",
];

function createMessageId(role: AiMessage["role"]): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return `${role}-${crypto.randomUUID()}`;
	}
	return `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CermontAIDrawer() {
	const { chatOpen, toggleChat } = useUIStore();
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const serviceCaseIdFromUrl = useMemo(() => {
		const match = pathname.match(/\/service-cases\/([^/]+)/);
		return match ? match[1] : null;
	}, [pathname]);
	const { data: workflow } = useServiceCase(serviceCaseIdFromUrl ?? "");

	const serviceCaseId = workflow?.data?.serviceCaseId;
	const currentModule = pathname ?? null;

	const [messages, setMessages] = useState<AiMessage[]>([
		{
			id: createMessageId("assistant"),
			role: "assistant",
			content:
				"Hola, soy **Cermont AI**. Puedo ayudarte a consultar estados de órdenes, buscar recursos activos o sugerir mantenimientos preventivos. ¿En qué te puedo ayudar hoy?",
			actions: ["Estado de órdenes", "Generar informe técnico", "¿Cómo me puedes ayudar?"],
		},
	]);
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const drawerRef = useRef<HTMLDialogElement>(null);

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

	useGSAP(() => {
		if (prefersReducedMotion()) {
			return;
		}

		if (chatOpen && drawerRef.current) {
			gsap.fromTo(
				drawerRef.current,
				{ x: "100%", opacity: 0.5 },
				{ x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" },
			);
		}
	}, [chatOpen]);

	useEffect(() => {
		const messageCount = messages.length;

		if (!chatOpen && messageCount === 0) {
			return;
		}

		messagesEndRef.current?.scrollIntoView({
			behavior: prefersReducedMotion() ? "auto" : "smooth",
			block: "end",
		});
	}, [chatOpen, messages.length]);

	const handleSend = (text: string = input) => {
		if (!text.trim() || mutation.isPending) {
			return;
		}

		// Block sends without a valid serviceCaseId — backend schema requires it
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

	if (!chatOpen) {
		return null;
	}

	return (
		<>
			<div
				className={`${MOTION.overlay} fixed inset-0 z-[100] bg-[color:rgb(15,23,41)]/42 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none`}
				onClick={toggleChat}
				aria-hidden="true"
			/>
			<dialog
				ref={drawerRef}
				open={chatOpen || undefined}
				aria-labelledby="cermont-ai-title"
				aria-modal="true"
				className={`${MOTION.drawer} fixed inset-y-4 right-4 z-[101] flex w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.24)]`}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.16),rgba(15,23,41,0.03),transparent)] px-5 py-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-blue)] to-[var(--color-info)] text-white shadow-[var(--shadow-brand)]">
							<Bot className="size-5" />
						</div>
						<div>
							<h2
								id="cermont-ai-title"
								className="text-sm font-semibold text-[var(--text-primary)]"
							>
								Cermont AI
							</h2>
							<p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-success)]">
								<span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--color-success)]"></span>
								Operativo
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={toggleChat}
						aria-label="Cerrar asistente Cermont AI"
						className="motion-button flex size-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]/60 px-4 py-3">
					<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
						<Sparkles className="size-3.5 text-[var(--color-brand-blue)]" />
						Atajos rápidos
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{QUICK_PROMPTS.map((prompt) => (
							<button
								key={prompt}
								type="button"
								onClick={() => handleSend(prompt)}
								className="motion-button rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
							>
								{prompt}
							</button>
						))}
					</div>
				</div>

				{/* Messages list */}
				<div
					className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(58,120,216,0.04),transparent_28%)] p-5 overscroll-contain"
					ref={containerRef}
				>
					<div className="flex flex-col gap-4">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`flex max-w-[85%] flex-col gap-1 ${
									msg.role === "user" ? "self-end" : "self-start"
								}`}
							>
								<div
									className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
										msg.role === "user"
											? "rounded-br-sm bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
											: "rounded-bl-sm bg-[var(--surface-secondary)] text-[var(--text-primary)]"
									}`}
								>
									{msg.content}
								</div>
								{msg.actions?.length ? (
									<div className="flex flex-wrap gap-2 pt-1">
										{msg.actions.map((action) => (
											<button
												key={`${msg.id}-${action}`}
												type="button"
												onClick={() => handleSend(action)}
												className="rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
											>
												{action}
											</button>
										))}
									</div>
								) : null}
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
				</div>

				{/* Input area */}
				<div className="border-t border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
					<div className="relative flex items-end gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] p-2 transition-all focus-within:border-[var(--border-focus)] focus-within:bg-[var(--surface-primary)] focus-within:ring-1 focus-within:ring-[color:var(--color-brand-blue)]/20">
						<textarea
							rows={1}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								currentModule ? `Pregunta sobre ${currentModule}` : "Hazme una pregunta…"
							}
							aria-label="Pregunta a la IA de Cermont"
							className="max-h-32 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
						/>
						<button
							type="button"
							onClick={() => handleSend()}
							disabled={!input.trim()}
							aria-label="Enviar pregunta"
							className="motion-button flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--color-brand-blue) text-white hover:bg-(--color-brand-blue-hover) disabled:opacity-50 disabled:hover:bg-(--color-brand-blue)"
						>
							<Send className="size-4" />
						</button>
					</div>
					<p className="mt-2 text-center text-[10px] text-(--text-tertiary)">
						Cermont AI puede cometer errores. Verifica la info.
					</p>
				</div>
			</dialog>
		</>
	);
}
