"use client";

interface OrdersTableSkeletonProps {
	count?: number;
}

export function OrdersTableSkeleton({ count = 5 }: OrdersTableSkeletonProps) {
	const skeletonKeys = Array.from({ length: count }, (_, i) => `order-sk-${i}`);

	return (
		<section className="space-y-3" aria-label="Cargando órdenes">
			{skeletonKeys.map((k) => (
				<div
					key={k}
					className="h-16 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)]"
					aria-hidden="true"
				/>
			))}
		</section>
	);
}
