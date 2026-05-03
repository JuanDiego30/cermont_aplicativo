import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { HTMLAttributes, HTMLInputTypeAttribute } from "react";
import { AuthBackgroundBlobs } from "@/auth/ui/AuthBackgroundBlobs";
import { Button } from "@/core/ui/Button";

export const metadata: Metadata = { title: "Solicitar acceso" };

const INPUT_CLASS =
	"rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-[background-color,border-color,box-shadow,color] focus:border-primary-400 focus:bg-white/10 focus-visible:ring-4 focus-visible:ring-primary-500/20";

const LABEL_CLASS = "text-sm font-semibold text-slate-300";

const REGISTER_STATUS_MESSAGES = {
	submitted: {
		role: "status",
		className:
			"rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100",
		text: "Solicitud enviada correctamente. Quedó pendiente de validación por un administrador.",
	},
	duplicate: {
		role: "alert",
		className:
			"rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100",
		text: "Ya existe una solicitud o usuario asociado a ese correo electrónico.",
	},
	invalid: {
		role: "alert",
		className: "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100",
		text: "No se pudo procesar la solicitud. Revisa los datos e intenta de nuevo.",
	},
	error: {
		role: "alert",
		className: "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100",
		text: "Ocurrió un error interno al registrar la solicitud.",
	},
} as const;

type RegisterStatusKey = keyof typeof REGISTER_STATUS_MESSAGES;

interface FormFieldProps {
	id: string;
	name: string;
	label: string;
	type?: HTMLInputTypeAttribute;
	inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
	autoComplete?: string;
	placeholder?: string;
	required?: boolean;
}

interface RegisterPageProps {
	searchParams: Promise<{
		status?: string;
	}>;
}

function FormField({
	id,
	name,
	label,
	type = "text",
	inputMode,
	autoComplete,
	placeholder,
	required = false,
}: FormFieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className={LABEL_CLASS}>
				{label}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				inputMode={inputMode}
				autoComplete={autoComplete}
				placeholder={placeholder}
				required={required}
				className={INPUT_CLASS}
			/>
		</div>
	);
}

function isRegisterStatusKey(value: string): value is RegisterStatusKey {
	return value in REGISTER_STATUS_MESSAGES;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
	const { status } = await searchParams;
	const feedback = status && isRegisterStatusKey(status) ? REGISTER_STATUS_MESSAGES[status] : null;

	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 via-[#0c1425] to-slate-900 px-6 py-10 font-outfit selection:bg-primary-200/30">
			<AuthBackgroundBlobs />
			<section
				className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[var(--surface-sidebar)]/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10"
				aria-labelledby="register-page-title"
			>
				<header className="text-center sm:text-left">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-200">
						Portal de clientes
					</p>
					<h1 id="register-page-title" className="mt-3 text-2xl font-semibold text-white">
						Solicitar acceso
					</h1>
					<p className="mt-2 text-sm leading-6 text-slate-300">
						Este formulario es solo para clientes. Tu solicitud quedará pendiente de validación
						antes de habilitar tu acceso.
					</p>
				</header>

				<div
					role="note"
					className="mt-6 rounded-2xl border border-primary-400/20 bg-primary-500/10 px-4 py-4 text-sm text-primary-100"
				>
					<p className="font-semibold">Registro exclusivo para clientes</p>
					<p className="mt-1 text-primary-100/90">
						Completa la información y el administrador validará tu empresa/contrato antes de
						habilitar tu acceso.
					</p>
				</div>

				{feedback ? (
					<p role={feedback.role} aria-atomic="true" className={`mt-4 ${feedback.className}`}>
						{feedback.text}
					</p>
				) : null}

				<form
					action="/api/auth/register-client"
					method="post"
					className="mt-6 flex w-full flex-col gap-4"
				>
					<FormField
						id="fullName"
						name="fullName"
						label="Nombre completo"
						autoComplete="name"
						placeholder="Nombre y apellido"
						required
					/>
					<FormField
						id="email"
						name="email"
						label="Correo"
						type="email"
						autoComplete="email"
						placeholder="correo@empresa.com"
						required
					/>
					<FormField
						id="company"
						name="company"
						label="Empresa / Razón social"
						placeholder="Mi Empresa S.A.S."
						required
					/>
					<FormField
						id="nit"
						name="nit"
						label="NIT (opcional)"
						inputMode="numeric"
						placeholder="900123456-7"
					/>
					<FormField
						id="phone"
						name="phone"
						label="Teléfono (opcional)"
						type="tel"
						autoComplete="tel"
						placeholder="+57 3XX XXX XXXX"
					/>
					<FormField
						id="contractRef"
						name="contractRef"
						label="Referencia de contrato / OT (opcional)"
						placeholder="OT-000123 / Contrato ABC"
					/>

					<Button type="submit" className="mt-2 w-full">
						Enviar solicitud
					</Button>

					<Button
						asChild
						variant="outline"
						className="mt-2 w-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
					>
						<Link href="/login">
							<ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al inicio de sesión
						</Link>
					</Button>
				</form>
			</section>
		</main>
	);
}
