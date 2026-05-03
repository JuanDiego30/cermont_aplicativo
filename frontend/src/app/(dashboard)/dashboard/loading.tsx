import { Skeleton } from "@/core/ui/Skeleton";

export default function DashboardPageLoading() {
	return (
		<div className="space-y-4 p-6">
			<Skeleton variant="text" className="h-[72px] w-full" />
			<Skeleton variant="kpi-card" />
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Skeleton variant="chart" height={240} />
				<Skeleton variant="chart" height={240} />
			</div>
		</div>
	);
}
