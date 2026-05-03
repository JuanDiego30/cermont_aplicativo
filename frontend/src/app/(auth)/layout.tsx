import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: {
		default: "Acceso",
		template: "%s | Cermont",
	},
	description: "Accede, recupera tu contraseña o solicita acceso al portal de Cermont.",
	robots: {
		index: false,
		follow: false,
	},
};

interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return <section aria-label="Authentication">{children}</section>;
}
