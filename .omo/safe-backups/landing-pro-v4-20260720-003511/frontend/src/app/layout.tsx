import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import { getEnv } from "@/lib/env-validator";
import { createLogger } from "@/lib/monitoring/logger";
import { initSentry } from "@/lib/monitoring/sentry";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme-init-script";
import { AppToaster } from "@/modules/core/ui/AppToaster";
import { Providers } from "./providers";
import { AppSerwistProvider } from "./serwist-provider";

const logger = createLogger("APP:layout");

// Initialize error tracking (Sentry)
if (typeof window === "undefined") {
	void initSentry().catch((error) => {
		logger.error("Failed to initialize Sentry", error);
	});
}

const siteUrl = getEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Cermont S.A.S. | Plataforma Operativa",
		template: "%s | Cermont",
	},
	description:
		"Plataforma operativa para solicitudes, propuestas, órdenes, evidencias, costos y cierres administrativos de Cermont S.A.S.",
	applicationName: "Cermont Campo",
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/icons/logo-cermont.svg", type: "image/svg+xml" },
			{ url: "/favicon.png", type: "image/png" },
			{ url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
		],
		apple: [{ url: "/icons/logo-cermont.png", type: "image/png" }],
		shortcut: [{ url: "/icons/logo-cermont.png", type: "image/png" }],
	},
	openGraph: {
		title: "Cermont S.A.S. | Plataforma Operativa",
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
		title: "Cermont S.A.S. | Plataforma Operativa",
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
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#121212" },
	],
	colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
			<body className="overflow-x-hidden bg-[var(--surface-page)] text-[var(--foreground)] antialiased selection:bg-[var(--color-brand-blue)]/15 selection:text-[var(--foreground)]">
				<AppSerwistProvider>
					<Providers>
						<main>{children}</main>
					</Providers>
				</AppSerwistProvider>
				<AppToaster />
				<Script id="theme-init" strategy="beforeInteractive">
					{THEME_INIT_SCRIPT}
				</Script>
			</body>
		</html>
	);
}
