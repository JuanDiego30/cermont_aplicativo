import { Skeleton } from "@/core/ui/Skeleton";

export default function ProposalsLoading() {
	return (
		<div className="space-y-4">
			<Skeleton variant="text" className="h-12 w-full" />
			<Skeleton variant="text" className="h-16 w-full" />
			<Skeleton variant="table-row" rows={6} />
		</div>
	);
}
