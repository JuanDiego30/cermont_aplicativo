import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { AppIcon } from "@/core/ui/AppIcon";
import { Button } from "@/core/ui/Button";

export function PlanningEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10">
				<AppIcon icon={Package} size={32} variant="brand" aria-hidden="true" />
			</div>
			<div>
				<h3 className="text-lg font-semibold text-[var(--text-primary)]">
					Sin paquetes de planeación
				</h3>
				<p className="mt-1 max-w-xs text-sm text-[var(--text-secondary)]">
					Crea la planeación desde una orden aprobada para preparar la ejecución.
				</p>
			</div>
			<Button asChild variant="primary">
				<Link href="/planning-packet/new">
					<AppIcon icon={Plus} size="sm" variant="currentColor" aria-hidden="true" />
					Crear primera planeación
				</Link>
			</Button>
		</div>
	);
}
