import { DEFAULT_NEW_USER_ROLE } from "@cermont/domain";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserForm } from "@/modules/users/ui/UserForm";

export default function NewUserPage() {
	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-user-title">
			<header className="flex items-center gap-3">
				<Link
					href="/admin/users"
					className="flex items-center gap-1 text-sm text-steel hover:text-charcoal dark:text-stone"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<h1 id="new-user-title" className="text-2xl font-semibold text-ink dark:text-white">
					Nuevo usuario
				</h1>
			</header>

			<UserForm defaultRole={DEFAULT_NEW_USER_ROLE} />
		</section>
	);
}
