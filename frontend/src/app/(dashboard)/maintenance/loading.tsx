import { Skeleton } from "@/core/ui/Skeleton";

export default function MaintenanceLoading() {
	return (
		<div className="space-y-4">
			<Skeleton variant="text" className="h-12 w-full" />
			<Skeleton variant="kpi-card" />
			<Skeleton variant="list-item" rows={6} />
		</div>
	);
}
