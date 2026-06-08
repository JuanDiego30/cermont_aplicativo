import type { Metadata } from "next";
import { OfflinePageClient } from "./OfflinePageClient";

export const metadata: Metadata = {
	title: "Sin conexion | Cermont Campo",
	description:
		"Fallback offline de Cermont Campo para continuar con datos cargados previamente y cambios pendientes.",
};

export default function OfflinePage() {
	return (
		<main>
			<OfflinePageClient />
		</main>
	);
}
