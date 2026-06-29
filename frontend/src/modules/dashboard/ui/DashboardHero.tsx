"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

gsap.registerPlugin(useGSAP);

interface DashboardHeroMetric {
	label: string;
	value: number;
	format?: "number" | "currency";
}

interface DashboardHeroProps {
	userName: string;
	role: string;
	todayLabel: string;
	metrics: DashboardHeroMetric[];
	greeting?: string;
}

function formatMetricValue(value: number, fmt: "number" | "currency" = "number"): string {
	if (fmt === "currency") {
		if (value >= 1_000_000) {
			return `$${(value / 1_000_000).toFixed(1)}M`;
		}
		return `$${Math.round(value).toLocaleString("es-CO")}`;
	}
	return Math.round(value).toLocaleString("es-CO");
}

export function DashboardHero({
	userName,
	role,
	todayLabel,
	metrics,
	greeting = "Bienvenido de vuelta",
}: DashboardHeroProps) {
	const heroRef = useRef<HTMLElement>(null);
	const metricRefs = useRef<(HTMLDivElement | null)[]>([]);

	useGSAP(
		() => {
			if (prefersReducedMotion() || !heroRef.current) {
				return;
			}

			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

			tl.from(heroRef.current.querySelector("[data-hero='greeting']"), {
				opacity: 0,
				y: -12,
				duration: 0.4,
			});

			tl.from(
				metricRefs.current.filter(Boolean),
				{
					opacity: 0,
					y: 16,
					stagger: 0.06,
					duration: 0.35,
				},
				"-=0.15",
			);
		},
		{ scope: heroRef, dependencies: [metrics] },
	);

	return (
		<header
			ref={heroRef}
			className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]"
		>
			{/* Subtle background pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
				style={{
					backgroundImage:
						"radial-gradient(circle at 15% 15%, var(--color-brand-blue) 0%, transparent 40%), radial-gradient(circle at 85% 85%, var(--color-brand-annotate) 0%, transparent 40%)",
				}}
				aria-hidden="true"
				data-testid="hero-gradient-overlay"
			/>

			<div className="relative px-5 py-5 md:px-8 md:py-7">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					{/* Greeting section */}
					<div data-hero="greeting" className="min-w-0">
						<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
							<Calendar className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
							<time dateTime={new Date().toISOString()} suppressHydrationWarning>
								{todayLabel}
							</time>
						</div>
						<h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
							{greeting}, <span className="text-[var(--color-brand-blue)]">{userName}</span>
						</h1>
						<p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
							<Users className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
							<span className="capitalize">{role}</span>
						</p>
					</div>

					{/* Quick metrics strip */}
					{metrics.length > 0 && (
						<div className="flex flex-wrap items-center gap-4 sm:gap-6">
							{metrics.map((metric, index) => (
								<div
									key={metric.label}
									ref={(el) => {
										metricRefs.current[index] = el;
									}}
									className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3 shadow-[var(--shadow-1)] transition-shadow duration-200 hover:shadow-[var(--shadow-2)]"
								>
									<div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-info-bg)] text-[var(--color-brand-blue)]">
										<TrendingUp className="size-5" aria-hidden="true" />
									</div>
									<div className="min-w-[80px]">
										<p className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
											{formatMetricValue(metric.value, metric.format)}
										</p>
										<p className="whitespace-nowrap text-xs font-medium text-[var(--text-secondary)]">
											{metric.label}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
