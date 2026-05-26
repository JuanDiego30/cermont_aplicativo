"use client";

import { ROLE_LABELS, type UserRole } from "@cermont/domain";
import { ChangePasswordSchema, CreateUserSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/utils/format-date";

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

// ── Local interface for the profile page data shape ──
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

function useProfileMutations(userId: string) {
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const updateProfileMutation = useMutation({
		mutationFn: async (data: ProfileUpdateData) => {
			await apiClient.put(`/users/${userId}`, {
				name: data.name.trim(),
				phone: data.phone || null,
				avatarUrl: data.avatarUrl || null,
			});
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			void queryClient.invalidateQueries({ queryKey: ["user", userId] });
			setSuccessMessage("Perfil actualizado correctamente");
			setTimeout(() => setSuccessMessage(null), 3000);
		},
	});

	return { successMessage, updateProfileMutation };
}

function usePasswordMutations() {
	const [pwSuccess, setPwSuccess] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const changePasswordMutation = useMutation({
		mutationFn: async (data: PasswordChangeData) => {
			await apiClient.patch("/auth/change-password", {
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["auth"] });
			setPwSuccess("Contraseña actualizada correctamente");
			setTimeout(() => setPwSuccess(null), 3000);
		},
	});

	return { pwSuccess, changePasswordMutation };
}

export function ProfileForm({ user }: { user: ProfileUser }) {
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

	const { successMessage, updateProfileMutation } = useProfileMutations(user.id);
	const { pwSuccess, changePasswordMutation } = usePasswordMutations();

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="profile-title">
			<ProfileHeaderSection user={user} avatarUrl={avatarUrl} fullName={fullName} />

			<section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					Información Personal
				</h2>
				<form
					onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))}
					className="space-y-4"
				>
					<div>
						<label
							htmlFor="profile-name"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Nombre completo
						</label>
						<input
							id="profile-name"
							type="text"
							required
							className="input-field mt-1"
							{...profileForm.register("name")}
						/>
						{profileForm.formState.errors.name && (
							<p className="mt-1 text-xs text-red-500">
								{profileForm.formState.errors.name.message}
							</p>
						)}
					</div>
					<div>
						<label
							htmlFor="profile-phone"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Teléfono
						</label>
						<input
							id="profile-phone"
							type="tel"
							placeholder="+56 9 1234 5678"
							className="input-field mt-1"
							{...profileForm.register("phone")}
						/>
					</div>
					<div>
						<label
							htmlFor="profile-avatar-url"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							URL de Avatar
						</label>
						<input
							id="profile-avatar-url"
							type="url"
							placeholder="https://…"
							className="input-field mt-1"
							{...profileForm.register("avatarUrl")}
						/>
						{profileForm.formState.errors.avatarUrl && (
							<p className="mt-1 text-xs text-red-500">
								{profileForm.formState.errors.avatarUrl.message}
							</p>
						)}
					</div>
					{successMessage && (
						<div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
							{successMessage}
						</div>
					)}
					{updateProfileMutation.error && (
						<div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
							{updateProfileMutation.error instanceof Error
								? updateProfileMutation.error.message
								: "Error"}
						</div>
					)}
					<footer className="flex justify-end pt-2">
						<button
							type="submit"
							disabled={updateProfileMutation.isPending}
							className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
						>
							{updateProfileMutation.isPending && <Loader2 className="size-4 animate-spin" />}
							Guardar Cambios
						</button>
					</footer>
				</form>
			</section>

			<PasswordChangeSection
				passwordForm={passwordForm}
				pwSuccess={pwSuccess}
				changePasswordMutation={changePasswordMutation}
				userEmail={user.email}
			/>
		</section>
	);
}

function ProfileHeaderSection({
	user,
	avatarUrl,
	fullName,
}: {
	user: ProfileUser;
	avatarUrl: string | null;
	fullName: string;
}) {
	return (
		<header className="flex items-center gap-4">
			<figure className="flex size-14 items-center justify-center rounded-full bg-blue-100">
				{avatarUrl ? (
					<Image
						src={avatarUrl}
						alt={`Avatar de ${user.name}`}
						width={56}
						height={56}
						unoptimized
						className="size-14 rounded-full object-cover"
					/>
				) : (
					<UserIcon aria-hidden="true" className="size-7 text-blue-600" />
				)}
			</figure>
			<div>
				<h1 id="profile-title" className="text-2xl font-semibold text-zinc-900 dark:text-white">
					{fullName}
				</h1>
				<p className="flex items-center gap-2">
					<span className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</span>
					<span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
						{ROLE_LABELS[user.role as UserRole] ?? user.role}
					</span>
				</p>
				{user.lastLogin && (
					<p className="text-xs text-zinc-400">Último acceso: {formatDateTime(user.lastLogin)}</p>
				)}
			</div>
		</header>
	);
}

type PwMutation = ReturnType<typeof usePasswordMutations>["changePasswordMutation"];
function PasswordChangeSection({
	passwordForm,
	pwSuccess,
	changePasswordMutation,
	userEmail,
}: {
	passwordForm: ReturnType<typeof useForm<PasswordChangeData>>;
	pwSuccess: string | null;
	changePasswordMutation: PwMutation;
	userEmail: string;
}) {
	return (
		<section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
			<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
					className="hidden"
				/>
				<div>
					<label
						htmlFor="profile-current-password"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Contraseña actual
					</label>
					<input
						id="profile-current-password"
						type="password"
						autoComplete="current-password"
						required
						className="input-field mt-1"
						{...passwordForm.register("currentPassword")}
					/>
					{passwordForm.formState.errors.currentPassword && (
						<p className="mt-1 text-xs text-red-500">
							{passwordForm.formState.errors.currentPassword.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="profile-new-password"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Nueva contraseña
					</label>
					<input
						id="profile-new-password"
						type="password"
						autoComplete="new-password"
						required
						placeholder="Mínimo 8 caracteres"
						className="input-field mt-1"
						{...passwordForm.register("newPassword")}
					/>
					{passwordForm.formState.errors.newPassword && (
						<p className="mt-1 text-xs text-red-500">
							{passwordForm.formState.errors.newPassword.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="profile-confirm-password"
						className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Confirmar contraseña
					</label>
					<input
						id="profile-confirm-password"
						type="password"
						autoComplete="new-password"
						required
						className="input-field mt-1"
						{...passwordForm.register("confirmPassword")}
					/>
					{passwordForm.formState.errors.confirmPassword && (
						<p className="mt-1 text-xs text-red-500">
							{passwordForm.formState.errors.confirmPassword.message}
						</p>
					)}
				</div>
				{pwSuccess && (
					<div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
						{pwSuccess}
					</div>
				)}
				{changePasswordMutation.error && (
					<div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
						{changePasswordMutation.error instanceof Error
							? changePasswordMutation.error.message
							: String(changePasswordMutation.error)}
					</div>
				)}
				<footer className="flex justify-end pt-2">
					<button
						type="submit"
						disabled={changePasswordMutation.isPending}
						className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900 disabled:opacity-60"
					>
						{changePasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
						Cambiar Contraseña
					</button>
				</footer>
			</form>
		</section>
	);
}
