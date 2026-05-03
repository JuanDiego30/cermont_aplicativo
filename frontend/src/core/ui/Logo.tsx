import Link from "next/link";
import { cn } from "@/_shared/lib/utils";
import { CermontLogoSvg } from "./CermontLogoSvg";

interface LogoProps {
	className?: string;
	showText?: boolean;
	size?: "sm" | "md" | "lg";
	href?: string;
	ariaLabel?: string;
	wordmarkClassName?: string;
}

const sizes = { sm: 24, md: 32, lg: 48 } as const;
const logoTextSizes = { sm: "text-sm", md: "text-base", lg: "text-xl" } as const;

export function Logo({
	className,
	showText = true,
	size = "md",
	href,
	ariaLabel = "Cermont S.A.S.",
	wordmarkClassName,
}: LogoProps) {
	const s = sizes[size];
	const content = (
		<>
			<CermontLogoSvg size={s} className="shrink-0 rounded-[var(--radius-md)]" />
			{showText && (
				<span
					className={cn(
						"font-bold text-[var(--text-primary)]",
						logoTextSizes[size],
						wordmarkClassName,
					)}
				>
					Cermont S.A.S.
				</span>
			)}
		</>
	);

	const wrapperClassName = `flex items-center gap-2 ${className ?? ""}`.trim();

	if (href) {
		return (
			<Link
				href={href}
				className={wrapperClassName}
				{...(!showText ? { "aria-label": ariaLabel } : {})}
			>
				{content}
			</Link>
		);
	}

	return <span className={wrapperClassName}>{content}</span>;
}
