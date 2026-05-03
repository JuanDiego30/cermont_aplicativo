"use client";

import {
	ADMIN_PLUS_RESIDENT_ENGINEER,
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	isAuthenticatedRole,
	type UserRole,
} from "@cermont/shared-types/rbac";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
	BarChart3,
	Bot,
	Camera,
	ChevronRight,
	ClipboardList,
	DollarSign,
	FileCheck,
	FileText,
	LayoutDashboard,
	Package,
	Users,
	Wrench,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUIStore } from "@/_shared/store/ui.store";
import { useAuth } from "@/auth/hooks/useAuth";
import { Logo } from "@/core/ui/Logo";

gsap.registerPlugin(useGSAP);

interface SidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

const NAV_GROUPS: {
	label: string;
	items: { to: string; label: string; icon: typeof LayoutDashboard; allowedRoles?: UserRole[] }[];
}[] = [
	{
		label: "Main",
		items: [
			{
				to: "/dashboard",
				label: "Dashboard",
				icon: LayoutDashboard,
				allowedRoles: [...ALL_AUTHENTICATED_ROLES],
			},
			{
				to: "/orders",
				label: "Work Orders",
				icon: ClipboardList,
				allowedRoles: [...ALL_AUTHENTICATED_ROLES],
			},
			{
				to: "/maintenance",
				label: "Maintenance Kits",
				icon: Wrench,
				allowedRoles: [
					"manager",
					"resident_engineer",
					"hse_coordinator",
					"supervisor",
					"operator",
					"technician",
				],
			},
		],
	},
	{
		label: "Operations",
		items: [
			{
				to: "/resources",
				label: "Assets and Kits",
				icon: Package,
				allowedRoles: [...ADMIN_PLUS_RESIDENT_ENGINEER],
			},
			{
				to: "/proposals",
				label: "Proposals",
				icon: FileCheck,
				allowedRoles: [...ADMIN_PLUS_RESIDENT_ENGINEER],
			},
			{
				to: "/documents",
				label: "Documents",
				icon: FileText,
				allowedRoles: [...ADMIN_PLUS_RESIDENT_ENGINEER],
			},
			{
				to: "/evidences",
				label: "Evidence",
				icon: Camera,
				allowedRoles: [
					"manager",
					"resident_engineer",
					"hse_coordinator",
					"supervisor",
					"operator",
					"technician",
				],
			},
			{
				to: "/costs",
				label: "Costs",
				icon: DollarSign,
				allowedRoles: [...ADMIN_PLUS_RESIDENT_ENGINEER],
			},
		],
	},
	{
		label: "Management",
		items: [
			{
				to: "/reports",
				label: "Reports",
				icon: BarChart3,
				allowedRoles: [...ADMIN_PLUS_RESIDENT_ENGINEER],
			},
			{ to: "/admin", label: "Users", icon: Users, allowedRoles: [...ADMIN_ROLES] },
		],
	},
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
	const pathname = usePathname();
	const { user } = useAuth();
	const { toggleChat, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
	const userRoleStr = user?.role;
	const userRole =
		userRoleStr != null && isAuthenticatedRole(userRoleStr) ? userRoleStr : undefined;
	const currentPath = pathname ?? "";

	const sidebarRef = useRef<HTMLElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	// Logo + nav entrance animations
	useGSAP(
		() => {
			const sidebarElement = sidebarRef.current;
			if (!sidebarElement) {
				return;
			}

			const logo = sidebarElement.querySelector<HTMLElement>("[data-sidebar-logo]");
			const navGroups = Array.from(
				sidebarElement.querySelectorAll<HTMLElement>("[data-sidebar-nav-group]"),
			);
			const mm = gsap.matchMedia();

			// Reduced motion: skip animations entirely
			mm.add("(prefers-reduced-motion: reduce)", () => {
				// No animation — elements render instantly
			});

			// Default: animate entrance
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
				if (logo) {
					tl.from(logo, {
						opacity: 0,
						scale: 0.95,
						duration: 0.6,
						ease: "back.out(1.7)",
						clearProps: "all",
					});
				}

				if (navGroups.length > 0) {
					tl.from(
						navGroups,
						{
							opacity: 0,
							x: -16,
							stagger: 0.08,
							duration: 0.45,
							delay: 0.15,
							ease: "power2.out",
							clearProps: "all",
						},
						"-=0.3",
					);
				}
			});

			return () => mm.revert();
		},
		{ scope: sidebarRef, dependencies: [] },
	);

	// Overlay animation
	useEffect(() => {
		if (!overlayRef.current || !sidebarOpen) {
			return;
		}
		const tween = gsap.fromTo(
			overlayRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: 0.25, ease: "power2.out" },
		);
		return () => {
			tween.kill();
		};
	}, [sidebarOpen]);

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

	// Close on Escape
	useEffect(() => {
		const keyHandler = (e: KeyboardEvent) => {
			if (e.key === "Escape" && sidebarOpen) {
				setSidebarOpen(false);
			}
		};
		document.addEventListener("keydown", keyHandler);
		return () => document.removeEventListener("keydown", keyHandler);
	}, [sidebarOpen, setSidebarOpen]);

	// Close on route change (mobile)
	useEffect(() => {
		setSidebarOpen(false);
	}, [setSidebarOpen]);

	return (
		<>
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					ref={overlayRef}
					className="fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-sm lg:hidden"
					aria-hidden="true"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				ref={sidebarRef}
				id="sidebar"
				aria-label="Sidebar navigation"
				data-collapsed={sidebarCollapsed}
				className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--border-default)] bg-[var(--surface-sidebar)] transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
					sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
				}`}
				style={{
					width: sidebarCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
				}}
			>
				{/* Logo */}
				<div data-sidebar-logo className="flex items-center justify-between px-5 py-5">
					<div className="flex items-center gap-3">
						<Logo showText={false} size="md" ariaLabel="Cermont S.A.S." />
						<div className={sidebarCollapsed ? "sr-only lg:not-sr-only" : ""}>
							<span className="text-lg font-bold tracking-wider text-[var(--text-sidebar)]">
								CERMONT
							</span>
							<p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-sidebar-muted)]">
								S.A.S.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="rounded-lg p-1.5 text-[var(--text-sidebar-muted)] transition-colors hover:bg-[var(--surface-sidebar-hover)] hover:text-[var(--text-sidebar)] lg:hidden"
						aria-label="Close navigation"
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>

				<div className="px-3 pb-2">
					<button
						type="button"
						onClick={toggleSidebarCollapsed}
						className="flex w-full items-center justify-between rounded-[var(--radius-lg)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-sidebar-muted)] transition-colors hover:bg-[var(--surface-sidebar-hover)] hover:text-[var(--text-sidebar)]"
						title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<span className={sidebarCollapsed ? "sr-only" : ""}>Navigation</span>
						<ChevronRight
							className={
								sidebarCollapsed
									? "h-4 w-4 rotate-180 transition-transform"
									: "h-4 w-4 transition-transform"
							}
							aria-hidden="true"
						/>
					</button>
				</div>

				{/* Navigation */}
				<nav aria-label="Primary navigation" className="flex-1 overflow-y-auto py-2 px-3">
					{NAV_GROUPS.map((group) => {
						const visibleItems = group.items.filter(
							(item) => !item.allowedRoles || (userRole && item.allowedRoles.includes(userRole)),
						);
						if (visibleItems.length === 0) {
							return null;
						}

						return (
							<section key={group.label} data-sidebar-nav-group className="mb-5">
								<h3
									className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-sidebar-muted)] transition-opacity ${sidebarCollapsed ? "opacity-0" : "opacity-100"}`}
								>
									{group.label}
								</h3>
								<ul className="space-y-0.5">
									{visibleItems.map(({ to, label, icon: Icon }) => {
										const isActive = currentPath === to || currentPath.startsWith(`${to}/`);
										return (
											<li key={to}>
												<Link
													href={to}
													aria-current={isActive ? "page" : undefined}
													className={`group flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-sm transition-all ${
														isActive
															? "bg-[var(--surface-sidebar-active)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)]"
															: "text-[var(--text-sidebar)] hover:bg-[var(--surface-sidebar-hover)] hover:text-[var(--text-sidebar)]"
													}`}
													title={sidebarCollapsed ? label : undefined}
												>
													<Icon
														className={`h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105 ${
															isActive
																? "text-[var(--text-inverse)]"
																: "text-[var(--text-sidebar-muted)] group-hover:text-[var(--text-sidebar)]"
														}`}
														aria-hidden="true"
													/>
													<span
														className={`font-medium transition-opacity ${sidebarCollapsed ? "opacity-0 lg:sr-only" : "opacity-100"}`}
													>
														{label}
													</span>
												</Link>
											</li>
										);
									})}
								</ul>
							</section>
						);
					})}
				</nav>

				{/* AI Assistant */}
				<div className="border-t border-[var(--border-default)] p-4">
					<button
						type="button"
						onClick={toggleChat}
						className="group flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-brand-blue)] p-3.5 text-[var(--text-inverse)] transition-all hover:bg-[var(--color-brand-blue-hover)]"
					>
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[oklch(0.99_0.006_260_/_0.14)] text-[var(--text-inverse)]">
							<Bot className="h-5 w-5" aria-hidden="true" />
						</div>
						<div className="min-w-0 text-left">
							<p className="text-sm font-semibold text-[var(--text-inverse)]">Cermont AI</p>
							<p className="truncate text-xs text-[oklch(0.99_0.006_260_/_0.72)]">
								Operations assistant
							</p>
						</div>
					</button>
				</div>
			</aside>
		</>
	);
}
