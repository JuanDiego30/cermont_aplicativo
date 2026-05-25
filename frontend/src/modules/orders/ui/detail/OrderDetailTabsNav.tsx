"use client";

import * as Tabs from "@radix-ui/react-tabs";
import {
	CalendarRange,
	Camera,
	ClipboardCheck,
	FileText,
	Flag,
	FolderOpen,
	ReceiptText,
	Wrench,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { cn } from "@/lib/utils";
import { cloneSearchParams, readSearchParam } from "@/lib/utils/search-params";

const TABS = [
	{ value: "detalles", label: "Detalles", Icon: FileText },
	{ value: "planificacion", label: "Planificación", Icon: CalendarRange },
	{ value: "ejecucion", label: "Ejecución", Icon: Wrench },
	{ value: "costos", label: "Costos", Icon: ReceiptText },
	{ value: "inspecciones", label: "Inspecciones", Icon: ClipboardCheck },
	{ value: "evidencias", label: "Evidencias", Icon: Camera },
	{ value: "documentos", label: "Documentos", Icon: FolderOpen },
	{ value: "cierre", label: "Cierre", Icon: Flag },
] as const;

interface OrderDetailTabsNavProps {
	orderId: string;
}

export function OrderDetailTabsNav(props: OrderDetailTabsNavProps) {
	return (
		<Suspense fallback={<OrderDetailTabsSkeleton />}>
			<OrderDetailTabsNavInner {...props} />
		</Suspense>
	);
}

function OrderDetailTabsSkeleton() {
	return (
		<div className="h-[50px] rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
	);
}

function OrderDetailTabsNavInner({ orderId: _orderId }: OrderDetailTabsNavProps) {
	const { replace } = useRouter();
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);
	const activeTab = getSearchParam("tab") ?? "detalles";

	const handleValueChange = useCallback(
		(value: string) => {
			const params = cloneSearchParams(searchParams);
			params.set("tab", value);
			replace(`?${params.toString()}`, { scroll: false });
		},
		[replace, searchParams],
	);

	return (
		<Tabs.Root value={activeTab} onValueChange={handleValueChange} className="w-full">
			<nav aria-label="Secciones de la orden">
				<Tabs.List
					className="flex w-full gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 scrollbar-hide dark:border-zinc-800 dark:bg-zinc-950"
					role="tablist"
				>
					{TABS.map(({ value, label, Icon }) => (
						<Tabs.Trigger
							key={value}
							value={value}
							className={cn(
								"group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all",
								"text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
								"data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm",
								"dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
								"dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-400",
							)}
							role="tab"
							aria-selected={activeTab === value}
						>
							<Icon
								className="size-4 shrink-0 transition-colors group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400"
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
