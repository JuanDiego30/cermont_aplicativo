"use client";

import {
	type CreateUserInput,
	CreateUserSchema,
	type UpdateUserInput,
	type User,
	type UserRole,
} from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";
import type { z } from "zod";
import { apiClient } from "@/_shared/lib/http/api-client";
import { UserFormFields } from "./UserFormFields";

const userFormSchema = CreateUserSchema.omit({
	password: true,
}).extend({
	password: CreateUserSchema.shape.password.optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

function getUserFormSchema(isEdit: boolean) {
	if (isEdit) {
		return userFormSchema;
	}

	return userFormSchema.refine((data) => !!data.password && data.password.length >= 8, {
		message: "La contraseña es requerida para nuevos usuarios (mín. 8 caracteres)",
		path: ["password"],
	});
}

interface UserFormProps {
	user?: User | null;
	onSuccess?: () => void;
	defaultRole?: UserRole;
}

export function UserForm({ user, onSuccess, defaultRole }: UserFormProps) {
	const router = useRouter();
	const isEdit = !!user;
	const validationSchema = getUserFormSchema(isEdit);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserFormData>({
		resolver: zodResolver(validationSchema) as Resolver<UserFormData>,
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			role: user?.role ?? defaultRole ?? ("technician" as UserRole),
			phone: user?.phone ?? "",
			password: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: UserFormData) => {
			if (isEdit) {
				const payload: UpdateUserInput = {
					name: data.name.trim(),
					email: data.email.trim(),
					role: data.role as UserRole,
					phone: data.phone?.trim() || undefined,
				};

				await apiClient.put(`/users/${user._id}`, payload);
				return;
			}

			const payload: CreateUserInput = {
				name: data.name.trim(),
				email: data.email.trim(),
				password: data.password?.trim() ?? "",
				role: data.role as UserRole,
				phone: data.phone?.trim() || undefined,
			};

			await apiClient.post("/users", payload);
		},
		onSuccess: () => {
			if (onSuccess) {
				onSuccess();
			} else if (isEdit) {
				router.push(`/admin/users/${user._id}`);
				router.refresh();
			} else {
				router.push("/admin/users");
				router.refresh();
			}
		},
	});

	const isSubmitting = mutation.isPending;
	const errorMessage =
		mutation.error instanceof Error
			? mutation.error.message
			: mutation.error
				? "Error al guardar el usuario"
				: null;

	return (
		<section
			className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
			aria-labelledby="user-form-title"
		>
			<h2 id="user-form-title" className="sr-only">
				{isEdit ? "Formulario de edición de usuario" : "Formulario de creación de usuario"}
			</h2>

			<form
				onSubmit={handleSubmit((data) => mutation.mutate(data))}
				noValidate
				className="space-y-5"
				aria-busy={isSubmitting}
			>
				<UserFormFields register={register} errors={errors} isEdit={isEdit} />

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
						href={isEdit ? `/admin/users/${user._id}` : "/admin/users"}
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
								<span>{isEdit ? "Guardando..." : "Creando usuario..."}</span>
							</>
						) : (
							<span>{isEdit ? "Guardar cambios" : "Crear usuario"}</span>
						)}
					</button>
				</footer>
			</form>
		</section>
	);
}
