import { Skeleton } from "@/core/ui/Skeleton";

export default function Loading() {
	return (
		<div className="space-y-4 p-6">
			<Skeleton variant="text" className="h-12 w-full" />
			<div className="grid grid-cols-4 gap-4">
				<Skeleton variant="list-item" rows={4} />
				<Skeleton variant="list-item" rows={4} />
				<Skeleton variant="list-item" rows={4} />
				<Skeleton variant="list-item" rows={4} />
			</div>
		</div>
	);
}