"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCountUp } from "../hooks/useCountUp";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { LANDING_STATS } from "../landing-data";

function StatItem({
	value,
	suffix,
	label,
	shouldAnimate,
}: {
	value: number;
	suffix: string;
	label: string;
	shouldAnimate: boolean;
}) {
	const count = useCountUp({ end: value, duration: 2000, enabled: shouldAnimate });

	return (
		<div className="text-center">
			<p className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
				{count}
				{suffix}
			</p>
			<p className="mt-1 text-xs text-white/60 sm:text-sm">{label}</p>
		</div>
	);
}

export function StatsBar() {
	const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
	const [hasAnimated, setHasAnimated] = useState(false);

	if (isVisible && !hasAnimated) {
		setHasAnimated(true);
	}

	return (
		<section
			ref={ref}
			data-landing-section
			aria-label="Estadísticas de Cermont"
			className={cn("relative overflow-hidden", "bg-gradient-to-r from-[#1a3a2a] to-[#0d2818]")}
		>
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
					{LANDING_STATS.map((stat) => (
						<StatItem
							key={stat.label}
							value={stat.value}
							suffix={stat.suffix}
							label={stat.label}
							shouldAnimate={hasAnimated}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
