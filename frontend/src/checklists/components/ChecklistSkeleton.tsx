export function ChecklistSkeleton() {
	const gridSkeletonKeys = Array.from({ length: 4 }, (_, i) => `cl-sk-grid-${i}`);
	const listSkeletonKeys = Array.from({ length: 4 }, (_, i) => `cl-sk-list-${i}`);

	return (
		<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<div className="h-5 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
			<div className="h-10 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{gridSkeletonKeys.map((k) => (
					<div key={k} className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
				))}
			</div>
			<div className="h-2 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
			<div className="space-y-3">
				{listSkeletonKeys.map((k) => (
					<div key={k} className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
				))}
			</div>
		</section>
	);
}
