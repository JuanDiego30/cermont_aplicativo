"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";

export interface CockpitTabDefinition {
	id: string;
	label: string;
	badge?: number;
	content: ReactNode;
}

interface CockpitTabsProps {
	tabs: CockpitTabDefinition[];
	ariaLabel: string;
}

export function CockpitTabs({ tabs, ariaLabel }: CockpitTabsProps) {
	const baseId = useId();
	const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
	const tabRefs = useRef<Array<HTMLButtonElement>>([]);
	const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

	if (tabs.length === 0) {
		return <div className="sr-only">Sin contenido disponible</div>;
	}

	const focusTabAt = (index: number) => {
		const total = tabs.length;
		const nextIndex = (index + total) % total;
		const nextTab = tabs[nextIndex];
		if (nextTab) {
			setActiveId(nextTab.id);
			tabRefs.current[nextIndex]?.focus();
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			focusTabAt(index + 1);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			focusTabAt(index - 1);
		} else if (event.key === "Home") {
			event.preventDefault();
			focusTabAt(0);
		} else if (event.key === "End") {
			event.preventDefault();
			focusTabAt(tabs.length - 1);
		}
	};

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-card">
			<div
				role="tablist"
				aria-label={ariaLabel}
				className="flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)] px-2 pt-2 no-scrollbar"
			>
				{tabs.map((tab, index) => {
					const isActive = tab.id === activeTab?.id;
					return (
						<button
							key={tab.id}
							ref={(element) => {
								if (element) {
									tabRefs.current[index] = element;
								}
							}}
							type="button"
							role="tab"
							id={`${baseId}-tab-${tab.id}`}
							aria-selected={isActive}
							aria-controls={`${baseId}-panel-${tab.id}`}
							tabIndex={isActive ? 0 : -1}
							onClick={() => setActiveId(tab.id)}
							onKeyDown={(event) => handleKeyDown(event, index)}
							className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-t-[var(--radius-md)] border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
								isActive
									? "border-[var(--color-brand)] text-[var(--color-brand)]"
									: "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
							}`}
						>
							{tab.label}
							{typeof tab.badge === "number" && tab.badge > 0 && (
								<span
									className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
										isActive
											? "bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]"
											: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
									}`}
								>
									{tab.badge}
								</span>
							)}
						</button>
					);
				})}
			</div>
			{activeTab && (
				<div
					role="tabpanel"
					id={`${baseId}-panel-${activeTab.id}`}
					aria-labelledby={`${baseId}-tab-${activeTab.id}`}
					className="p-5"
				>
					{activeTab.content}
				</div>
			)}
		</section>
	);
}
