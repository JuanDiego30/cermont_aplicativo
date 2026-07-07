"use client";

import { useState } from "react";

interface Tab {
	id: string;
	label: string;
	content: React.ReactNode;
}

interface Props {
	tabs: Tab[];
}

export function CockpitTabs({ tabs }: Props) {
	const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

	return (
		<div>
			<div className="flex border-b border-[var(--border-subtle)]" role="tablist">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={activeTab === tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`px-5 py-3 text-sm font-medium transition-colors ${
							activeTab === tab.id
								? "border-b-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
								: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="py-4" role="tabpanel">
				{tabs.find((t) => t.id === activeTab)?.content}
			</div>
		</div>
	);
}
