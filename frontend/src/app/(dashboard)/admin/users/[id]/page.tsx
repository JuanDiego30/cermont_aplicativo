"use client";

import { ROLE_LABELS } from "@cermont/domain";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { ROLE_COLORS } from "./user-detail-constants";

interface UserSnapshot {
	_id: string;
	name?: string;
	first_name?: string;
	last_name?: string;
	email: string;
	phone?: string;
	avatarUrl?: string | null;
	avatar?: string | null;
	role: string;
	active: boolean;
	email_verified_at?: string | null;
	last_login?: string | null;
	login_attempts?: number;
	locked_until?: string | null;
	createdAt?: string;
}

type UserContract = { success?: boolean; data?: UserSnapshot; error?: string; message?: string };

function safeGet<T>(val: T | undefined | null, fallback: T): T {
	return val != null ? val : fallback;
}

async function fetchUserDetail(userId: string) {
	const body = await apiClient.get<UserContract>(`/users/${userId}`);
	if (!body?.success || !body.data) {
		throw new Error(body?.message || body?.error || "Error al cargar el usuario");
	}
	const u = body.data;
	const fullName = safeGet(u.name, "").trim();
	const parts = fullName.split(/\s+/).filter(Boolean);
	const firstNameFromName = parts[0] ?? "";
	const lastNameFromName = parts.slice(1).join(" ");
	return {
		_id: String(safeGet(u._id, "")),
		name: safeGet(u.name, ""),
		first_name: safeGet(u.first_name, firstNameFromName),
		last_name: safeGet(u.last_name, lastNameFromName),
		email: safeGet(u.email, ""),
		phone: safeGet(u.phone, ""),
		avatar: safeGet(u.avatarUrl, safeGet(u.avatar, null)),
		role: safeGet(u.role, ""),
		active: Boolean(u.active),
		email_verified_at: u.email_verified_at ? new Date(u.email_verified_at) : null,
		last_login: u.last_login ? new Date(u.last_login) : null,
		login_attempts: safeGet(u.login_attempts, 0),
		locked_until: u.locked_until ? new Date(u.locked_until) : null,
		created_at: u.createdAt ? new Date(u.createdAt) : new Date(),
	};
}

export default function UserDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user", id],
		queryFn: () => fetchUserDetail(id),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
				<span className="text-steel">Cargando detalles del usuario…</span>
			</div>
		);
	}
	if (error || !user) {
		return (
			<div className="p-4 bg-red-50 text-brand-error rounded-lg dark:bg-red-900/20 dark:text-brand-error">
				No se pudo cargar el usuario. {(error as Error)?.message}
			</div>
		);
	}

	const fullName = user.name?.trim() || `${user.first_name || ""} ${user.last_name || ""}`.trim();

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="user-detail-title">
			<header className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<Link
						href="/admin/users"
						className="mt-1 flex items-center gap-1 text-sm text-steel hover:text-charcoal dark:text-steel"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver
					</Link>
					<fieldset className="flex min-w-0 items-center gap-3 border-0 p-0">
						<legend className="sr-only">Identificación del usuario</legend>
						<figure className="flex size-10 items-center justify-center rounded-full bg-blue-100">
							{user.avatar ? (
								<Image
									src={user.avatar}
									alt={`Avatar de ${user.first_name} ${user.last_name}`}
									width={40}
									height={40}
									unoptimized
									className="size-10 rounded-full object-cover"
								/>
							) : (
								<User className="size-5 text-brand-green" aria-hidden="true" />
							)}
						</figure>
						<div className="leading-tight">
							<h1
								id="user-detail-title"
								className="text-2xl font-semibold text-ink dark:text-white"
							>
								{fullName}
							</h1>
							<p className="text-sm text-steel dark:text-steel">{user.email}</p>
						</div>
					</fieldset>
				</div>
				<Link
					href={`/admin/users/${user._id}/edit`}
					className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-sm hover:bg-zinc-50 dark:bg-zinc-900"
				>
					Editar
				</Link>
			</header>

			<section
				className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
				aria-labelledby="perfil-titulo"
			>
				<h2
					id="perfil-titulo"
					className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel"
				>
					Información del perfil
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-steel dark:text-steel">Nombre</dt>
						<dd className="mt-1 text-ink dark:text-white">{fullName}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Email</dt>
						<dd className="mt-1 text-ink dark:text-white">{user.email}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Rol</dt>
						<dd className="mt-1">
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_COLORS[user.role] ?? "bg-zinc-100 text-steel ring-zinc-200 dark:text-stone"}`}
							>
								{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
							</span>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Estado</dt>
						<dd className="mt-1">
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${user.active ? "bg-green-50 text-brand-annotate ring-green-200" : "bg-zinc-100 text-steel ring-zinc-200 dark:text-steel"}`}
							>
								{user.active ? "Activo" : "Inactivo"}
							</span>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Teléfono</dt>
						<dd className="mt-1 text-ink dark:text-white">{user.phone ?? ","}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Email verificado</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{user.email_verified_at ? formatDate(user.email_verified_at) : "No verificado"}
						</dd>
					</div>
				</dl>
			</section>

			<section
				className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
				aria-labelledby="acceso-titulo"
			>
				<h2
					id="acceso-titulo"
					className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel"
				>
					Estadísticas de acceso
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-steel dark:text-steel">Último acceso</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{user.last_login ? formatDateTime(user.last_login) : "Nunca"}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Intentos fallidos</dt>
						<dd className="mt-1 text-ink dark:text-white">{user.login_attempts}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Bloqueado hasta</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{user.locked_until ? formatDateTime(user.locked_until) : ","}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Registrado</dt>
						<dd className="mt-1 text-ink dark:text-white">{formatDate(user.created_at)}</dd>
					</div>
				</dl>
			</section>
		</section>
	);
}
