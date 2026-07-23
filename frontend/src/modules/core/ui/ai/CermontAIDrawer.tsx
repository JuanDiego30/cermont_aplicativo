"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Settings2 } from "lucide-react";
import { useRef } from "react";
import { MOTION } from "@/components/motion/motion-classes";
import { useUIStore } from "@/store/ui.store";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { CermontAIDrawerHeader } from "./CermontAIDrawerHeader";
import { CermontAIDrawerMessageList } from "./CermontAIDrawerMessageList";
import { CermontAIDrawerInputBar } from "./CermontAIDrawerInputBar";
import { useCermontAIConversation } from "./useCermontAIConversation";

gsap.registerPlugin(useGSAP);

export function CermontAIDrawer() {
	const { chatOpen, toggleChat } = useUIStore();
	const drawerRef = useRef<HTMLDialogElement>(null);
	const {
		messages,
		input,
		setInput,
		handleSend,
		handleKeyDown,
		isPending,
		messagesEndRef,
		containerRef,
		isEnabled,
		currentModule,
	} = useCermontAIConversation();

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
				className={`${MOTION.drawer} fixed inset-y-4 right-4 z-[101] flex w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.24)]`}
			>
				<CermontAIDrawerHeader isEnabled={isEnabled} onClose={toggleChat} />
				{isEnabled ? (
					<>
						<CermontAIDrawerMessageList
							messages={messages}
							messagesEndRef={messagesEndRef}
							containerRef={containerRef}
							onActionClick={handleSend}
						/>
						<CermontAIDrawerInputBar
							input={input}
							onInputChange={setInput}
							onSend={() => handleSend()}
							onKeyDown={handleKeyDown}
							isPending={isPending}
							currentModule={currentModule}
							isEnabled={isEnabled}
						/>
					</>
				) : (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
							<Settings2 className="size-7" aria-hidden="true" />
						</div>
						<div>
							<h3 className="text-base font-semibold text-[var(--text-primary)]">Configuración requerida</h3>
							<p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
								Cermont AI está disponible para activarse cuando el proveedor y las credenciales estén configurados por un administrador.
							</p>
						</div>
					</div>
				)}
			</dialog>
		</>
	);
}
