"use client";

import { ChangePasswordSchema, CreateUserSchema } from "@cermont/shared-types";
import { ROLE_LABELS, type UserRole } from "@cermont/shared-types/rbac";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/_shared/lib/http/api-client";
import { PasskeySettings } from "@/auth/ui/PasskeySettings";

const profileUpdateSchema = CreateUserSchema.pick({
	name: true,
	phone: true,
}).extend({
	avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});
type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

const passwordChangeSchema = ChangePasswordSchema.extend({
	confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Las contraseñas no coinciden",
	path: ["confirmPassword"],
});
type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export interface ProfileUser {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	avatarUrl: string | null;
	role: string;
	isActive: boolean;
	createdAt: string;
	lastLogin: string | null;
}

interface ProfileHeaderProps {
	user: ProfileUser;
	avatarUrl: string | null;
	fullName: string;
}

function ProfileHeader({ user, avatarUrl, fullName }: ProfileHeaderProps) {
	return (
		<header className="flex items-center gap-4">
			<figure className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-info-bg)]">
				{avatarUrl ? (
					<Image
						src={avatarUrl}
						alt={`Avatar de ${user.name}`}
						width={56}
						height={56}
						unoptimized
						className="h-14 w-14 rounded-full object-cover"
					/>
				) : (
					<UserIcon aria-hidden="true" className="h-7 w-7 text-[var(--color-brand-blue)]" />
				)}
			</figure>
			<div>
				<h1 id="profile-title" className="text-2xl font-bold text-[var(--text-primary)]">
					{fullName}
				</h1>
				<p className="flex items-center gap-2">
					<span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
					<span className="rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-brand-blue)]">
						{ROLE_LABELS[user.role as UserRole] ?? user.role}
					</span>
				</p>
				{user.lastLogin && (
					<p className="text-xs text-[var(--text-tertiary)]">
						Último acceso: {format(new Date(user.lastLogin), "dd MMM yyyy HH:mm", { locale: es })}
					</p>
				)}
			</div>
		</header>
	);
}

interface FormFieldProps {
	id: string;
	label: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	autoComplete?: string;
	error?: string;
	register?: UseFormRegisterReturn;
}

function FormField({
	id,
	label,
	type = "text",
	placeholder,
	required,
	autoComplete,
	error,
	register,
}: FormFieldProps) {
	return (
		<div>
			<label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
				{label}
			</label>
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				required={required}
				autoComplete={autoComplete}
				className="mt-1 w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-[var(--text-primary)] shadow-[var(--shadow-1)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15"
				{...register}
			/>
			{error && (
				<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

interface ProfileInfoFormProps {
	profileForm: ReturnType<typeof useForm<ProfileUpdateData>>;
	updateProfileMutation: ReturnType<typeof useMutation<void, Error, ProfileUpdateData, unknown>>;
	successMessage: string | null;
}

function ProfileInfoForm({
	profileForm,
	updateProfileMutation,
	successMessage,
}: ProfileInfoFormProps) {
	return (
		<section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-1)]">
			<h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
				Información Personal
			</h2>
			<form
				onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))}
				className="space-y-4"
			>
				<FormField
					id="profile-name"
					label="Nombre completo"
					required
					register={profileForm.register("name")}
					error={profileForm.formState.errors.name?.message}
				/>
				<FormField
					id="profile-phone"
					label="Teléfono"
					type="tel"
					placeholder="+56 9 1234 5678"
					register={profileForm.register("phone")}
				/>
				<FormField
					id="profile-avatar-url"
					label="URL de Avatar"
					type="url"
					placeholder="https://..."
					register={profileForm.register("avatarUrl")}
					error={profileForm.formState.errors.avatarUrl?.message}
				/>
				{successMessage && (
					<div
						role="status"
						className="rounded-[var(--radius-lg)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
					>
						{successMessage}
					</div>
				)}
				{updateProfileMutation.error && (
					<div
						role="alert"
						className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
					>
						{updateProfileMutation.error instanceof Error
							? updateProfileMutation.error.message
							: "Error"}
					</div>
				)}
				<footer className="flex justify-end pt-2">
					<button
						type="submit"
						disabled={updateProfileMutation.isPending}
						className="flex min-h-11 items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--color-brand-blue-hover)] disabled:opacity-60"
					>
						{updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
						Guardar Cambios
					</button>
				</footer>
			</form>
		</section>
	);
}

