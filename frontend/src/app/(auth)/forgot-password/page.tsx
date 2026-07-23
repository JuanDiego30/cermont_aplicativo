import type { Metadata } from "next";
import { AuthBrandHeader } from "@/modules/auth/ui/AuthBrandHeader";
import { AuthPageShell } from "@/modules/auth/ui/AuthPageShell";
import { ForgotPasswordContent } from "@/modules/auth/ui/ForgotPasswordContent";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
	return (
		<AuthPageShell>
			<section className="w-full" aria-label="Recuperar contraseña">
				<AuthBrandHeader screenReaderTitle="Recuperar contraseña" />
				<ForgotPasswordContent />
			</section>
		</AuthPageShell>
	);
}
