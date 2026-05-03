"use client";

import type { OrderListQuery, OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { flattenInfinitePages, useOrdersInfinite, useUpdateOrderStatus } from "@/orders/queries";
import { KanbanBoard } from "@/orders/ui/kanban";
import { OrdersErrorState } from "@/orders/ui/OrdersErrorState";
import { OrdersLoadingSkeleton } from "@/orders/ui/OrdersLoadingSkeleton";
import { type OrdersGroupByValue, OrdersToolbar } from "@/orders/ui/toolbar";

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

function StatusMutationBridge({
	orderId,
	status,
	onSettled,
}: {
	orderId: string;
	status: OrderStatus;
	onSettled: () => void;
}) {
	const mutation = useUpdateOrderStatus(orderId);
	useEffect(() => {
		void mutation
			.mutateAsync({ status })
			.then(() => toast.success("Orden movida"))
			.catch((error) =>
				toast.error(error instanceof Error ? error.message : "No se pudo mover la orden"),
			)
			.finally(onSettled);
	}, [mutation, onSettled, status]);
	return null;
}

export default function OrdersKanbanPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
	const [pendingMove, setPendingMove] = useState<{ orderId: string; status: OrderStatus } | null>(
		null,
	);

	const filters = useMemo<Partial<OrderListQuery>>(
		() => ({
			limit: Math.min(Number(searchParams.get("limit")) || 100, 100),
			search: searchParams.get("search") || undefined,
			status: readArrayParam(searchParams, "status") as OrderStatus[] | undefined,
			priority: readArrayParam(searchParams, "priority") as OrderPriority[] | undefined,
			type: readArrayParam(searchParams, "type") as OrderType[] | undefined,
			technicianId: searchParams.get("technicianId") || undefined,
			dateFrom: searchParams.get("dateFrom") || undefined,
			dateTo: searchParams.get("dateTo") || undefined,
		}),
		[searchParams],
	);
	const groupBy = (searchParams.get("groupBy") || "status") as OrdersGroupByValue;
	const query = useOrdersInfinite(filters);
	const orders = flattenInfinitePages(query.data);

	const replaceQuery = useCallback(
		(mutator: (params: URLSearchParams) => void) => {
			const next = new URLSearchParams(searchParams.toString());
			mutator(next);
			router.replace(makeHref("/orders/kanban", next));
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

	return (
		<section className="space-y-5" aria-labelledby="orders-kanban-title">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<Link
						href={makeHref("/orders", new URLSearchParams(searchParams.toString()))}
						className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Lista
					</Link>
					<h1 id="orders-kanban-title" className="text-xl font-bold text-[var(--text-primary)]">
						Kanban de Órdenes
					</h1>
				</div>
			</header>

			<OrdersToolbar
				filters={filters}
				view="kanban"
				groupBy={groupBy}
				selectedOrderIds={selectedOrderIds}
				onFilterChange={setFilterPatch}
				onRemoveFilter={removeFilter}
				onClearFilters={() => router.replace("/orders/kanban?limit=100")}
				onGroupByChange={(value) => setFilterPatch({ groupBy: value } as Partial<OrderListQuery>)}
				onClearSelection={() => setSelectedOrderIds([])}
				listHref={makeHref("/orders", new URLSearchParams(searchParams.toString()))}
				kanbanHref={makeHref("/orders/kanban", new URLSearchParams(searchParams.toString()))}
			/>

			{query.isError ? (
				<OrdersErrorState
					message={query.error instanceof Error ? query.error.message : undefined}
					onRetry={() => void query.refetch()}
				/>
			) : query.isLoading ? (
				<OrdersLoadingSkeleton />
			) : (
				<KanbanBoard
					orders={orders}
					groupBy={groupBy}
					onStatusChange={(orderId, status) => setPendingMove({ orderId, status })}
				/>
			)}

			{query.hasNextPage ? (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => void query.fetchNextPage()}
						className="min-h-11 rounded-lg border border-[var(--border-default)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
					>
						{query.isFetchingNextPage ? "Cargando..." : "Cargar más"}
					</button>
				</div>
			) : null}

			{pendingMove ? (
				<StatusMutationBridge
					orderId={pendingMove.orderId}
					status={pendingMove.status}
					onSettled={() => setPendingMove(null)}
				/>
			) : null}
		</section>
	);
}
