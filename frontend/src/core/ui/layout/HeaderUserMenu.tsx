"use client";

import { ROLE_LABELS, type UserRole } from "@cermont/shared-types/rbac";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAuth } from "@/auth/hooks/useAuth";

interface HeaderUserMenuProps {
	user: { name?: string | null; role?: string; avatar?: string | null } | null;
	dropdownOpen: boolean;
	onToggleDropdown: () => void;
	onCloseDropdown: () => void;
}

function getInitials(name?: string | null): string {
	if (!name) {
		return "U";
	}
	return name
		.split(" ")
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function HeaderUserMenu({
	user,
	dropdownOpen,
	onToggleDropdown,
	onCloseDropdown,
}: HeaderUserMenuProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const { logout } = useAuth();

	useEffect(() => {
		if (!dropdownOpen || dropdownRef.current === null) {
			return;
		}
		const dropdownElement = dropdownRef.current;

		function handleClick(e: MouseEvent) {
			if (!dropdownElement.contains(e.target as Node)) {
				onCloseDropdown();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onCloseDropdown();
				triggerRef.current?.focus();
			}
		}

		function handleFocusOut(event: FocusEvent) {
			if (!dropdownElement.contains(event.relatedTarget as Node | null)) {
				onCloseDropdown();
			}
		}

		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKeyDown);
		dropdownElement.addEventListener("focusout", handleFocusOut);

		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKeyDown);
			dropdownElement.removeEventListener("focusout", handleFocusOut);
		};
	}, [dropdownOpen, onCloseDropdown]);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				id="header-user-menu-trigger"
				ref={triggerRef}
				type="button"
				onClick={onToggleDropdown}
				aria-expanded={dropdownOpen}
				aria-controls="header-user-menu"
				aria-label={user?.name ? `${user.name} user menu` : "User menu"}
				className="flex items-center gap-3 rounded-full border border-transparent p-1 pr-3 transition-all hover:border-[var(--border-default)] hover:bg-[var(--surface-secondary)]"
			>
				<span className="hidden text-right lg:block">
					<span className="block text-sm font-semibold text-[var(--text-primary)]">
						{user?.name || "User"}
					</span>
					<span className="block text-xs font-medium text-[var(--text-secondary)]">
						{user?.role ? (ROLE_LABELS[user.role as UserRole] ?? user.role) : "Operator"}
					</span>
				</span>

				{user?.avatar ? (
					<Image
						src={user.avatar}
						alt=""
						width={40}
						height={40}
						unoptimized
						className="h-10 w-10 rounded-full object-cover shadow-sm"
					/>
				) : (
					<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-blue)] font-semibold text-white shadow-sm">
						{getInitials(user?.name)}
					</span>
				)}

				<ChevronDown
					className="hidden h-4 w-4 text-slate-500 dark:text-slate-400 sm:block"
					aria-hidden="true"
				/>
			</button>

			{dropdownOpen ? (
				<div
					id="header-user-menu"
					className="absolute right-0 mt-4 flex w-64 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					<ul className="flex flex-col gap-1 p-3">
						<li>
							<Link
								href="/profile"
								className="flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--color-brand-blue)]"
								onClick={onCloseDropdown}
							>
								<UserIcon className="h-5 w-5" aria-hidden="true" />
								My Profile
							</Link>
						</li>
						<li className="mt-1 border-t border-[var(--border-default)] pt-1">
							<button
								type="button"
								onClick={() => logout()}
								className="flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)]/60"
							>
								<LogOut className="h-5 w-5" aria-hidden="true" />
								Sign out
							</button>
						</li>
					</ul>
				</div>
			) : null}
		</div>
	);
}
