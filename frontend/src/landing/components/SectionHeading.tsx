import { cn } from "@/_shared/lib/utils";
import { BadgePill } from "@/core/ui/BadgePill";

interface SectionHeadingProps {
	eyebrow: string;
	title: string;
	description: string;
	align?: "left" | "center";
	inverse?: boolean;
}

export function SectionHeading({
	eyebrow,
	title,
	description,
	align = "left",
	inverse = false,
}: SectionHeadingProps) {
	const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
	const eyebrowClassName = inverse
		? "border-white/10 bg-white/5 text-slate-200 shadow-none"
		: "border-border-default bg-surface-primary text-text-secondary shadow-1";
	const titleClassName = inverse ? "text-white" : "text-text-primary";
	const descriptionClassName = inverse ? "text-slate-300" : "text-text-secondary";

	return (
		<div className={cn("flex flex-col gap-4", alignment)}>
			<BadgePill
				className={cn(
					"px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
					eyebrowClassName,
				)}
				dotClassName="bg-(--color-brand-blue)"
				ariaLabel={eyebrow}
			>
				{eyebrow}
			</BadgePill>
			<div className="max-w-3xl space-y-4">
				<h2
					className={cn(
						"text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl",
						titleClassName,
					)}
				>
					{title}
				</h2>
				<p className={cn("max-w-2xl text-base leading-7 sm:text-lg", descriptionClassName)}>
					{description}
				</p>
			</div>
		</div>
	);
}
