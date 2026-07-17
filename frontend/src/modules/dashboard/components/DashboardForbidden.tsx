import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";

/**
 * DashboardForbidden — Forbidden/unauthorized state for RBAC-protected dashboard
 *
 * Shown when the user's role does not have permission to access the dashboard.
 */
export function DashboardForbidden() {
	return (
		<section
			className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 py-14 text-center"
			aria-label="Acceso restringido"
		>
			<div className="flex size-14 items-center justify-center rounded-full bg-danger-bg text-danger">
				<ShieldAlert className="size-6" aria-hidden="true" />
			</div>
			<div className="space-y-2">
				<h2 className="text-base font-semibold text-ink [text-wrap:balance]">
					Acceso restringido
				</h2>
				<p className="mx-auto max-w-md text-sm text-charcoal">
					No tienes permisos para ver esta sección del dashboard.
				</p>
			</div>
			<Link href="/">
				<Button size="sm" variant="primary">
					Volver al inicio
				</Button>
			</Link>
		</section>
	);
}
