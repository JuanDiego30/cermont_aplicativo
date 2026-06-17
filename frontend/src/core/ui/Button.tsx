import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"motion-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-on-primary shadow-button hover:opacity-90",
				primary: "bg-brand-green text-on-dark shadow-button hover:opacity-90",
				secondary: "border border-hairline bg-canvas text-ink shadow-button hover:bg-surface",
				accent: "bg-brand-tag text-on-dark shadow-button hover:opacity-90",
				ghost: "bg-transparent text-charcoal hover:bg-hairline hover:text-ink",
				destructive: "bg-brand-error text-on-dark shadow-button hover:opacity-90",
				outline: "border border-hairline bg-transparent text-ink hover:bg-hairline",
				link: "text-brand-green underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-6 py-2",
				sm: "h-9 px-4 text-xs",
				md: "h-10 px-6 text-sm",
				lg: "h-11 px-8 text-base",
				icon: "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const BUTTON_SPINNER = (
	<span
		className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
		aria-hidden="true"
	/>
);

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	ref?: Ref<HTMLButtonElement>;
}

const Button = ({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	disabled,
	children,
	ref,
	...props
}: ButtonProps) => {
	const Comp = asChild ? Slot : "button";

	if (asChild) {
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				aria-busy={loading}
				data-loading={loading ? "" : "false"}
				{...props}
			>
				{children}
			</Comp>
		);
	}

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? BUTTON_SPINNER : null}
			{children}
		</Comp>
	);
};
Button.displayName = "Button";

export { Button };
