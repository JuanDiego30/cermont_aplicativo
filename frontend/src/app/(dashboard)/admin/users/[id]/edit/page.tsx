"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/users/hooks/useUser";
import { UserForm } from "@/users/ui/UserForm";

export default function EditUserPage() {
	const params = useParams<{ id: string }>();
	const { data: user, isLoading } = useUser(params.id);

	if (isLoading) {
		return <div>Cargando usuario...</div>;
	}

	if (!user) {
		return <div>Usuario no encontrado</div>;
	}

	return (
		<main className="mx-auto max-w-lg p-6">
			<h1>Editar Usuario</h1>
			<UserForm user={user} />
		</main>
	);
}
