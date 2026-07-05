"use client";

import type { Cost, CostSummary } from "@cermont/shared-types";
import { Download } from "lucide-react";
import { Button } from "@/core/ui/Button";
import { downloadCostExport } from "../cost-export";

export function CostExportButton({
	summary,
	costs,
}: {
	summary: CostSummary;
	costs: readonly Cost[];
}) {
	return (
		<Button
			type="button"
			variant="secondary"
			size="sm"
			disabled={costs.length === 0}
			onClick={() => downloadCostExport(summary, costs)}
		>
			<Download aria-hidden="true" />
			Exportar CSV
		</Button>
	);
}
