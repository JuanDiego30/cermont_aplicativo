"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/core/ui/Logo";

interface AuthBrandHeaderProps {
	screenReaderTitle?: string;
}

export function AuthBrandHeader({ screenReaderTitle = "Cermont" }: AuthBrandHeaderProps) {
	return (
		<header className="mb-8">
			<Link
				href="/login"
				className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-primary-300"
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Volver
			</Link>
			<div className="flex items-center gap-3">
				<Logo showText={false} size="md" />
				<div>
					<h1 className="text-xl font-semibold text-white">{screenReaderTitle}</h1>
					<p className="text-sm text-slate-400">Cermont</p>
				</div>
			</div>
		</header>
	);
}
