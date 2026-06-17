import { Skeleton } from "@/core/ui/Skeleton";

export default function ErpConnectorsLoading() {
	return (
		<section aria-label="Loading ERP connectors" className="space-y-4 p-6">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-6 w-72" />
			<div className="grid gap-4 md:grid-cols-2">
				{[0, 1, 2, 3].map((i) => (
					<Skeleton key={`skel-${i}`} className="h-36 rounded-xl" />
				))}
			</div>
		</section>
	);
}
