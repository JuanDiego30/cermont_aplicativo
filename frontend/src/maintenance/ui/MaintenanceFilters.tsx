"use client";

import { Search } from "lucide-react";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import { MAINTENANCE_KIT_ACTIVITY_OPTIONS, MAINTENANCE_KIT_VISIBILITY_OPTIONS } from "../constants";

interface MaintenanceFiltersProps {
	search: string;
	activityFilter: string;
	visibilityFilter: string;
	onSearchChange: (value: string) => void;
	onActivityChange: (value: string) => void;
	onVisibilityChange: (value: string) => void;
	onReset: () => void;
}

export function MaintenanceFilters({
	search,
	activityFilter,
	visibilityFilter,
	onSearchChange,
	onActivityChange,
	onVisibilityChange,
	onReset,
}: MaintenanceFiltersProps) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-[var(--text-primary)]">Catálogo de kits</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Revisa, filtra y administra los kits típicos disponibles.
					</p>
				</div>

				<button
					type="button"
					onClick={onReset}
					className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
				>
					Restablecer filtros
				</button>
			</div>

			<div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
				<FormField label="Buscar" htmlFor="maintenance-kit-search">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<TextField
							id="maintenance-kit-search"
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder="Buscar por nombre"
							className="pl-9"
						/>
					</div>
				</FormField>

				<FormField label="Actividad" htmlFor="maintenance-kit-activity-filter">
					<Select
						id="maintenance-kit-activity-filter"
						value={activityFilter}
						onChange={(event) => onActivityChange(event.target.value)}
					>
						<option value="all">Todas</option>
						{MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</FormField>

				<FormField label="Estado" htmlFor="maintenance-kit-visibility-filter">
					<Select
						id="maintenance-kit-visibility-filter"
						value={visibilityFilter}
						onChange={(event) => onVisibilityChange(event.target.value)}
					>
						{MAINTENANCE_KIT_VISIBILITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</FormField>
			</div>
		</section>
	);
}
