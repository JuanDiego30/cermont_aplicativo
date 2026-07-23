"use client";

import { Sparkles } from "lucide-react";
import type { RefObject } from "react";
import type { AiMessage } from "./useCermontAIConversation";
import { QUICK_PROMPTS } from "./useCermontAIConversation";

interface CermontAIDrawerMessageListProps {
	messages: AiMessage[];
	messagesEndRef: RefObject<HTMLDivElement | null>;
	containerRef: RefObject<HTMLDivElement | null>;
	onActionClick: (text: string) => void;
}

export function CermontAIDrawerMessageList({
	messages,
	messagesEndRef,
	containerRef,
	onActionClick,
}: CermontAIDrawerMessageListProps) {
	return (
		<div
			className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(58,120,216,0.04),transparent_28%)] p-5 overscroll-contain"
			ref={containerRef}
		>
			<div className="flex flex-col gap-4">
				<div className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]/60 px-4 py-3">
					<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
						<Sparkles className="size-3.5 text-[var(--color-brand-blue)]" />
						Atajos rápidos
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{QUICK_PROMPTS.map((prompt) => (
							<button
								key={prompt}
								type="button"
								onClick={() => onActionClick(prompt)}
								className="motion-button rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
							>
								{prompt}
							</button>
						))}
					</div>
				</div>

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
										onClick={() => onActionClick(action)}
										className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
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
	);
}
