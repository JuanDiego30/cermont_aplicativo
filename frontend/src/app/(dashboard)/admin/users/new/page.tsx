import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserForm } from "@/modules/users/ui/UserForm";

export default function NewUserPage() {
	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-user-title">
			<header className="flex items-center gap-3">
				<Link
					href="/admin/users"
					className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<h1 id="new-user-title" className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Nuevo usuario
				</h1>
			</header>

			<UserForm defaultRole="tecnico" />
		</section>
	);
}
