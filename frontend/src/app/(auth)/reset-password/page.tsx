import { AuthPageShell } from "@/auth/ui/AuthPageShell";
import { ResetPasswordSection } from "@/auth/ui/ResetPasswordSection";

export default function ResetPasswordPage() {
	return (
		<section aria-label="Reset password">
			<AuthPageShell>
				<ResetPasswordSection />
			</AuthPageShell>
		</section>
	);
}
