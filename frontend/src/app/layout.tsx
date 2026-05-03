import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "driver.js/dist/driver.css";
import "./globals.css";
import { SyncStatusBar } from "@/_shared/components/sync/SyncStatusBar";
import { validateEnv } from "@/_shared/lib/env-validator";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { initSentry } from "@/_shared/lib/monitoring/sentry";
import { THEME_INIT_SCRIPT_SRC } from "@/_shared/lib/theme/theme-init-script";
import { AppToaster } from "@/core/ui/AppToaster";
import { ThemeToggle } from "@/core/ui/layout/ThemeToggle";
import { ServiceWorkerRegistration } from "@/core/ui/pwa/ServiceWorkerRegistration";
import { Providers } from "./providers";

const logger = createLogger("APP:layout");

export const dynamic = "force-dynamic";

// Initialize error tracking (Sentry)
if (typeof window === "undefined") {
	void initSentry().catch((error) => {
		logger.error("Failed to initialize Sentry", error);
	});
}

// Validate environment on server startup
const { NEXT_PUBLIC_APP_URL: siteUrl } = validateEnv();

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Cermont — Órdenes de Trabajo",
		template: "%s | Cermont",
	},
	description:
		"PWA operativa para órdenes, evidencias, inspecciones y cierres administrativos de Cermont S.A.S.",
	applicationName: "Cermont Campo",
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
			{ url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
		],
		apple: [{ url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" }],
		shortcut: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" }],
	},
	openGraph: {
		title: "Cermont — Órdenes de Trabajo",
		description:
			"Plataforma operativa para cuadrillas con soporte offline, sincronización y captura de evidencias.",
		url: siteUrl,
		siteName: "Cermont",
		locale: "es_CO",
		type: "website",
		images: [
			{ url: "/images/pwa/dashboard-desktop.svg", width: 1440, height: 900, alt: "Cermont Campo" },
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Cermont — Órdenes de Trabajo",
		description:
			"PWA operativa para trabajo de campo, evidencia móvil y continuidad bajo baja conectividad.",
		images: ["/images/pwa/dashboard-desktop.svg"],
	},
	appleWebApp: {
		capable: true,
		title: "Cermont Campo",
		statusBarStyle: "black-translucent",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "oklch(0.995 0.004 260)" },
		{ media: "(prefers-color-scheme: dark)", color: "oklch(0.23 0.04 260)" },
	],
	colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className="bg-[var(--surface-page)] text-foreground antialiased">
				<section aria-label="Application shell">
					<Providers>{children}</Providers>
				</section>
				<ThemeToggle />
				<SyncStatusBar />
				<ServiceWorkerRegistration />
				<AppToaster />
				<Script id="theme-init" src={THEME_INIT_SCRIPT_SRC} strategy="beforeInteractive" />
			</body>
		</html>
	);
}
