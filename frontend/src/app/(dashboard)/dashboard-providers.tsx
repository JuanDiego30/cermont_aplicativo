"use client";

import type { ReactNode } from "react";

interface DashboardProvidersProps {
	children: ReactNode;
}

/**
 * Dashboard-specific providers wrapper.
 * QueryClientProvider and auth bootstrap now live at the root layout.
 */
export function DashboardProviders({ children }: DashboardProvidersProps) {
	return <>{children}</>;
}
