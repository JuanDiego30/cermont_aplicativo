import { Skeleton } from "@/core/ui/Skeleton";

export default function Loading() {
	return (
		<div className="space-y-4 p-6">
			<Skeleton variant="text" className="h-12 w-full" />
			<Skeleton variant="table-row" rows={8} />
		</div>
	);
}
