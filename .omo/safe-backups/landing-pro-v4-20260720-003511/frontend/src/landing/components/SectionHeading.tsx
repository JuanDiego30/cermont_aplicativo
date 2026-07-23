import { BadgePill } from "@/core/ui/BadgePill";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
	id?: string;
	eyebrow: string;
	title: string;
	description: string;
	align?: "left" | "center";
	inverse?: boolean;
}

export function SectionHeading({
	id,
	eyebrow,
	title,
	description,
	align = "left",
	inverse = false,
}: SectionHeadingProps) {
	const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
	const eyebrowClassName = inverse
		? "border-white/10 bg-canvas/5 text-stone shadow-none"
		: "border-hairline bg-canvas text-charcoal shadow-1";
	const titleClassName = inverse ? "text-white" : "text-ink";
	const descriptionClassName = inverse ? "text-muted-text" : "text-charcoal";

	return (
		<div className={cn("flex flex-col gap-4", alignment)}>
			<BadgePill
				className={cn(
					"px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
					eyebrowClassName,
				)}
				dotClassName="bg-brand-annotate"
				ariaLabel={eyebrow}
			>
				{eyebrow}
			</BadgePill>
			<div className="max-w-3xl space-y-4">
				<h2
					id={id}
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
