"use client";

import type { OrderListQuery } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { readSearchParam, searchParamsToString } from "@/lib/utils/search-params";
import { useOrders } from "@/modules/orders/queries";
import { OrdersTable } from "@/modules/orders/ui/OrdersTable";
import { OrdersPageFilters } from "./OrdersPageFilters";
import { OrdersPageHeader } from "./OrdersPageHeader";
import { OrdersPagePagination } from "./OrdersPagePagination";
import { OrdersPageSelectionBar } from "./OrdersPageSelectionBar";

gsap.registerPlugin(useGSAP);

function parseOrdersFilters(searchParams: URLSearchParams) {
	const page = Number(readSearchParam(searchParams, "page")) || 1;
	const limit = Number(readSearchParam(searchParams, "limit")) || 20;
	const search = readSearchParam(searchParams, "search") || undefined;
	const statusFilter = readSearchParam(searchParams, "status") as NonNullable<
		OrderListQuery["status"]
	>;
	const priorityFilter = readSearchParam(searchParams, "priority") as NonNullable<
		OrderListQuery["priority"]
	>;

	const filters: Partial<OrderListQuery> = { page, limit };
	if (search) {
		filters.search = search;
	}
	if (statusFilter) {
		filters.status = statusFilter;
	}
	if (priorityFilter) {
		filters.priority = priorityFilter;
	}

	return { page, limit, search, statusFilter, priorityFilter, filters };
}

function buildOrdersPageHref(searchParamsStr: string, p: number, l: number): string {
	const q = new URLSearchParams(searchParamsStr);
	q.set("page", String(p));
	q.set("limit", String(l));
	return `/orders?${q.toString()}`;
}

function buildOrdersClearHref(searchParamsStr: string, l: number): string {
	const q = new URLSearchParams(searchParamsStr);
	q.set("page", "1");
	q.set("limit", String(l));
	return `/orders?${q.toString()}`;
}

export default function OrdersPage() {
	return (
		<Suspense fallback={<OrdersLoading />}>
			<OrdersPageInner />
		</Suspense>
	);
}

function OrdersLoading() {
	return (
		<section aria-labelledby="orders-page-title" className="space-y-5">
			<output
				className="flex h-64 items-center justify-center rounded-lg border border-border bg-card shadow-sm"
				aria-live="polite"
			>
				<span className="text-secondary">Cargando datos…</span>
			</output>
		</section>
	);
}

function OrdersPageInner() {
	const searchParams = useSearchParams();
	const { push } = useRouter();
	const pageRef = useRef<HTMLElement>(null);
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

	const { page, limit, search, statusFilter, priorityFilter, filters } =
		parseOrdersFilters(searchParams);

	const { data: orderPage, isLoading, error } = useOrders(filters);
	const orders = orderPage?.items ?? [];
	const total = orderPage?.total ?? 0;
	const totalPages = orderPage?.pages ?? Math.ceil(total / Math.max(limit, 1));
	const selectedCount = selectedOrderIds.length;
	const allSelected = orders.length > 0 && selectedCount === orders.length;
	const hasActiveFilters = Boolean(statusFilter || priorityFilter || search);
	const searchParamsStr = searchParamsToString(searchParams);

	useGSAP(
		() => {
			if (prefersReducedMotion()) {
				return;
			}

			gsap.from("[data-orders-reveal]", {
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

	const toggleOrderSelection = (orderId: string) => {
		setSelectedOrderIds((current) =>
			current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
		);
	};

	const toggleAllSelection = () => {
		setSelectedOrderIds((current) =>
			current.length === orders.length ? [] : orders.map((order) => order._id),
		);
	};

	const buildHref = (p: number) => buildOrdersPageHref(searchParamsStr, p, limit);
	const buildClearHref = () => buildOrdersClearHref(searchParamsStr, limit);

	return (
		<section ref={pageRef} aria-labelledby="orders-page-title" className="space-y-5">
			<OrdersPageHeader total={total} isLoading={isLoading} />

			<OrdersPageFilters
				search={search}
				statusFilter={statusFilter}
				priorityFilter={priorityFilter}
				hasActiveFilters={hasActiveFilters}
				buildClearHref={buildClearHref}
			/>

			<OrdersPageSelectionBar
				selectedCount={selectedCount}
				allSelected={allSelected}
				onToggleAll={toggleAllSelection}
				onClearSelection={() => setSelectedOrderIds([])}
			/>

			{error && (
				<aside
					data-orders-reveal
					role="alert"
					className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
				>
					Ocurrió un error al cargar las órdenes.
				</aside>
			)}

			{isLoading ? (
				<output
					data-orders-reveal
					className="flex h-64 items-center justify-center rounded-lg border border-border bg-card shadow-sm"
					aria-live="polite"
				>
					<span className="text-secondary">Cargando datos…</span>
				</output>
			) : orders.length === 0 ? (
				<div data-orders-reveal className="rounded-lg border border-border bg-card shadow-sm">
					<EmptyState
						title="No se encontraron órdenes"
						description="Prueba ajustando los filtros o la búsqueda."
						action={
							hasActiveFilters
								? {
										label: "Limpiar filtros",
										onClick: () => {
											push(buildClearHref());
										},
									}
								: undefined
						}
					/>
				</div>
			) : (
				<div
					data-orders-reveal
					className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
				>
					<OrdersTable
						orders={orders}
						selectedOrderIds={selectedOrderIds}
						onToggleOrderSelection={toggleOrderSelection}
						onToggleSelectAll={toggleAllSelection}
					/>
				</div>
			)}

			<OrdersPagePagination
				page={page}
				totalPages={totalPages}
				total={total}
				ordersCount={orders.length}
				buildHref={buildHref}
				isLoading={isLoading}
			/>
		</section>
	);
}
