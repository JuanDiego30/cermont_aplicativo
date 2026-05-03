"use client";

import type { ApiBody } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/_shared/lib/http/api-client";
import { useAuth } from "@/auth/hooks/useAuth";
import { ProfileForm, type ProfileUser } from "@/users/ui/ProfileForm";

interface UserProfileResponse {
	_id?: string;
	id?: string;
	name?: string;
	email?: string;
	phone?: string | null;
	avatarUrl?: string | null;
	avatar?: string | null;
	role?: string;
	isActive?: boolean;
	active?: boolean;
	createdAt?: string;
	created_at?: string;
	lastLogin?: string | null;
	last_login?: string | null;
}

export default function ProfilePage() {
	const { user: session, isLoading: isAuthLoading } = useAuth();
	const userId = session?.id;

	const { data: user, isLoading: isUserLoading } = useQuery<ProfileUser>({
		queryKey: ["userProfile", userId],
		queryFn: async () => {
			const body = await apiClient.get<ApiBody<UserProfileResponse>>(`/users/${userId}`);
			if (!body?.data) {
				throw new Error("No pudimos cargar tu perfil");
			}
			const d = body.data;
			return {
				id: d._id || d.id || userId || "",
				name: d.name || "",
				email: d.email || "",
				phone: d.phone ?? null,
				avatarUrl: d.avatarUrl ?? d.avatar ?? null,
				role: d.role || "cliente",
				isActive: d.isActive ?? d.active ?? true,
				createdAt: d.createdAt || d.created_at || new Date().toISOString(),
				lastLogin: d.lastLogin ?? d.last_login ?? null,
			};
		},
		enabled: !!userId,
	});

	if (isAuthLoading || isUserLoading) {
		return (
			<section className="mx-auto flex min-h-[18rem] max-w-2xl items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="flex items-center gap-3 text-[var(--text-secondary)]">
					<Loader2
						className="h-5 w-5 animate-spin text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					Cargando perfil...
				</div>
			</section>
		);
	}

	if (!user) {
		return (
			<section
				className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)] p-6 shadow-[var(--shadow-2)]"
				aria-labelledby="profile-missing-title"
			>
				<div className="flex items-start gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[var(--color-warning)] shadow-[var(--shadow-1)]">
						<UserCircle2 aria-hidden="true" className="h-5 w-5" />
					</div>
					<div className="space-y-4">
						<div>
							<h1
								id="profile-missing-title"
								className="text-lg font-semibold text-[var(--text-primary)]"
							>
								No pudimos cargar tu perfil
							</h1>
							<p role="alert" className="mt-2 text-sm text-[var(--text-secondary)]">
								Tu cuenta no tiene un perfil disponible en este momento. Puedes volver al panel
								principal o intentar iniciar sesión nuevamente.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link
								href="/dashboard"
								className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)]"
							>
								Ir al panel
							</Link>
							<Link
								href="/login"
								className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
							>
								Iniciar sesión otra vez
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return <ProfileForm user={user} />;
}
