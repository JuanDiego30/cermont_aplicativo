"use client";

import { ROLE_LABELS, type UserRole } from "@cermont/domain";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

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
	const onCloseRef = useRef(onCloseDropdown);
	onCloseRef.current = onCloseDropdown;
	const { logout } = useAuth();
	const router = useRouter();

	async function handleLogout() {
		try {
			await logout();
		} finally {
			router.replace("/login");
		}
	}

	useEffect(() => {
		if (!dropdownOpen || dropdownRef.current === null) {
			return;
		}
		const dropdownElement = dropdownRef.current;

		function handleClick(e: MouseEvent) {
			if (!dropdownElement.contains(e.target as Node)) {
				onCloseRef.current();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onCloseRef.current();
				triggerRef.current?.focus();
			}
		}

		function handleFocusOut(event: FocusEvent) {
			if (!dropdownElement.contains(event.relatedTarget as Node | null)) {
				onCloseRef.current();
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
	}, [dropdownOpen]);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				id="header-user-menu-trigger"
				ref={triggerRef}
				type="button"
				onClick={onToggleDropdown}
				aria-expanded={dropdownOpen}
				aria-controls="header-user-menu"
				aria-label={user?.name ? `Menú de usuario de ${user.name}` : "Menú de usuario"}
				className="flex items-center gap-3 rounded-full border border-transparent p-1 pr-3 transition-all hover:border-[var(--border-subtle)] hover:bg-[var(--surface-secondary)]"
			>
				<span className="hidden text-right lg:block">
					<span className="block text-sm font-semibold text-[var(--text-primary)]">
						{user?.name || "Usuario"}
					</span>
					<span className="block text-xs font-medium text-[var(--text-secondary)]">
						{user?.role ? (ROLE_LABELS[user.role as UserRole] ?? user.role) : "Operador"}
					</span>
				</span>

				{user?.avatar ? (
					<Image
						src={user.avatar}
						alt=""
						width={40}
						height={40}
						unoptimized
						className="size-10 rounded-full object-cover shadow-sm"
					/>
				) : (
					<span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-brand-blue)] font-semibold text-white shadow-sm">
						{getInitials(user?.name)}
					</span>
				)}

				<ChevronDown
					className="hidden size-4 text-steel dark:text-stone sm:block"
					aria-hidden="true"
				/>
			</button>

			{dropdownOpen ? (
				<div
					id="header-user-menu"
					className="animate-scale-in origin-top-right absolute right-0 mt-4 flex w-64 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					<ul className="flex flex-col gap-1 p-3">
						<li>
							<Link
								href="/profile"
								className="flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--color-brand-blue)]"
								onClick={onCloseDropdown}
							>
								<UserIcon className="size-5" aria-hidden="true" />
								Mi Perfil
							</Link>
						</li>
						<li className="mt-1 border-t border-[var(--border-subtle)] pt-1">
							<button
								type="button"
								onClick={() => void handleLogout()}
								className="flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)]/60"
							>
								<LogOut className="size-5" aria-hidden="true" />
								Cerrar Sesión
							</button>
						</li>
					</ul>
				</div>
			) : null}
		</div>
	);
}
