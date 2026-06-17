"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AuthBrandHeaderProps {
	screenReaderTitle?: string;
}

export function AuthBrandHeader({ screenReaderTitle = "Cermont" }: AuthBrandHeaderProps) {
	return (
		<header className="mb-8">
			<Link
				href="/login"
				className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone transition hover:text-primary-300"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver
			</Link>
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-primary-600">
					<span className="text-lg font-semibold text-white">C</span>
				</div>
				<div>
					<h1 className="text-xl font-semibold text-white">{screenReaderTitle}</h1>
					<p className="text-sm text-stone">Cermont</p>
				</div>
			</div>
		</header>
	);
}
