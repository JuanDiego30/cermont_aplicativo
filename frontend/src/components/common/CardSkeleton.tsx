import { Skeleton } from "@/core/ui/Skeleton";

interface CardSkeletonProps {
	count?: number;
	columns?: 1 | 2 | 3 | 4;
	className?: string;
}

let cardIdCounter = 0;
function nextCardId(): string {
	cardIdCounter += 1;
	return `card-sk-${cardIdCounter}`;
}

export function CardSkeleton({ count = 3, columns = 3, className }: CardSkeletonProps) {
	const keys = Array.from({ length: count }, () => nextCardId());
	const colClass = {
		1: "grid-cols-1",
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	}[columns];

	return (
		<section aria-label="Cargando tarjetas" className={className}>
			<div className={`grid gap-4 ${colClass}`}>
				{keys.map((key) => (
					<div
						key={key}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1 space-y-2">
								<Skeleton variant="text" height={16} className="w-2/3" />
								<Skeleton variant="text" height={12} className="w-1/3" />
							</div>
							<Skeleton variant="circle" className="size-10 shrink-0" />
						</div>
						<div className="mt-4 space-y-2">
							<Skeleton variant="text" height={12} className="w-full" />
							<Skeleton variant="text" height={12} className="w-5/6" />
						</div>
						<div className="mt-4 flex items-center gap-2">
							<Skeleton variant="text" height={28} className="w-24 rounded-full" />
							<Skeleton variant="text" height={28} className="w-24 rounded-full" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
