"use client";

/**
 * New Kit Page — Opens the KitForm dialog on the parent list page
 *
 * Instead of a standalone form, this page redirects to the kit list
 * with the create dialog open.
 */

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { KitForm } from "@/modules/kits/ui/KitForm";

export default function NewKitPage() {
	const router = useRouter();
	const [formOpen, setFormOpen] = useState(true);

	const handleSuccess = () => {
		setFormOpen(false);
		router.push("/resources/kits");
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			router.push("/resources/kits");
		}
	};

	return (
		<section className="flex h-40 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
			<Loader2 className="mr-2 size-6 animate-spin" aria-hidden="true" />
			<span className="text-sm">Preparando formulario…</span>

			<KitForm open={formOpen} onOpenChange={handleOpenChange} onSuccess={handleSuccess} />
		</section>
	);
}
