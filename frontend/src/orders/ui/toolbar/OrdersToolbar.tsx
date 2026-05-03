"use client";

import type { OrderListQuery, OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DateRangeFilter } from "./DateRangeFilter";
import { OrderBulkActions } from "./OrderBulkActions";
import { OrderExportButton } from "./OrderExportButton";
import { OrderFilterBadges } from "./OrderFilterBadges";
import { OrdersGroupBy } from "./OrdersGroupBy";
import { OrdersSearch } from "./OrdersSearch";
import { OrderViewToggle } from "./OrderViewToggle";
import { TechnicianFilter } from "./TechnicianFilter";
import {
	ORDER_PRIORITY_OPTIONS,
	ORDER_STATUS_OPTIONS,
	ORDER_TYPE_OPTIONS,
	type OrdersGroupByValue,
} from "./toolbar-options";

interface OrdersToolbarProps {
	filters: Partial<OrderListQuery>;
	view: "list" | "kanban";
	groupBy: OrdersGroupByValue;
	selectedOrderIds: string[];
	onFilterChange: (patch: Partial<OrderListQuery>) => void;
	onRemoveFilter: (key: string) => void;
	onClearFilters: () => void;
	onGroupByChange: (value: OrdersGroupByValue) => void;
	onClearSelection: () => void;
	listHref: string;
	kanbanHref: string;
}

function toggleArrayValue<T extends string>(values: T[] | undefined, value: T): T[] | undefined {
	const current = values ?? [];
	const next = current.includes(value)
		? current.filter((entry) => entry !== value)
		: [...current, value];
	return next.length > 0 ? next : undefined;
}

function isoToDateInput(value?: string): string {
	return value ? value.slice(0, 10) : "";
}

function dateInputToIso(value: string, edge: "start" | "end"): string | undefined {
	if (!value) {
		return undefined;
	}
	return edge === "start" ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
}

export function OrdersToolbar({
	filters,
	view,
	groupBy,
	selectedOrderIds,
	onFilterChange,
	onRemoveFilter,
	onClearFilters,
	onGroupByChange,
	onClearSelection,
	listHref,
	kanbanHref,
}: OrdersToolbarProps) {
	const badges = [
		...(filters.search ? [{ key: "search", label: `Buscar: ${filters.search}` }] : []),
		...(filters.status ?? []).map((status) => ({
			key: `status:${status}`,
			label: `Estado: ${ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}`,
		})),
		...(filters.priority ?? []).map((priority) => ({
			key: `priority:${priority}`,
			label: `Prioridad: ${ORDER_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority}`,
		})),
		...(filters.type ?? []).map((type) => ({
			key: `type:${type}`,
			label: `Tipo: ${ORDER_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type}`,
		})),
		...(filters.technicianId ? [{ key: "technicianId", label: "Técnico asignado" }] : []),
		...(filters.dateFrom || filters.dateTo ? [{ key: "dateRange", label: "Rango de fechas" }] : []),
	];

	return (
		<div className="space-y-3">
			<section
				aria-label="Order controls"
				className="relative z-10 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
			>
				<div className="grid min-w-0 gap-3">
					<OrdersSearch
						value={filters.search}
						onChange={(search) => onFilterChange({ search: search || undefined, page: 1 })}
					/>
					<div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						<select
							id="orders-filter-status"
							name="status"
							aria-label="Filtrar por estado"
							value=""
							onChange={(event) =>
								onFilterChange({
									status: toggleArrayValue(filters.status, event.target.value as OrderStatus),
									page: 1,
								})
							}
							className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						>
							<option value="">Estado</option>
							{ORDER_STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							id="orders-filter-priority"
							name="priority"
							aria-label="Filtrar por prioridad"
							value=""
							onChange={(event) =>
								onFilterChange({
									priority: toggleArrayValue(filters.priority, event.target.value as OrderPriority),
									page: 1,
								})
							}
							className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						>
							<option value="">Prioridad</option>
							{ORDER_PRIORITY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							id="orders-filter-type"
							name="type"
							aria-label="Filtrar por tipo"
							value=""
							onChange={(event) =>
								onFilterChange({
									type: toggleArrayValue(filters.type, event.target.value as OrderType),
									page: 1,
								})
							}
							className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] sm:col-span-2 lg:col-span-1"
						>
							<option value="">Tipo</option>
							{ORDER_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
					<div className="grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(11rem,1fr)_minmax(22rem,1.7fr)]">
						<TechnicianFilter
							value={filters.technicianId}
							onChange={(technicianId) =>
								onFilterChange({ technicianId: technicianId || undefined, page: 1 })
							}
						/>
						<DateRangeFilter
							dateFrom={isoToDateInput(filters.dateFrom)}
							dateTo={isoToDateInput(filters.dateTo)}
							onChange={(range) =>
								onFilterChange({
									dateFrom: dateInputToIso(range.dateFrom ?? "", "start"),
									dateTo: dateInputToIso(range.dateTo ?? "", "end"),
									page: 1,
								})
							}
						/>
					</div>
					<div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(9rem,auto)_minmax(10rem,auto)]">
						<OrdersGroupBy value={groupBy} onChange={onGroupByChange} />
						<OrderViewToggle view={view} listHref={listHref} kanbanHref={kanbanHref} />
						<OrderExportButton filters={filters} />
						<Link
							href="/orders/new"
							className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--shadow-brand)]"
						>
							<Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
							<span>Nueva OT</span>
						</Link>
					</div>
				</div>
				<div className="mt-3">
					<OrderFilterBadges
						badges={badges}
						onRemove={onRemoveFilter}
						onClearAll={onClearFilters}
					/>
				</div>
			</section>
			<OrderBulkActions selectedOrderIds={selectedOrderIds} onClear={onClearSelection} />
		</div>
	);
}
