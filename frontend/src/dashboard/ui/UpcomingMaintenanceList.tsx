import type { MaintenanceKit } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package2, Wrench } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { formatMaintenanceKitActivityLabel } from "@/maintenance/constants";
import { getKitSummary } from "@/maintenance/lib/kit-formatters";

interface UpcomingMaintenanceListProps {
	kits: MaintenanceKit[];
}

export function UpcomingMaintenanceList({ kits }: UpcomingMaintenanceListProps) {
	const headingId = useId();
	const items = kits ?? [];

	if (items.length === 0) {
		return (
			<p className="flex h-32 items-center justify-center text-sm text-[var(--text-tertiary)]">
				Sin kits típicos registrados
			</p>
		);
	}

	return (
		<section
			aria-labelledby={headingId}
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-5 pb-3 pt-6 shadow-[var(--shadow-1)] transition-all hover:shadow-[var(--shadow-2)] sm:px-6 xl:pb-2"
		>
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<h3 id={headingId} className="text-xl font-bold text-[var(--text-primary)]">
						Kits Típicos Recientes
					</h3>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Plantillas reales para planeación y ejecución.
					</p>
				</div>

				<Link
					href="/maintenance"
					className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--color-brand-blue)]/30 hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue)]"
				>
					<Package2 className="h-4 w-4" />
					Ver catálogo
				</Link>
			</div>

			<ul className="mb-3 flex flex-col gap-2">
				{items.map((item) => {
					const updatedAt = item.updatedAt
						? format(new Date(item.updatedAt), "dd MMM", { locale: es })
						: "—";
					const toolCount = item.tools.length;
					const equipmentCount = item.equipment.length;

					return (
						<li
							className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-transparent bg-[var(--surface-secondary)] px-4 py-3 transition-colors hover:border-[var(--border-default)] hover:bg-[var(--surface-page)]"
							key={item._id}
						>
							<div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
								<Wrench aria-hidden="true" className="h-5 w-5 text-[var(--color-brand-blue)]" />
							</div>

							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-[var(--text-primary)]">
									{item.name}
								</p>
								<div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
									<span className="truncate text-xs font-medium text-[var(--text-secondary)]">
										{formatMaintenanceKitActivityLabel(item.activityType)}
									</span>
									<span
										aria-hidden="true"
										className="hidden text-xs text-[var(--text-tertiary)] sm:block"
									>
										•
									</span>
									<span className="truncate text-xs text-[var(--text-tertiary)]">
										{getKitSummary(toolCount, equipmentCount)}
									</span>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<span
									className={`rounded-full px-3 py-1 text-xs font-bold ${
										item.isActive
											? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
											: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
									}`}
								>
									{item.isActive ? "Activo" : "Inactivo"}
								</span>
								<span className="rounded-full bg-[var(--color-info-bg)] px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
									{updatedAt}
								</span>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
