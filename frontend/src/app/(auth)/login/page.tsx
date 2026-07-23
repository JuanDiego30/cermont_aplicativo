import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginCarousel } from "@/modules/auth/ui/LoginCarousel";
import { LoginForm } from "@/modules/auth/ui/LoginForm";

export const metadata: Metadata = { title: "Acceso corporativo" };

export default function LoginPage() {
	return (
		<main className="flex min-h-dvh flex-col-reverse overflow-x-hidden bg-[var(--surface-page)] md:flex-row">
			{/* Brand/Carousel - full width on mobile, left half on desktop */}
			<div className="w-full md:w-1/2 lg:w-[50%]">
				<LoginCarousel />
			</div>

			{/* Form - rendered ONCE, responsive positioning */}
			<div className="flex w-full items-center justify-center md:w-1/2 lg:w-[50%]">
				<section
					className="animate-fade-in-up w-full max-w-md px-8 py-16 md:px-12 lg:px-20"
					aria-label="Formulario de inicio de sesión"
				>
					<Suspense
						fallback={
							<div className="flex items-center justify-center py-24" aria-live="polite">
								<Loader2 className="size-10 animate-spin text-brand" aria-hidden="true" />
								<span className="sr-only">Cargando formulario de inicio de sesión…</span>
							</div>
						}
					>
						<LoginForm />
					</Suspense>
				</section>
			</div>
		</main>
	);
}
