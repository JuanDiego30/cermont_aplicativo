"use client";

import { ModuleErrorPage } from "@/components/common/ModuleErrorPage";

interface DashboardErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
	return (
		<ModuleErrorPage error={error} reset={reset} moduleName="Dashboard" homeHref="/dashboard" />
	);
}
