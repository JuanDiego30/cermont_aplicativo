"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bot, Send, Sparkles, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/_shared/store/ui.store";

gsap.registerPlugin(useGSAP);

import type { AIResponse, ApiBody } from "@cermont/shared-types";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";

const QUICK_PROMPTS = [
	"Order status",
	"Generate technical report",
	"Critical stock",
	"Daily summary",
];

export function CermontAIDrawer() {
	const { chatOpen, toggleChat } = useUIStore();
	const [messages, setMessages] = useState<
		{ role: "assistant" | "user"; content: string; actions?: string[] }[]
	>([
		{
			role: "assistant",
			content:
				"Hi, I am **Cermont AI**. I can help you check work order status, find active resources, or suggest preventive maintenance. What can I help you with today?",
			actions: ["Order status", "Generate technical report", "How can you help me?"],
		},
	]);
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const drawerRef = useRef<HTMLDivElement>(null);

	const mutation = useMutation({
		mutationFn: async (query: string) => {
			const response = await apiClient.post<ApiBody<AIResponse>>("/ai/chat", {
				query,
			});
			return response.data;
		},
		onSuccess: (data) => {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: data.message,
					actions: data.suggestedActions,
				},
			]);
		},
		onError: () => {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "I could not connect to my systems. Please try again later.",
				},
			]);
		},
	});

	useGSAP(
		() => {
			if (chatOpen && drawerRef.current) {
				gsap.fromTo(
					drawerRef.current,
					{ x: "100%", opacity: 0.5 },
					{ x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" },
				);
			}
		},
		{ dependencies: [chatOpen] },
	);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleSend = (text: string = input) => {
		if (!text.trim() || mutation.isPending) {
			return;
		}

		const userMessage = text.trim();
		setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
		if (text === input) {
			setInput("");
		}

		mutation.mutate(userMessage);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
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
				className="fixed inset-0 z-[100] bg-[color:rgb(15,23,41)]/42 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
				onClick={toggleChat}
				aria-hidden="true"
			/>
			<div
				ref={drawerRef}
				className="fixed inset-y-4 right-4 z-[101] flex w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(58,120,216,0.16),rgba(15,23,41,0.03),transparent)] px-5 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-blue)] to-[var(--color-info)] text-white shadow-[var(--shadow-brand)]">
							<Bot className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-sm font-bold text-[var(--text-primary)]">Cermont AI</h2>
							<p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-success)]">
								<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]"></span>
								Operational
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={toggleChat}
						className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]/60 px-4 py-3">
					<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
						<Sparkles className="h-3.5 w-3.5 text-[var(--color-brand-blue)]" />
						Quick shortcuts
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{QUICK_PROMPTS.map((prompt) => (
							<button
								key={prompt}
								type="button"
								onClick={() => handleSend(prompt)}
								className="rounded-full border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
							>
								{prompt}
							</button>
						))}
					</div>
				</div>

				{/* Messages list */}
				<div
					className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(58,120,216,0.04),transparent_28%)] p-5"
					ref={containerRef}
				>
					<div className="flex flex-col gap-4">
						{messages.map((msg) => (
							<div
								key={msg.content}
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
												key={action}
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
							placeholder="Ask me a question..."
							className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
						/>
						<button
							type="button"
							onClick={() => handleSend()}
							disabled={!input.trim()}
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] text-white transition-all hover:bg-[var(--color-brand-blue-hover)] disabled:opacity-50 disabled:hover:bg-[var(--color-brand-blue)]"
						>
							<Send className="h-4 w-4" />
						</button>
					</div>
					<p className="mt-2 text-center text-[10px] text-[var(--text-tertiary)]">
						Cermont AI can make mistakes. Verify important information.
					</p>
				</div>
			</div>
		</>
	);
}
