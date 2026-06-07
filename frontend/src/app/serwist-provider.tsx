"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

const ENABLE_SW_FLAG = process.env.NEXT_PUBLIC_ENABLE_SW;

function isServiceWorkerEnabled(): boolean {
	if (ENABLE_SW_FLAG === "false" || ENABLE_SW_FLAG === "0") {
		return false;
	}
	if (ENABLE_SW_FLAG === "true" || ENABLE_SW_FLAG === "1") {
		return true;
	}
	if (process.env.NODE_ENV === "development") {
		return false;
	}
	return process.env.NODE_ENV === "production";
}

export function AppSerwistProvider({ children }: { children: ReactNode }) {
	const enabled = isServiceWorkerEnabled();

	return (
		<SerwistProvider swUrl="/serwist/sw.js" disable={!enabled}>
			{children}
		</SerwistProvider>
	);
}
