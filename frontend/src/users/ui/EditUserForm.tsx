"use client";

import { type UpdateUserInput, UpdateUserSchema } from "@cermont/shared-types";
import type { UserRole } from "@cermont/shared-types/rbac";
import { ALL_AUTHENTICATED_ROLES, ROLE_LABELS } from "@cermont/shared-types/rbac";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";
import { apiClient } from "@/_shared/lib/http/api-client";

interface EditUserFormProps {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
		phone: string | null;
	};
}

type EditUserFormData = UpdateUserInput;

export function EditUserForm({ user }: EditUserFormProps) {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EditUserFormData>({
		resolver: zodResolver(UpdateUserSchema) as Resolver<EditUserFormData>,
		defaultValues: {
			name: user.name,
			email: user.email,
			role: user.role as UserRole,
			phone: user.phone || "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: EditUserFormData) => {
			const payload: UpdateUserInput = {
				name: data.name?.trim() ?? user.name,
				email: data.email?.trim() ?? user.email,
				role: (data.role ?? user.role) as UserRole,
				phone: data.phone?.trim() || undefined,
			};

			await apiClient.put(`/users/${user.id}`, payload);
		},
		onSuccess: () => {
			router.push(`/admin/users/${user.id}`);
			router.refresh();
		},
	});

	const isSubmitting = mutation.isPending;
	const errorMessage =
		mutation.error instanceof Error
			? mutation.error.message
			: mutation.error
				? "Error al actualizar el usuario"
				: null;

	return (
		<section
			className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
			aria-labelledby="edit-user-form-title"
		>
			<h2 id="edit-user-form-title" className="sr-only">
				Formulario de edición de usuario
			</h2>

			<form
				onSubmit={handleSubmit((data) => mutation.mutate(data))}
				noValidate
				className="space-y-5"
				aria-busy={isSubmitting}
			>
				<div>
					<label
						htmlFor="edit-user-name"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Nombre completo{" "}
						<span aria-hidden="true" className="text-red-500">
							*
						</span>
					</label>
					<input
						id="edit-user-name"
						type="text"
						required
						aria-required="true"
						placeholder="Juan Pérez"
						className="input-field mt-1"
						{...register("name")}
					/>
					{errors.name && (
						<p className="mt-1 text-xs text-red-500" role="alert">
							{errors.name.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="edit-user-email"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300"
					>
						Correo electrónico{" "}
						<span aria-hidden="true" className="text-red-500">
							*
						</span>
					</label>
					<input
						id="edit-user-email"
						type="email"
						required
						aria-required="true"
						placeholder="usuario@cermont.cl"
						className="input-field mt-1"
						{...register("email")}
					/>
					{errors.email && (
						<p className="mt-1 text-xs text-red-500" role="alert">
							{errors.email.message}
						</p>
					)}
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<div>
						<label
							htmlFor="edit-user-role"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Rol{" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<select
							id="edit-user-role"
							required
							aria-required="true"
							className="input-field mt-1"
							{...register("role")}
						>
							{ALL_AUTHENTICATED_ROLES.map((roleOption: UserRole) => (
								<option key={roleOption} value={roleOption}>
									{ROLE_LABELS[roleOption] ?? roleOption}
								</option>
							))}
						</select>
						{errors.role && (
							<p className="mt-1 text-xs text-red-500" role="alert">
								{errors.role.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="edit-user-phone"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Teléfono <span className="text-slate-400">(opcional)</span>
						</label>
						<input
							id="edit-user-phone"
							type="tel"
							placeholder="+56 9 1234 5678"
							className="input-field mt-1"
							{...register("phone")}
						/>
					</div>
				</div>

				{errorMessage ? (
					<p
						role="alert"
						aria-live="assertive"
						className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						{errorMessage}
					</p>
				) : null}

				<footer className="flex justify-end gap-3 pt-2">
					<Link
						href={`/admin/users/${user.id}`}
						className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Cancelar
					</Link>

					<button
						type="submit"
						disabled={isSubmitting}
						aria-busy={isSubmitting}
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
					>
						{isSubmitting ? (
							<>
								<Loader2 aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
								<span>Guardando cambios...</span>
							</>
						) : (
							<span>Guardar cambios</span>
						)}
					</button>
				</footer>
			</form>
		</section>
	);
}
