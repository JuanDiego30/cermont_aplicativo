import { Skeleton } from "@/core/ui/Skeleton";

export default function BusinessDocumentsLoading() {
	return (
		<section aria-label="Loading business documents" className="space-y-4 p-6">
			<Skeleton className="h-8 w-64" />
			<div className="flex gap-2">
				<Skeleton className="h-8 w-16 rounded-full" />
				<Skeleton className="h-8 w-32 rounded-full" />
				<Skeleton className="h-8 w-28 rounded-full" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={`skel-${i}`} className="h-40 rounded-xl" />
				))}
			</div>
		</section>
	);
}
