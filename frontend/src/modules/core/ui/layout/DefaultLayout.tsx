"use client";

import type { ReactNode } from "react";
import "@/core/ui/index";
import { QuickUploadPanel } from "@/components/common/QuickUploadPanel";
import { ConsentGate } from "@/modules/consents/ui/ConsentGate";
import { CermontAIDrawer } from "@/modules/core/ui/ai/CermontAIDrawer";
import Header from "@/modules/core/ui/layout/Header";
import MobileBottomNav from "@/modules/core/ui/layout/MobileBottomNav";
import { Sidebar } from "@/modules/core/ui/layout/Sidebar";
import { PwaInstallPrompt } from "@/modules/core/ui/pwa/PwaInstallPrompt";
import { useUIStore } from "@/store/ui.store";

interface DefaultLayoutProps {
	children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
	const { sidebarOpen, setSidebarOpen } = useUIStore();

	return (
		<div className="motion-shell relative flex min-h-dvh flex-col overflow-x-hidden bg-[var(--surface-page)]">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-[var(--color-brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			>
				Saltar al contenido principal
			</a>

			<div className="relative flex min-h-0 flex-1">
				<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

				<div className="relative flex min-w-0 flex-1 flex-col">
					<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

					<main
						id="main-content"
						tabIndex={-1}
						className="min-w-0 flex-1 bg-[var(--surface-page)] scroll-mt-[calc(var(--header-height)+var(--space-4))]"
					>
						<div className="animate-fade-in-up mx-auto w-full max-w-[var(--shell-max-width)] px-4 py-4 pb-28 md:px-6 md:py-6 md:pb-24 2xl:px-8 2xl:py-8">
							{children}
						</div>
					</main>

					<PwaInstallPrompt />
					<QuickUploadPanel />
				</div>
			</div>

			<MobileBottomNav />
			<CermontAIDrawer />
			<ConsentGate />
		</div>
	);
}
