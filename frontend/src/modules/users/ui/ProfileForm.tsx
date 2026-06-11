"use client";

import { ROLE_LABELS, type UserRole } from "@cermont/domain";
import { ChangePasswordSchema, CreateUserSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/utils/format-date";

const profileUpdateSchema = CreateUserSchema.pick({
	name: true,
	phone: true,
}).extend({
	avatarUrl: z.url("URL inválida").optional().or(z.literal("")),
});
type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

const passwordChangeSchema = ChangePasswordSchema.extend({
	confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Las contraseñas no coinciden",
	path: ["confirmPassword"],
});
type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

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
		mutationFn: async (data: ProfileUpdateValues) => {
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
		mutationFn: async (data: PasswordChangeValues) => {
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

	const profileForm = useForm<ProfileUpdateValues>({
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: { name: fullName, phone: user.phone || "", avatarUrl: avatarUrl || "" },
	});

	const passwordForm = useForm<PasswordChangeValues>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
	});

	const { successMessage, updateProfileMutation } = useProfileMutations(user.id);
	const { pwSuccess, changePasswordMutation } = usePasswordMutations();

	// Photo preview: updates both display and form value in one handler
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const handlePhotoSelect = (dataUrl: string) => {
		setPreviewUrl(dataUrl);
		profileForm.setValue("avatarUrl", dataUrl);
	};

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="profile-title">
			<ProfileHeaderSection
				user={user}
				avatarUrl={previewUrl || avatarUrl}
				fullName={fullName}
				onPhotoSelect={handlePhotoSelect}
			/>

			<section className="rounded-3xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-sm">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
					Información Personal
				</h2>
				<form
					onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))}
					className="space-y-4"
				>
					<div>
						<label
							htmlFor="profile-name"
							className="block text-sm font-medium text-[var(--text-primary)]"
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
							<p className="mt-1 text-xs text-[var(--color-danger)]">
								{profileForm.formState.errors.name.message}
							</p>
						)}
					</div>
					<div>
						<label
							htmlFor="profile-phone"
							className="block text-sm font-medium text-[var(--text-primary)]"
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
					<input type="hidden" {...profileForm.register("avatarUrl")} />
					{successMessage && (
						<div
							aria-live="polite"
							className="rounded-lg bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]"
						>
							{successMessage}
						</div>
					)}
					{updateProfileMutation.error && (
						<div
							role="alert"
							className="rounded-lg bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
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
							className="flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
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
	onPhotoSelect,
}: {
	user: ProfileUser;
	avatarUrl: string | null;
	fullName: string;
	onPhotoSelect: (dataUrl: string) => void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => {
			const result = ev.target?.result as string;
			if (result) {
				onPhotoSelect(result);
			}
		};
		reader.readAsDataURL(file);
	}

	return (
		<header className="flex items-center gap-4">
			<div className="relative">
				<figure className="flex size-14 items-center justify-center rounded-full bg-[var(--color-cermont-blue-bg)] overflow-hidden">
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
						<UserIcon aria-hidden="true" className="size-7 text-[var(--color-brand)]" />
					)}
				</figure>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-[var(--color-brand)] text-white shadow-sm transition-transform hover:scale-110"
					aria-label="Cambiar foto de perfil"
				>
					<Camera className="size-3" />
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/webp"
					className="hidden"
					onChange={handleFileSelect}
					tabIndex={-1}
					aria-label="Seleccionar foto de perfil"
				/>
			</div>
			<div>
				<h1 id="profile-title" className="text-2xl font-semibold text-[var(--text-primary)]">
					{fullName}
				</h1>
				<p className="flex items-center gap-2">
					<span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
					<span className="rounded-full bg-[var(--color-cermont-blue-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-brand)]">
						{ROLE_LABELS[user.role as UserRole] ?? user.role}
					</span>
				</p>
				{user.lastLogin && (
					<p className="text-xs text-[var(--text-muted)]">
						Último acceso: {formatDateTime(user.lastLogin)}
					</p>
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
	passwordForm: ReturnType<typeof useForm<PasswordChangeValues>>;
	pwSuccess: string | null;
	changePasswordMutation: PwMutation;
	userEmail: string;
}) {
	return (
		<section className="rounded-3xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-sm">
			<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
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
					aria-label="Correo de usuario"
					className="hidden"
				/>
				<div>
					<label
						htmlFor="profile-current-password"
						className="block text-sm font-medium text-[var(--text-primary)]"
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
						<p className="mt-1 text-xs text-[var(--color-danger)]">
							{passwordForm.formState.errors.currentPassword.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="profile-new-password"
						className="block text-sm font-medium text-[var(--text-primary)]"
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
						<p className="mt-1 text-xs text-[var(--color-danger)]">
							{passwordForm.formState.errors.newPassword.message}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="profile-confirm-password"
						className="block text-sm font-medium text-[var(--text-primary)]"
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
						<p className="mt-1 text-xs text-[var(--color-danger)]">
							{passwordForm.formState.errors.confirmPassword.message}
						</p>
					)}
				</div>
				{pwSuccess && (
					<div
						aria-live="polite"
						className="rounded-lg bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]"
					>
						{pwSuccess}
					</div>
				)}
				{changePasswordMutation.error && (
					<div
						role="alert"
						className="rounded-lg bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
					>
						{changePasswordMutation.error instanceof Error
							? changePasswordMutation.error.message
							: String(changePasswordMutation.error)}
					</div>
				)}
				<footer className="flex justify-end pt-2">
					<button
						type="submit"
						disabled={changePasswordMutation.isPending}
						className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-sidebar-hover)] disabled:opacity-60"
					>
						{changePasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
						Cambiar Contraseña
					</button>
				</footer>
			</form>
		</section>
	);
}
