"use client";

import type { ApiEnvelope } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { ProfileUser } from "@/modules/users/ui/ProfileForm";
import { PasskeyManager } from "@/modules/auth/ui/PasskeyManager";
import { ProfileForm } from "@/modules/users/ui/ProfileForm";

interface ProfileUserSnapshot {
	id: string;
	name: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	avatarUrl: string;
	avatar: string;
	role: string;
	active: boolean;
	created_at: string;
	last_login: string;
}

function extractProfileField(d: Record<string, unknown>, keys: string[], fallback = ""): string {
	for (const key of keys) {
		const val = d[key];
		if (val != null) {
			return String(val);
		}
	}
	return fallback;
}

async function fetchProfileData(userId: string | undefined): Promise<ProfileUserSnapshot> {
	const body = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(`/users/${userId}`);
	if (!body?.data) {
		throw new Error("No pudimos cargar tu perfil");
	}
	const d = body.data;
	const name = extractProfileField(d, ["name"]);
	return {
		id: extractProfileField(d, ["_id", "id"]),
		name,
		first_name: extractProfileField(d, ["first_name", "firstName"]) || (name.split(" ")[0] ?? ""),
		last_name:
			extractProfileField(d, ["last_name", "lastName"]) || name.split(" ").slice(1).join(" ") || "",
		email: extractProfileField(d, ["email"]),
		phone: extractProfileField(d, ["phone"]),
		avatarUrl: extractProfileField(d, ["avatarUrl"]),
		avatar: extractProfileField(d, ["avatarUrl", "avatar"]),
		role: extractProfileField(d, ["role"]),
		active: Boolean(d.active),
		created_at: extractProfileField(d, ["created_at", "createdAt"]),
		last_login: extractProfileField(d, ["last_login", "lastLogin"]),
	};
}

export default function ProfilePage() {
	const { user: session, isLoading: isAuthLoading } = useAuth();
	const userId = session?.id;

	const { data: user, isLoading: isUserLoading } = useQuery<ProfileUserSnapshot>({
		queryKey: ["userProfile", userId],
		queryFn: () => fetchProfileData(userId),
		enabled: !!userId,
	});

	if (isAuthLoading || isUserLoading) {
		return (
			<section className="mx-auto flex min-h-[18rem] max-w-2xl items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
				<div className="flex items-center gap-3 text-[var(--text-secondary)]">
					<Loader2
						className="size-5 animate-spin text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					Cargando perfil…
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
					<div className="flex size-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-primary)] text-[var(--color-warning)] shadow-[var(--shadow-1)]">
						<UserCircle2 aria-hidden="true" className="size-5" />
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
								className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
							>
								Iniciar sesión otra vez
							</Link>
						</div>
					</div>
				</div>
			</section>
		);
	}

	const profileUser: ProfileUser = {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone || null,
		avatarUrl: user.avatarUrl || null,
		role: user.role,
		isActive: user.active,
		createdAt: user.created_at,
		lastLogin: user.last_login || null,
	};

	return (
		<div className="space-y-6">
			<ProfileForm user={profileUser} />
			<div className="mx-auto max-w-2xl">
				<PasskeyManager />
			</div>
		</div>
	);
}