interface PasswordChangeFormProps {
	passwordForm: ReturnType<typeof useForm<PasswordChangeData>>;
	changePasswordMutation: ReturnType<typeof useMutation<void, Error, PasswordChangeData, unknown>>;
	pwSuccess: string | null;
	userEmail: string;
}

function PasswordChangeForm({
	passwordForm,
	changePasswordMutation,
	pwSuccess,
	userEmail,
}: PasswordChangeFormProps) {
	return (
		<section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-1)]">
			<h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
				Cambiar Contraseña
			</h2>
			<form
				onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))}
				className="space-y-4"
			>
				<input
					type="text"
					name="username"
					autoComplete="username"
					defaultValue={userEmail}
					aria-label="Username"
					className="hidden"
				/>
				<FormField
					id="profile-current-password"
					label="Contraseña actual"
					type="password"
					autoComplete="current-password"
					required
					register={passwordForm.register("currentPassword")}
					error={passwordForm.formState.errors.currentPassword?.message}
				/>
				<FormField
					id="profile-new-password"
					label="Nueva contraseña"
					type="password"
					autoComplete="new-password"
					required
					placeholder="Mínimo 8 caracteres"
					register={passwordForm.register("newPassword")}
					error={passwordForm.formState.errors.newPassword?.message}
				/>
				<FormField
					id="profile-confirm-password"
					label="Confirmar contraseña"
					type="password"
					autoComplete="new-password"
					required
					register={passwordForm.register("confirmPassword")}
					error={passwordForm.formState.errors.confirmPassword?.message}
				/>
				{pwSuccess && (
					<div
						role="status"
						className="rounded-[var(--radius-lg)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
					>
						{pwSuccess}
					</div>
				)}
				{changePasswordMutation.error && (
					<div
						role="alert"
						className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
					>
						{changePasswordMutation.error instanceof Error
							? changePasswordMutation.error.message
							: "Error"}
					</div>
				)}
				<footer className="flex justify-end pt-2">
					<button
						type="submit"
						disabled={changePasswordMutation.isPending}
						className="flex min-h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] disabled:opacity-60"
					>
						{changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
						Cambiar Contraseña
					</button>
				</footer>
			</form>
		</section>
	);
}

export function ProfileForm({ user }: { user: ProfileUser }) {
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [pwSuccess, setPwSuccess] = useState<string | null>(null);
	const fullName = user.name.trim();
	const avatarUrl = user.avatarUrl;

	const profileForm = useForm<ProfileUpdateData>({
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: { name: fullName, phone: user.phone || "", avatarUrl: avatarUrl || "" },
	});

	const passwordForm = useForm<PasswordChangeData>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
	});

	const updateProfileMutation = useMutation({
		mutationFn: async (data: ProfileUpdateData) => {
			await apiClient.put(`/users/${user.id}`, {
				name: data.name.trim(),
				phone: data.phone || null,
				avatarUrl: data.avatarUrl || null,
			});
		},
		onSuccess: () => {
			setSuccessMessage("Perfil actualizado correctamente");
			setTimeout(() => setSuccessMessage(null), 3000);
		},
	});

	const changePasswordMutation = useMutation({
		mutationFn: async (data: PasswordChangeData) => {
			await apiClient.patch("/auth/change-password", {
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			setPwSuccess("Contraseña actualizada correctamente");
			passwordForm.reset();
			setTimeout(() => setPwSuccess(null), 3000);
		},
	});

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="profile-title">
			<ProfileHeader user={user} avatarUrl={avatarUrl} fullName={fullName} />
			<ProfileInfoForm
				profileForm={profileForm}
				updateProfileMutation={updateProfileMutation}
				successMessage={successMessage}
			/>
			<PasswordChangeForm
				passwordForm={passwordForm}
				changePasswordMutation={changePasswordMutation}
				pwSuccess={pwSuccess}
				userEmail={user.email}
			/>
			<PasskeySettings />
		</section>
	);
}
