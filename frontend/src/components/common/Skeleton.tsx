/**
 * Skeleton — Loading placeholder component
 *
 * Provides skeleton loaders with variants for common layout patterns.
 * Follows the Cermont design system with accessible loading indicators.
 *
 * @example
 * ```tsx
 * <Skeleton variant="card" />
 * <Skeleton variant="table" rows={5} />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="avatar" />
 * ```
 */

import { cn } from "@/lib/utils";

type SkeletonVariant = "card" | "table" | "text" | "avatar";

export interface SkeletonProps {
	/** Visual variant */
	variant?: SkeletonVariant;
	/** Number of rows for table/text variants */
	rows?: number;
	/** Additional CSS classes */
	className?: string;
	/** Accessible label */
	"aria-label"?: string;
}

const BASE_CLASS = "animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";

function CardSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("rounded-2xl border border-black/[0.05] bg-white p-6", className)}>
			<div className={cn(BASE_CLASS, "mb-4 h-4 w-3/4")} />
			<div className={cn(BASE_CLASS, "mb-3 h-3 w-1/2")} />
			<div className={cn(BASE_CLASS, "mb-6 h-3 w-2/3")} />
			<div className="flex gap-2">
				<div className={cn(BASE_CLASS, "h-8 w-20 rounded-full")} />
				<div className={cn(BASE_CLASS, "h-8 w-24 rounded-full")} />
			</div>
		</div>
	);
}

function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
	return (
		<div className={cn("space-y-2", className)}>
			{/* Header */}
			<div className="flex gap-4 px-4 py-3">
				<div className={cn(BASE_CLASS, "h-3 flex-1")} />
				<div className={cn(BASE_CLASS, "h-3 flex-1")} />
				<div className={cn(BASE_CLASS, "h-3 w-24")} />
				<div className={cn(BASE_CLASS, "h-3 w-20")} />
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static loading placeholder
					key={i}
					className="flex gap-4 border-t border-black/[0.05] px-4 py-4"
				>
					<div className={cn(BASE_CLASS, "h-4 flex-1")} />
					<div className={cn(BASE_CLASS, "h-4 flex-1")} />
					<div className={cn(BASE_CLASS, "h-4 w-24")} />
					<div className={cn(BASE_CLASS, "h-4 w-20")} />
				</div>
			))}
		</div>
	);
}

function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn("space-y-3", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static loading placeholder
					key={i}
					className={cn(BASE_CLASS, "h-3", i === lines - 1 ? "w-2/3" : "w-full")}
				/>
			))}
		</div>
	);
}

function AvatarSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div className={cn(BASE_CLASS, "size-10 rounded-full")} />
			<div className="flex flex-col gap-2">
				<div className={cn(BASE_CLASS, "h-3 w-24")} />
				<div className={cn(BASE_CLASS, "h-2 w-16")} />
			</div>
		</div>
	);
}

export function Skeleton({
	variant = "text",
	rows,
	className,
	"aria-label": ariaLabel = "Cargando contenido",
}: SkeletonProps) {
	const Component = (() => {
		switch (variant) {
			case "card":
				return <CardSkeleton className={className} />;
			case "table":
				return <TableSkeleton rows={rows} className={className} />;
			case "text":
				return <TextSkeleton lines={rows} className={className} />;
			case "avatar":
				return <AvatarSkeleton className={className} />;
			default:
				return <TextSkeleton lines={rows} className={className} />;
		}
	})();

	return (
		<div role="status" aria-label={ariaLabel} aria-busy="true">
			{Component}
			<span className="sr-only">{ariaLabel}</span>
		</div>
	);
}
