"use client";

import { hasRole } from "@cermont/shared-types/rbac";
import { useGSAP } from "@gsap/react";
import { differenceInDays } from "date-fns";
import gsap from "gsap";
import { AlertTriangle } from "lucide-react";
import { useDeferredValue, useRef, useState } from "react";
import { useAuth } from "@/auth/hooks/useAuth";
import {
	DEFAULT_MAINTENANCE_KIT_ACTIVITY,
	formatMaintenanceKitActivityLabel,
	MAINTENANCE_KIT_ACTIVITY_COLORS,
	MAINTENANCE_KIT_ACTIVITY_OPTIONS,
	MAINTENANCE_KIT_CREATE_ROLES,
	MAINTENANCE_KIT_DELETE_ROLES,
	MAINTENANCE_KIT_EDIT_ROLES,
} from "@/maintenance/constants";
import { useDeleteMaintenanceKit, useMaintenanceKits } from "@/maintenance/queries";
import { MaintenanceCharts } from "@/maintenance/ui/MaintenanceCharts";
import { MaintenanceKPICards } from "@/maintenance/ui/MaintenanceKPICards";
import { MaintenancePageHeader } from "@/maintenance/ui/MaintenancePageHeader";
import { MaintenanceTable } from "@/maintenance/ui/MaintenanceTable";

gsap.registerPlugin(useGSAP);

const PAGE_SIZE = 100;

const VISIBILITY_TO_BOOLEAN: Record<string, boolean | undefined> = {
	all: undefined,
	active: true,
	inactive: false,
};

export default function MaintenancePage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canCreate = hasRole(role, MAINTENANCE_KIT_CREATE_ROLES);
	const canEdit = hasRole(role, MAINTENANCE_KIT_EDIT_ROLES);
	const canDelete = hasRole(role, MAINTENANCE_KIT_DELETE_ROLES);

	const [search, setSearch] = useState("");
	const [activityFilter, setActivityFilter] = useState<string>("all");
	const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
	const [page, setPage] = useState(1);

	const pageRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const pageElement = pageRef.current;
			if (!pageElement) {
				return;
			}

			const revealTargets = Array.from(
				pageElement.querySelectorAll<HTMLElement>("[data-maint-reveal]"),
			);
			if (revealTargets.length === 0) {
				return;
			}

			gsap.from(revealTargets, {
				opacity: 0,
				y: 20,
				stagger: 0.1,
				duration: 0.5,
				ease: "power2.out",
				clearProps: "all",
			});
		},
		{ scope: pageRef, dependencies: [] },
	);

	const deferredSearch = useDeferredValue(search.trim());
	const deleteMutation = useDeleteMaintenanceKit();

	const maintenanceKitQuery = useMaintenanceKits({
		page,
		limit: PAGE_SIZE,
		search: deferredSearch || undefined,
		activityType: activityFilter === "all" ? undefined : activityFilter,
		isActive: VISIBILITY_TO_BOOLEAN[visibilityFilter],
	});

	const kitPage = maintenanceKitQuery.data;
	const kits = kitPage?.items ?? [];
	const totalKits = kitPage?.total ?? 0;
	const activeKits = kits.filter((kit) => kit.isActive).length;
	const toolEntries = kits.reduce((total, kit) => total + kit.tools.length, 0);
	const equipmentEntries = kits.reduce((total, kit) => total + kit.equipment.length, 0);

	const activityCounts = MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => {
		const value = kits.filter((kit) => kit.activityType === option.value).length;
		return {
			name: option.label,
			value,
			color: MAINTENANCE_KIT_ACTIVITY_COLORS[option.value],
		};
	}).filter((entry) => entry.value > 0);

	const topActivity =
		activityCounts[0]?.name ?? formatMaintenanceKitActivityLabel(DEFAULT_MAINTENANCE_KIT_ACTIVITY);
	const latestKit = kits[0];

	// Urgent count: kits updated within last 3 days
	const urgentCount = kits.filter((kit) => {
		if (!kit.updatedAt) {
			return false;
		}
		const days = differenceInDays(new Date(), new Date(kit.updatedAt));
		return days <= 3 && days >= 0;
	}).length;

	const handleFilterReset = () => {
		setSearch("");
		setActivityFilter("all");
		setVisibilityFilter("all");
		setPage(1);
	};

	const handleDeleteKit = async (id: string, name: string) => {
		const confirmed = window.confirm(`¿Deseas desactivar el kit "${name}"?`);
		if (!confirmed) {
			return;
		}

		await deleteMutation.mutateAsync(id);
	};

	const loading = maintenanceKitQuery.isLoading && !kitPage;
	const error = maintenanceKitQuery.error;

	if (loading) {
		return (
			<section className="space-y-6" aria-labelledby="maintenance-page-title">
				<header className="space-y-3">
					<h1
						id="maintenance-page-title"
						className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]"
					>
						Kits Típicos
					</h1>
					<p className="text-sm text-[var(--text-secondary)]">Cargando catálogo de kits...</p>
				</header>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-6" aria-labelledby="maintenance-page-title">
				<header className="space-y-3">
					<h1
						id="maintenance-page-title"
						className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]"
					>
						Kits Típicos
					</h1>
				</header>
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 px-6 py-4 text-sm text-[var(--color-danger)] shadow-[var(--shadow-1)]">
					No se pudo cargar el catálogo de kits. {(error as Error).message}
				</div>
			</section>
		);
	}

	return (
		<section ref={pageRef} className="space-y-6" aria-labelledby="maintenance-page-title">
			<MaintenancePageHeader
				totalKits={totalKits}
				activeKits={activeKits}
				topActivity={topActivity}
				latestKitName={latestKit?.name}
				canCreate={canCreate}
			/>

			{/* Urgent alert banner */}
			{urgentCount > 0 && (
				<div
					data-maint-reveal
					role="alert"
					className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/60 px-5 py-4"
				>
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-white/70">
						<AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" aria-hidden="true" />
					</div>
					<div>
						<p className="text-sm font-semibold text-[var(--color-warning)]">
							{urgentCount} kit{urgentCount > 1 ? "s" : ""} actualizado{urgentCount > 1 ? "s" : ""}{" "}
							recientemente
						</p>
						<p className="text-xs text-[var(--text-secondary)]">
							Existen kits modificados en los últimos 3 días que podrían requerir revisión.
						</p>
					</div>
				</div>
			)}

			<MaintenanceKPICards
				totalKits={totalKits}
				activeKits={activeKits}
				toolEntries={toolEntries}
				equipmentEntries={equipmentEntries}
			/>

			<MaintenanceCharts
				activityCounts={activityCounts}
				canCreate={canCreate}
				canEdit={canEdit}
				canDelete={canDelete}
			/>

			<MaintenanceTable
				kits={kits}
				isFetching={maintenanceKitQuery.isFetching}
				search={search}
				activityFilter={activityFilter}
				visibilityFilter={visibilityFilter}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				onActivityChange={(value) => {
					setActivityFilter(value);
					setPage(1);
				}}
				onVisibilityChange={(value) => {
					setVisibilityFilter(value);
					setPage(1);
				}}
				onReset={handleFilterReset}
				canEdit={canEdit}
				canDelete={canDelete}
				canCreate={canCreate}
				onDelete={handleDeleteKit}
				isDeleting={deleteMutation.isPending}
				page={page}
				totalPages={kitPage?.totalPages}
				onPageChange={setPage}
			/>
		</section>
	);
}
