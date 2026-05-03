import { AlertTriangle, RotateCw } from "lucide-react";

interface OrdersErrorStateProps {
	message?: string;
	onRetry: () => void;
}

export function OrdersErrorState({ message, onRetry }: OrdersErrorStateProps) {
	return (
		<section
			role="alert"
			className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700"
		>
			<AlertTriangle className="h-8 w-8" aria-hidden="true" />
			<div>
				<h2 className="text-base font-semibold">No se pudieron cargar las órdenes</h2>
				<p className="mt-1 text-sm">{message ?? "Reintenta la consulta en unos segundos."}</p>
			</div>
			<button
				type="button"
				onClick={onRetry}
				className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white"
			>
				<RotateCw className="h-4 w-4" aria-hidden="true" />
				Reintentar
			</button>
		</section>
	);
}
