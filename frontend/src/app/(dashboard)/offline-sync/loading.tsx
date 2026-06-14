import { Skeleton } from "@/core/ui/Skeleton";

export default function OfflineSyncLoading() {
	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<Skeleton variant="text" className="h-9 w-80" />
			<Skeleton variant="kpi-card" />
			<Skeleton variant="card" />
			<Skeleton variant="card" />
		</div>
	);
}
