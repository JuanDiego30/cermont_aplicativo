"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { BarChart3, CheckSquare, Table2 } from "lucide-react";
import { ApprovalInbox, ReportsAnalyticsSection, ReportsDataTable, ReportsKpiBar } from "@/reports";

const REPORT_TABS = [
	{ id: "approval", label: "Aprobación", icon: CheckSquare },
	{ id: "analytics", label: "Analítica", icon: BarChart3 },
	{ id: "table", label: "Tabla", icon: Table2 },
] as const;

export default function ReportsPage() {
	return (
		<main className="space-y-6 p-4 md:p-6 lg:p-8">
			<header className="flex flex-col gap-2">
				<p className="text-sm font-semibold text-[var(--text-secondary)]">
					Hub de aprobación y facturación
				</p>
				<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
					Centro de Reportes
				</h1>
				<p className="max-w-3xl text-sm text-[var(--text-secondary)]">
					Aprueba informes, revisa cuellos de botella y exporta evidencias sin salir de la página.
				</p>
			</header>

			<Tabs.Root defaultValue="approval" className="space-y-6">
				<Tabs.List
					aria-label="Report views"
					className="inline-flex w-full gap-1 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-1 sm:w-auto"
				>
					{REPORT_TABS.map((tab) => {
						const Icon = tab.icon;
						return (
							<Tabs.Trigger
								key={tab.id}
								value={tab.id}
								className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] data-[state=active]:bg-[var(--color-info-bg)] data-[state=active]:text-[var(--color-brand-blue)]"
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
								{tab.label}
							</Tabs.Trigger>
						);
					})}
				</Tabs.List>

				<Tabs.Content value="approval" className="space-y-6 focus:outline-none">
					<ReportsKpiBar />
					<ApprovalInbox />
				</Tabs.Content>

				<Tabs.Content value="analytics" className="focus:outline-none">
					<ReportsAnalyticsSection />
				</Tabs.Content>

				<Tabs.Content value="table" className="focus:outline-none">
					<ReportsDataTable />
				</Tabs.Content>
			</Tabs.Root>
		</main>
	);
}
