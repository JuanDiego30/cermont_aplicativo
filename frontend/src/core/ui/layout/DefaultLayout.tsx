"use client";

import type { ReactNode } from "react";
import { CermontGuideProvider } from "@/_shared/onboarding/CermontGuideProvider";
import { useUIStore } from "@/_shared/store/ui.store";
import { CermontAIDrawer } from "@/core/ui/ai/CermontAIDrawer";
import Header from "@/core/ui/layout/Header";
import MobileBottomNav from "@/core/ui/layout/MobileBottomNav";
import { ModuleQuickActions } from "@/core/ui/layout/ModuleQuickActions";
import Sidebar from "@/core/ui/layout/Sidebar";
import { PwaInstallPrompt } from "@/core/ui/pwa/PwaInstallPrompt";

interface DefaultLayoutProps {
	children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
	const { sidebarOpen, setSidebarOpen } = useUIStore();

	return (
		<div className="relative flex min-h-screen flex-col bg-[var(--surface-page)]">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-[var(--color-brand-blue)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--text-inverse)] focus:outline-none"
			>
				Skip to main content
			</a>

			<div className="relative z-10 flex flex-1 overflow-hidden">
				<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

				<div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
					<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

					<main id="main-content" tabIndex={-1} className="flex-1 min-h-screen overflow-auto">
						<div className="mx-auto max-w-[1600px] p-4 pb-24 md:p-6 md:pb-6 2xl:p-8">
							<CermontGuideProvider>{children}</CermontGuideProvider>
						</div>
					</main>

					<PwaInstallPrompt />
					<ModuleQuickActions />
				</div>
			</div>

			<MobileBottomNav />
			<CermontAIDrawer />
		</div>
	);
}
