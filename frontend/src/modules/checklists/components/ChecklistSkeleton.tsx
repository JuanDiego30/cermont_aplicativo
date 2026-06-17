export function ChecklistSkeleton() {
	const gridSkeletonKeys = Array.from({ length: 4 }, (_, i) => `cl-sk-grid-${i}`);
	const listSkeletonKeys = Array.from({ length: 4 }, (_, i) => `cl-sk-list-${i}`);

	return (
		<section className="space-y-4 rounded-xl border border-hairline bg-canvas p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
			<div className="h-5 w-44 animate-pulse rounded-full bg-zinc-200 dark:bg-surface" />
			<div className="h-10 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-surface" />
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{gridSkeletonKeys.map((k) => (
					<div key={k} className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-surface" />
				))}
			</div>
			<div className="h-2 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-surface" />
			<div className="space-y-3">
				{listSkeletonKeys.map((k) => (
					<div key={k} className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-surface" />
				))}
			</div>
		</section>
	);
}
