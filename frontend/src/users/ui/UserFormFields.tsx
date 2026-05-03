import type { UserRole } from "@cermont/shared-types/rbac";
import { ALL_AUTHENTICATED_ROLES, ROLE_LABELS } from "@cermont/shared-types/rbac";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField, Select, TextField } from "@/core";
import type { UserFormData } from "./UserForm";

interface UserFormFieldsProps {
	register: UseFormRegister<UserFormData>;
	errors: FieldErrors<UserFormData>;
	isEdit: boolean;
}

export function UserFormFields({ register, errors, isEdit }: UserFormFieldsProps) {
	return (
		<>
			<FormField
				name="name"
				htmlFor="user-name"
				label="Nombre completo"
				error={errors.name?.message}
				required
			>
				<TextField id="user-name" placeholder="Juan Pérez" {...register("name")} />
			</FormField>

			<FormField
				name="email"
				htmlFor="user-email"
				label="Correo electrónico"
				error={errors.email?.message}
				required
			>
				<TextField
					id="user-email"
					type="email"
					placeholder="usuario@cermont.cl"
					{...register("email")}
				/>
			</FormField>

			{!isEdit ? (
				<FormField
					name="password"
					htmlFor="user-password"
					label="Contraseña"
					error={errors.password?.message}
					required
				>
					<TextField
						id="user-password"
						type="password"
						placeholder="••••••••"
						{...register("password")}
					/>
				</FormField>
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<FormField
					name="role"
					htmlFor="user-role"
					label="Rol"
					error={errors.role?.message}
					required
				>
					<Select id="user-role" {...register("role")}>
						<option value="" disabled>
							Selecciona un rol
						</option>
						{ALL_AUTHENTICATED_ROLES.map((roleOption: UserRole) => (
							<option key={roleOption} value={roleOption}>
								{ROLE_LABELS[roleOption] ?? roleOption}
							</option>
						))}
					</Select>
				</FormField>

				<FormField
					name="phone"
					htmlFor="user-phone"
					label={
						<>
							Teléfono <span className="text-slate-400">(opcional)</span>
						</>
					}
					error={errors.phone?.message}
				>
					<TextField
						id="user-phone"
						type="tel"
						placeholder="+56 9 1234 5678"
						{...register("phone")}
					/>
				</FormField>
			</div>
		</>
	);
}
