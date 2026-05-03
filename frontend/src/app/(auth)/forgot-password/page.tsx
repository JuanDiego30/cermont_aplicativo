import { AuthBrandHeader } from "@/auth/ui/AuthBrandHeader";
import { AuthPageShell } from "@/auth/ui/AuthPageShell";
import { ForgotPasswordContent } from "@/auth/ui/ForgotPasswordContent";

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
