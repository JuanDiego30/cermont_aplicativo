import { Skeleton } from "@/core/ui/Skeleton";

export default function AdminAuditLoading() {
	return (
		<output className="space-y-4" aria-label="Cargando auditoría">
			<Skeleton variant="text" className="h-8 w-64" />
			<Skeleton variant="card" height={220} />
			<Skeleton variant="card" height={160} />
			<Skeleton variant="card" height={160} />
		</output>
	);
}
