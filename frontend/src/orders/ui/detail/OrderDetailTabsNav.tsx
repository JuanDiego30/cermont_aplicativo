"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { CalendarCheck, CalendarRange, FileText, Receipt, Wallet, Wrench } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { cn } from "@/_shared/lib/utils";

const TABS = [
	{ value: "propuesta", label: "Propuesta", Icon: FileText },
	{ value: "planeacion", label: "Planeación", Icon: CalendarRange },
	{ value: "ejecucion", label: "Ejecución", Icon: Wrench },
	{ value: "informe", label: "Informe", Icon: CalendarCheck },
	{ value: "facturacion", label: "Facturación", Icon: Receipt },
	{ value: "costos", label: "Costos", Icon: Wallet },
] as const;

// Backwards compatibility mapping from old tabs to new tabs
const TAB_REDIRECTS: Record<string, string> = {
	detalles: "propuesta",
	planificacion: "planeacion",
	cierre: "informe",
	documentos: "informe",
	evidencias: "informe",
	inspecciones: "ejecucion",
};

export function OrderDetailTabsNav() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab") ?? "propuesta";

	// Backwards compatibility: redirect old tab URLs to new equivalent tabs
	const activeTab = TAB_REDIRECTS[tabParam] ?? tabParam;

	useEffect(() => {
		if (TAB_REDIRECTS[tabParam]) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", TAB_REDIRECTS[tabParam]);
			router.replace(`?${params.toString()}`, { scroll: false });
		}
	}, [tabParam, router, searchParams]);

	const handleValueChange = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", value);
			router.replace(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	return (
		<Tabs.Root value={activeTab} onValueChange={handleValueChange} className="w-full">
			<nav aria-label="Secciones de la orden">
				<Tabs.List
					className="flex w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 scrollbar-hide dark:border-slate-800 dark:bg-slate-950"
					role="tablist"
				>
					{TABS.map(({ value, label, Icon }) => (
						<Tabs.Trigger
							key={value}
							value={value}
							className={cn(
								"group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all",
								"text-slate-600 hover:bg-slate-100 hover:text-slate-900",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
								"data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm",
								"dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
								"dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-400",
							)}
							role="tab"
							aria-selected={activeTab === value}
						>
							<Icon
								className="h-4 w-4 shrink-0 transition-colors group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400"
								aria-hidden="true"
							/>
							<span className="hidden sm:inline">{label}</span>
							<span className="sm:hidden">{label.slice(0, 3)}</span>
						</Tabs.Trigger>
					))}
				</Tabs.List>
			</nav>
		</Tabs.Root>
	);
}
