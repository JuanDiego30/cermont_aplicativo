interface SkeletonProps {
	variant?:
		| "kpi-card"
		| "table-row"
		| "list-item"
		| "chart"
		| "text"
		| "avatar"
		| "card"
		| "circle"
		| "pageHeader"
		| "pageTitle";
	className?: string;
	rows?: number;
	height?: number | string;
}

const base =
	"animate-pulse rounded bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]";
const KPI_CARD_KEYS = ["card-1", "card-2", "card-3", "card-4"] as const;

function RowSkeleton({ rows = 1, className = "" }: { rows?: number; className?: string }) {
	const rowKeys = Array.from({ length: rows }, (_, rowIndex) => `row-${rowIndex}`);

	return (
		<div className={className}>
			{rowKeys.map((rowKey) => (
				<div key={rowKey} className={`mb-2 last:mb-0 h-4 w-full ${base}`} />
			))}
		</div>
	);
}

export function Skeleton({
	variant = "text",
	className = "",
	rows = 1,
	height = 24,
}: SkeletonProps) {
	if (variant === "kpi-card") {
		return (
			<div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
				{KPI_CARD_KEYS.map((cardKey) => (
					<div
						key={cardKey}
						className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card"
					>
						<div className="flex items-center justify-between">
							<div className={`h-4 w-24 ${base}`} />
							<div className={`size-10 rounded-xl ${base}`} />
						</div>
						<div className={`mt-4 h-8 w-20 ${base}`} />
						<div className={`mt-2 h-3 w-36 ${base}`} />
					</div>
				))}
			</div>
		);
	}

	if (variant === "table-row") {
		const rowKeys = Array.from({ length: rows }, (_, rowIndex) => `table-row-${rowIndex}`);

		return (
			<div className={className}>
				{rowKeys.map((rowKey) => (
					<div
						key={rowKey}
						className="grid grid-cols-[1fr_2fr_1fr_1fr_80px] gap-4 border-b border-[var(--border-subtle)] py-4 last:border-b-0"
					>
						<div className={`h-4 w-24 ${base}`} />
						<div className={`h-4 w-full ${base}`} />
						<div className={`h-5 w-20 rounded-full ${base}`} />
						<div className={`h-5 w-16 rounded-full ${base}`} />
						<div className={`h-4 w-10 justify-self-end ${base}`} />
					</div>
				))}
			</div>
		);
	}

	if (variant === "list-item") {
		const itemKeys = Array.from({ length: rows }, (_, rowIndex) => `list-item-${rowIndex}`);

		return (
			<div className={className}>
				{itemKeys.map((itemKey) => (
					<div
						key={itemKey}
						className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 last:mb-0"
					>
						<div className={`size-10 rounded-full ${base}`} />
						<div className="flex-1 space-y-2">
							<div className={`h-4 w-1/2 ${base}`} />
							<div className={`h-3 w-2/5 ${base}`} />
						</div>
						<div className={`h-5 w-16 rounded-full ${base}`} />
					</div>
				))}
			</div>
		);
	}

	if (variant === "chart") {
		return <div className={`${base} w-full`} style={{ height }} />;
	}

	if (variant === "avatar") {
		return <div className={`${base} rounded-full ${className}`} />;
	}
	if (variant === "circle") {
		return <div className={`${base} rounded-full ${className}`} />;
	}
	if (variant === "card") {
		return <div className={`${base} h-40 w-full ${className}`} />;
	}
	if (variant === "pageHeader") {
		return <div className={`h-16 w-full rounded-xl bg-surface-soft animate-pulse ${className}`} />;
	}
	if (variant === "pageTitle") {
		return <div className={`h-8 w-48 rounded-md bg-surface-soft animate-pulse ${className}`} />;
	}

	return rows > 1 ? (
		<RowSkeleton rows={rows} className={className} />
	) : (
		<div
			className={`${base} ${className}`}
			style={typeof height === "number" ? { height } : undefined}
		/>
	);
}
