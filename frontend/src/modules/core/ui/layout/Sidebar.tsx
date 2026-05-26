"use client";

import { isAuthenticatedRole } from "@cermont/domain";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "@/core/ui/Logo";
import { APP_ROUTES } from "@/lib/routes";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	AI_ASSISTANT_ICON,
	getVisibleNavigationGroups,
	type NavigationItem,
} from "@/modules/core/navigation";
import { usePendingWorkRequestCount } from "@/modules/work-requests/queries";
import { useUIStore } from "@/store/ui.store";

gsap.registerPlugin(useGSAP);
const AssistantIcon = AI_ASSISTANT_ICON;

interface SidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

function SidebarNavItem({
	currentPath,
	item,
	onNavigate,
	sidebarCollapsed,
}: {
	currentPath: string;
	item: NavigationItem;
	onNavigate: () => void;
	sidebarCollapsed: boolean;
}) {
	const { to, label, icon: Icon } = item;
	const isActive = currentPath === to || currentPath.startsWith(`${to}/`);

	return (
		<li key={to}>
			<Link
				href={to}
				aria-current={isActive ? "page" : undefined}
				onClick={onNavigate}
				className={`group flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2 text-sm transition-all duration-200 ${
					isActive
						? "bg-[var(--surface-sidebar-active)] text-[var(--color-brand)] font-semibold"
						: "text-[var(--text-secondary)] hover:bg-[var(--surface-sidebar-hover)] hover:text-[var(--text-primary)]"
				}`}
				title={sidebarCollapsed ? label : undefined}
			>
				<Icon
					className={`size-4.5 shrink-0 transition-all ${
						isActive
							? "text-[var(--color-brand)] scale-110"
							: "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
					}`}
					aria-hidden="true"
				/>
				<span
					className={`truncate transition-all duration-300 ${sidebarCollapsed ? "opacity-0 lg:sr-only" : "opacity-100"}`}
				>
					{label}
				</span>
				{item.badge !== undefined && item.badge > 0 && (
					<span
						className={`ml-auto rounded-full bg-[var(--color-brand-blue)] px-2 py-0.5 text-[10px] font-semibold text-white ${sidebarCollapsed ? "sr-only" : ""}`}
						role="status"
						aria-label={`${item.badge} pendientes`}
					>
						{item.badge}
					</span>
				)}
			</Link>
		</li>
	);
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
	const pathname = usePathname();
	const { accessToken, user } = useAuth();
	const { toggleChat, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
	const userRoleStr = user?.role;
	const userRole =
		typeof userRoleStr === "string" && isAuthenticatedRole(userRoleStr) ? userRoleStr : undefined;
	const { data: pendingWRCount = 0 } = usePendingWorkRequestCount(Boolean(userRole && accessToken));
	const currentPath = pathname ?? "";
	const visibleNavigationGroups = userRole ? getVisibleNavigationGroups(userRole) : [];

	const sidebarRef = useRef<HTMLElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	// Entrance animations
	useGSAP(
		() => {
			if (prefersReducedMotion()) {
				return;
			}
			if (!sidebarRef.current) {
				return;
			}

			const navGroups = sidebarRef.current.querySelectorAll("[data-sidebar-nav-group]");
			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

			tl.from("[data-sidebar-logo]", {
				opacity: 0,
				y: -10,
				duration: 0.6,
			});

			if (navGroups.length > 0) {
				tl.from(
					navGroups,
					{
						opacity: 0,
						x: -10,
						stagger: 0.05,
						duration: 0.5,
					},
					"-=0.3",
				);
			}
		},
		{ scope: sidebarRef, dependencies: [] },
	);

	// Close on outside click (mobile)
	useEffect(() => {
		const clickHandler = (e: MouseEvent) => {
			if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
				setSidebarOpen(false);
			}
		};
		if (sidebarOpen) {
			document.addEventListener("mousedown", clickHandler);
		}
		return () => document.removeEventListener("mousedown", clickHandler);
	}, [sidebarOpen, setSidebarOpen]);

	return (
		<>
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					ref={overlayRef}
					className="fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-sm lg:hidden transition-opacity"
					aria-hidden="true"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				ref={sidebarRef}
				id="sidebar"
				aria-label="Barra de navegación lateral"
				className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] transition-all duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
				} ${sidebarCollapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"}`}
			>
				{/* Logo Section */}
				<div
					data-sidebar-logo
					className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]/50 mb-2"
				>
					<Logo size="sm" className="gap-2.5" hideWordmarkOnMobile={false} />
					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] lg:hidden transition-colors"
						aria-label="Cerrar navegación"
					>
						<X className="size-5" aria-hidden="true" />
					</button>
				</div>

				{/* Collapse Toggle (Desktop) */}
				<div className="hidden lg:flex px-3 pb-4">
					<button
						type="button"
						onClick={toggleSidebarCollapsed}
						className="flex w-full items-center justify-center rounded-xl py-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-all"
						title={sidebarCollapsed ? "Expandir" : "Colapsar"}
					>
						<ChevronRight
							className={`size-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-0" : "rotate-180"}`}
							aria-hidden="true"
						/>
					</button>
				</div>

				{/* Navigation */}
				<nav
					aria-label="Navegación principal"
					className="flex-1 overflow-y-auto px-3 custom-scrollbar"
				>
					{visibleNavigationGroups.map((group) => {
						return (
							<section key={group.label} data-sidebar-nav-group className="mb-6 last:mb-2">
								{!sidebarCollapsed && (
									<h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] font-mono">
										{group.label}
									</h3>
								)}
								<ul className="space-y-0.5">
									{group.items.map((item) => (
										<SidebarNavItem
											key={item.to}
											currentPath={currentPath}
											item={
												item.to === APP_ROUTES.workRequests && pendingWRCount > 0
													? { ...item, badge: pendingWRCount }
													: item
											}
											onNavigate={() => setSidebarOpen(false)}
											sidebarCollapsed={sidebarCollapsed}
										/>
									))}
								</ul>
							</section>
						);
					})}
				</nav>

				{/* AI Assistant Section */}
				<div className="p-3 mt-auto">
					<button
						type="button"
						onClick={toggleChat}
						className={`group flex items-center rounded-2xl transition-all duration-200 ${
							sidebarCollapsed
								? "size-10 justify-center bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)] mx-auto"
								: "w-full gap-3 bg-[var(--surface-secondary)] p-3 border border-[var(--border-subtle)] hover:border-[var(--color-brand)]/30 hover:bg-[var(--color-brand-blue-bg)]/30"
						}`}
					>
						<div
							className={`flex items-center justify-center rounded-xl transition-all ${
								sidebarCollapsed
									? "size-8"
									: "size-10 bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)] shadow-sm ring-1 ring-[var(--color-brand)]/10"
							}`}
						>
							<AssistantIcon className="size-5" aria-hidden="true" />
						</div>
						{!sidebarCollapsed && (
							<div className="min-w-0 text-left">
								<p className="text-sm font-bold text-[var(--text-primary)]">Cermont AI</p>
								<p className="truncate text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] font-mono">
									Asistente
								</p>
							</div>
						)}
					</button>
				</div>
			</aside>
		</>
	);
}
