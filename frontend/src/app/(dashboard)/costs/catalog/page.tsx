"use client";

import { CostCatalogForm } from "@/modules/costs/ui/CostCatalogForm";
import { CostCatalogPanel } from "@/modules/costs/ui/CostCatalogPanel";

export default function CostCatalogPage() {
	return (
		<div className="p-4 md:p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Catálogo de Costos</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Base de referencia de valores unitarios para materiales, cuadrillas, equipos y transporte
				</p>
			</div>

			<div className="space-y-6">
				<CostCatalogForm onSubmit={(data) => console.log("New catalog item:", data)} />
				<CostCatalogPanel />
			</div>
		</div>
	);
}
