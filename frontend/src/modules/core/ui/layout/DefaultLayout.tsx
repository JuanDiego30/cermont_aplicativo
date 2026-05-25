"use client";

import type { ReactNode } from "react";
import { CermontAIDrawer } from "@/modules/core/ui/ai/CermontAIDrawer";
import Header from "@/modules/core/ui/layout/Header";
import MobileBottomNav from "@/modules/core/ui/layout/MobileBottomNav";
import { ModuleQuickActions } from "@/modules/core/ui/layout/ModuleQuickActions";
import { Sidebar } from "@/modules/core/ui/layout/Sidebar";
import { PwaInstallPrompt } from "@/modules/core/ui/pwa/PwaInstallPrompt";
import { useUIStore } from "@/store/ui.store";

interface DefaultLayoutProps {
	children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
	const { sidebarOpen, setSidebarOpen } = useUIStore();

	return (
		<div className="relative flex min-h-screen flex-col bg-[var(--surface-page)]">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-[var(--color-brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-foreground)] focus:outline-none"
			>
				Saltar al contenido principal
			</a>

			<div className="relative flex flex-1 overflow-hidden">
				<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

				<div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
					<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

					<main
						id="main-content"
						tabIndex={-1}
						className="min-h-screen flex-1 overflow-auto bg-[var(--surface-page)]"
					>
						<div className="mx-auto max-w-[1600px] p-4 pb-24 md:p-6 md:pb-6 2xl:p-8">
							{children}
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
