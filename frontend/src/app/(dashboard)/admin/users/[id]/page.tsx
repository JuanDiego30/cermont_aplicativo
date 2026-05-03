"use client";

import { ROLE_LABELS } from "@cermont/shared-types/rbac";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STALE_TIMES } from "@/_shared/lib/constants/query-config";
import { apiClient } from "@/_shared/lib/http/api-client";
import { ROLE_COLORS } from "./user-detail-constants";

interface UserData {
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

type UserResponse = { success?: boolean; data?: UserData; error?: string; message?: string };

export default function UserDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user", id],
		queryFn: async () => {
			const body = await apiClient.get<UserResponse>(`/users/${id}`);
			if (!body?.success || !body.data) {
				throw new Error(body?.message || body?.error || "Error al cargar el usuario");
			}
			const u = body.data;
			const fullName = (u.name ?? "").trim();
			const [firstNameFromName, ...lastNameFromName] = fullName.split(/\s+/).filter(Boolean);
			return {
				_id: String(u._id ?? ""),
				name: u.name ?? "",
				first_name: u.first_name ?? firstNameFromName ?? "",
				last_name: u.last_name ?? (lastNameFromName.length > 0 ? lastNameFromName.join(" ") : ""),
				email: u.email ?? "",
				phone: u.phone ?? "",
				avatar: u.avatarUrl ?? u.avatar ?? null,
				role: u.role ?? "",
				active: u.active ?? false,
				email_verified_at: u.email_verified_at ? new Date(u.email_verified_at) : null,
				last_login: u.last_login ? new Date(u.last_login) : null,
				login_attempts: u.login_attempts ?? 0,
				locked_until: u.locked_until ? new Date(u.locked_until) : null,
				created_at: u.createdAt ? new Date(u.createdAt) : new Date(),
			};
		},
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800">
				<span className="text-slate-500">Cargando detalles del usuario...</span>
			</div>
		);
	}
	if (error || !user) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
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
						className="mt-1 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Volver
					</Link>
					<fieldset className="flex min-w-0 items-center gap-3 border-0 p-0">
						<legend className="sr-only">Identificación del usuario</legend>
						<figure className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							{user.avatar ? (
								<Image
									src={user.avatar}
									alt={`Avatar de ${user.first_name} ${user.last_name}`}
									width={40}
									height={40}
									unoptimized
									className="h-10 w-10 rounded-full object-cover"
								/>
							) : (
								<User className="h-5 w-5 text-blue-600" aria-hidden="true" />
							)}
						</figure>
						<div className="leading-tight">
							<h1
								id="user-detail-title"
								className="text-2xl font-bold text-slate-900 dark:text-white"
							>
								{fullName}
							</h1>
							<p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
						</div>
					</fieldset>
				</div>
				<Link
					href={`/admin/users/${user._id}/edit`}
					className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-900"
				>
					Editar
				</Link>
			</header>

			<section
				className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
				aria-labelledby="perfil-titulo"
			>
				<h2
					id="perfil-titulo"
					className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400"
				>
					Información del perfil
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Nombre</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{fullName}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Email</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{user.email}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Rol</dt>
						<dd className="mt-1">
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-600 ring-gray-200 dark:text-slate-300"}`}
							>
								{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
							</span>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Estado</dt>
						<dd className="mt-1">
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${user.active ? "bg-green-50 text-green-700 ring-green-200" : "bg-slate-100 text-slate-500 ring-gray-200 dark:text-slate-400"}`}
							>
								{user.active ? "Activo" : "Inactivo"}
							</span>
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Teléfono</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{user.phone ?? "—"}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Email verificado</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{user.email_verified_at
								? format(new Date(user.email_verified_at), "dd MMM yyyy", { locale: es })
								: "No verificado"}
						</dd>
					</div>
				</dl>
			</section>

			<section
				className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
				aria-labelledby="acceso-titulo"
			>
				<h2
					id="acceso-titulo"
					className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400"
				>
					Estadísticas de acceso
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Último acceso</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{user.last_login
								? format(new Date(user.last_login), "dd MMM yyyy HH:mm", { locale: es })
								: "Nunca"}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Intentos fallidos</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{user.login_attempts}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Bloqueado hasta</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{user.locked_until
								? format(new Date(user.locked_until), "dd MMM yyyy HH:mm", { locale: es })
								: "—"}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Registrado</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{format(new Date(user.created_at), "dd MMM yyyy", { locale: es })}
						</dd>
					</div>
				</dl>
			</section>
		</section>
	);
}
