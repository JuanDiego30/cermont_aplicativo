"use client";

import type { OrderListQuery, OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flattenInfinitePages, useOrdersInfinite } from "@/orders/queries";
import { OrdersErrorState } from "@/orders/ui/OrdersErrorState";
import { OrdersLoadingSkeleton } from "@/orders/ui/OrdersLoadingSkeleton";
import { OrdersTable } from "@/orders/ui/OrdersTable";
import { OrdersTableEmpty } from "@/orders/ui/OrdersTableEmpty";
import { type OrdersGroupByValue, OrdersToolbar } from "@/orders/ui/toolbar";

gsap.registerPlugin(useGSAP);

function readArrayParam(searchParams: URLSearchParams, key: string): string[] | undefined {
	const values = searchParams
		.getAll(key)
		.flatMap((value) => value.split(","))
		.map((value) => value.trim())
		.filter(Boolean);
	return values.length > 0 ? values : undefined;
}

function makeHref(pathname: string, searchParams: URLSearchParams): string {
	const query = searchParams.toString();
	return query ? `${pathname}?${query}` : pathname;
}

export default function OrdersPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pageRef = useRef<HTMLElement>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

	const filters = useMemo<Partial<OrderListQuery>>(() => {
		const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
		return {
			limit,
			search: searchParams.get("search") || undefined,
			status: readArrayParam(searchParams, "status") as OrderStatus[] | undefined,
			priority: readArrayParam(searchParams, "priority") as OrderPriority[] | undefined,
			type: readArrayParam(searchParams, "type") as OrderType[] | undefined,
			technicianId: searchParams.get("technicianId") || undefined,
			dateFrom: searchParams.get("dateFrom") || undefined,
			dateTo: searchParams.get("dateTo") || undefined,
		};
	}, [searchParams]);

	const groupBy = (searchParams.get("groupBy") || "status") as OrdersGroupByValue;
	const query = useOrdersInfinite(filters);
	const orders = flattenInfinitePages(query.data);
	const totalLoaded = orders.length;
	const hasActiveFilters = Boolean(
		filters.search ||
			filters.status?.length ||
			filters.priority?.length ||
			filters.type?.length ||
			filters.technicianId ||
			filters.dateFrom ||
			filters.dateTo,
	);
	const allSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

	const replaceQuery = useCallback(
		(mutator: (params: URLSearchParams) => void) => {
			const next = new URLSearchParams(searchParams.toString());
			mutator(next);
			next.delete("cursor");
			router.replace(makeHref("/orders", next));
		},
		[router, searchParams],
	);

	const setFilterPatch = useCallback(
		(patch: Partial<OrderListQuery>) => {
			replaceQuery((next) => {
				for (const [key, value] of Object.entries(patch)) {
					next.delete(key);
					if (value === undefined || value === null || value === "") {
						continue;
					}
					if (Array.isArray(value)) {
						for (const entry of value) {
							next.append(key, String(entry));
						}
						continue;
					}
					next.set(key, String(value));
				}
			});
		},
		[replaceQuery],
	);

	const clearFilters = useCallback(() => {
		router.replace("/orders?limit=50");
	}, [router]);

	const removeFilter = useCallback(
		(key: string) => {
			replaceQuery((next) => {
				if (key.includes(":")) {
					const [filterKey, value] = key.split(":");
					const remaining = next.getAll(filterKey).filter((entry) => entry !== value);
					next.delete(filterKey);
					for (const entry of remaining) {
						next.append(filterKey, entry);
					}
					return;
				}
				if (key === "dateRange") {
					next.delete("dateFrom");
					next.delete("dateTo");
					return;
				}
				next.delete(key);
			});
		},
		[replaceQuery],
	);

	const toggleOrderSelection = (orderId: string) => {
		setSelectedOrderIds((current) =>
			current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
		);
	};

	const toggleAllSelection = () => {
		setSelectedOrderIds(allSelected ? [] : orders.map((order) => order._id));
	};

	const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

	useEffect(() => {
		const node = loadMoreRef.current;
		if (!node || !hasNextPage) {
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting && !isFetchingNextPage) {
				void fetchNextPage();
			}
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Removed useGSAP - was causing re-renders and infinite loop

	return (
		<section ref={pageRef} aria-labelledby="orders-page-title" className="space-y-5">
			<header
				data-orders-reveal
				className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
			>
				<div>
					<h1 id="orders-page-title" className="text-xl font-bold text-[var(--text-primary)]">
						Órdenes de Trabajo
					</h1>
					<p className="text-sm text-[var(--text-secondary)]">
						{query.isLoading ? "Cargando..." : `${totalLoaded} órdenes cargadas`}
					</p>
				</div>
			</header>

			<div data-orders-reveal>
				<OrdersToolbar
					filters={filters}
					view="list"
					groupBy={groupBy}
					selectedOrderIds={selectedOrderIds}
					onFilterChange={setFilterPatch}
					onRemoveFilter={removeFilter}
					onClearFilters={clearFilters}
					onGroupByChange={(value) => setFilterPatch({ groupBy: value } as Partial<OrderListQuery>)}
					onClearSelection={() => setSelectedOrderIds([])}
					listHref={makeHref("/orders", new URLSearchParams(searchParams.toString()))}
					kanbanHref={makeHref("/orders/kanban", new URLSearchParams(searchParams.toString()))}
				/>
			</div>

			{query.isError ? (
				<OrdersErrorState
					message={query.error instanceof Error ? query.error.message : undefined}
					onRetry={() => void query.refetch()}
				/>
			) : query.isLoading ? (
				<OrdersLoadingSkeleton />
			) : orders.length === 0 ? (
				<OrdersTableEmpty hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
			) : (
				<div
					data-orders-reveal
					className="overflow-x-auto rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]"
				>
					<OrdersTable
						orders={orders}
						selectedOrderIds={selectedOrderIds}
						onToggleOrderSelection={toggleOrderSelection}
						onToggleSelectAll={toggleAllSelection}
					/>
				</div>
			)}

			<div ref={loadMoreRef} className="flex min-h-14 items-center justify-center">
				{query.isFetchingNextPage ? (
					<span className="text-sm text-[var(--text-secondary)]">Cargando más órdenes...</span>
				) : query.hasNextPage ? (
					<button
						type="button"
						onClick={() => void query.fetchNextPage()}
						className="min-h-11 rounded-lg border border-[var(--border-default)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
					>
						Cargar más
					</button>
				) : totalLoaded > 0 ? (
					<span className="text-xs text-[var(--text-tertiary)]">Fin de la lista</span>
				) : null}
			</div>
		</section>
	);
}
