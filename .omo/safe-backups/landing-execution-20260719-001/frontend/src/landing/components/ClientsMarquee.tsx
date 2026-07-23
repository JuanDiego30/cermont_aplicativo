"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CLIENT_LOGOS } from "../landing-data";

const MARQUEE_ITEMS = Array.from({ length: 2 }).flatMap((_, groupIndex) =>
	CLIENT_LOGOS.map((client) => ({
		...client,
		_id: `${client.name}-group-${groupIndex}`,
	})),
);

export function ClientsMarquee() {
	return (
		<section
			data-landing-section
			aria-label="Empresas que confían en Cermont"
			className="border-y border-white/10 bg-canvas py-12 sm:py-16"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<p
					className={cn(
						"mb-8 text-center text-xs font-semibold uppercase tracking-[0.24em]",
						"text-[var(--text-muted)]",
					)}
				>
					Empresas que confían en nuestra operación
				</p>

				<div className="relative overflow-hidden">
					<motion.div
						className="flex gap-16 items-center"
						animate={{ x: ["0%", "-50%"] }}
						transition={{
							duration: 30,
							ease: "linear",
							repeat: Number.POSITIVE_INFINITY,
						}}
					>
						{MARQUEE_ITEMS.map((client) => (
							<span
								key={client._id}
								className={cn(
									"shrink-0 text-base font-bold tracking-wider",
									"text-[var(--text-muted)]/40",
									"transition-colors duration-300",
									"hover:text-[var(--color-brand)]",
								)}
							>
								{client.name}
							</span>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
