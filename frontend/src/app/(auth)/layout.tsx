import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: {
		default: "Acceso corporativo",
		template: "%s | Cermont S.A.S.",
	},
	description: "Accede al portal corporativo de Cermont S.A.S. o solicita acceso como cliente.",
	robots: {
		index: false,
		follow: false,
	},
};

interface AuthLayoutProps {
	children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return <section>{children}</section>;
}
