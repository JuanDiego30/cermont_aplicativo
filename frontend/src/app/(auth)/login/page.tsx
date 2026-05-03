import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginCarousel } from "@/auth/ui/LoginCarousel";
import { LoginForm } from "@/auth/ui/LoginForm";

interface FormFallbackProps {
	className: string;
}

interface SuspenseLoginFormProps {
	fallbackClassName: string;
}

function FormFallback({ className }: FormFallbackProps) {
	return (
		<div className={`flex items-center justify-center ${className}`} role="status">
			<Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden="true" />
			<span className="sr-only">Cargando formulario de inicio de sesión...</span>
		</div>
	);
}

function SuspenseLoginForm({ fallbackClassName }: SuspenseLoginFormProps) {
	return (
		<Suspense fallback={<FormFallback className={fallbackClassName} />}>
			<LoginForm />
		</Suspense>
	);
}

function ScrollIndicator() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute -bottom-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center text-slate-500 motion-safe:animate-bounce"
		>
			<span className="rounded-full border-2 border-slate-600 bg-[var(--surface-sidebar)] px-1 py-2">
				<span className="block h-1 w-1 rounded-full bg-slate-400" />
			</span>
		</div>
	);
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LoginPage(props: { searchParams: SearchParams }) {
	const searchParams = await props.searchParams;

	if (searchParams.email || searchParams.password || searchParams.token) {
		redirect("/login");
	}

	return (
		<main className="flex min-h-dvh flex-col overflow-x-hidden bg-[var(--surface-sidebar)] font-outfit selection:bg-primary-600/30 md:flex-row">
			<div className="sticky top-0 z-20 w-full border-b border-white/5 bg-[var(--surface-sidebar)]/95 backdrop-blur-2xl md:hidden">
				<section className="px-6 pb-6" aria-label="Formulario de inicio de sesión">
					<SuspenseLoginForm fallbackClassName="h-112.5" />
				</section>

				<ScrollIndicator />
			</div>

			<LoginCarousel />

			<div className="relative z-20 hidden items-center justify-center border-l border-white/5 bg-[var(--surface-sidebar)] md:flex md:w-1/2 lg:w-[45%]">
				<section className="w-full px-12 lg:px-20" aria-label="Formulario de inicio de sesión">
					<SuspenseLoginForm fallbackClassName="min-h-100" />
				</section>
			</div>
		</main>
	);
}
