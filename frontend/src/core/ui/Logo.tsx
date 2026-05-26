import Link from "next/link";
import { cn } from "@/lib/utils";
import { CermontLogoSvg } from "./CermontLogoSvg";

interface LogoProps {
	className?: string;
	showText?: boolean;
	size?: "sm" | "md" | "lg";
	href?: string;
	ariaLabel?: string;
	wordmarkClassName?: string;
	logoClassName?: string;
	hideWordmarkOnMobile?: boolean;
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
	logoClassName,
	hideWordmarkOnMobile = true,
}: LogoProps) {
	const s = sizes[size];
	const content = (
		<>
			<CermontLogoSvg
				size={s}
				className={cn("shrink-0 rounded-[var(--radius-md)]", logoClassName)}
			/>
			{showText && (
				<span
					className={cn(
						"font-bold text-[var(--text-primary)]",
						logoTextSizes[size],
						hideWordmarkOnMobile && "hidden sm:inline",
						wordmarkClassName,
					)}
				>
					Cermont S.A.S.
				</span>
			)}
		</>
	);

	const wrapperClassName = cn("flex items-center gap-2", className);

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
