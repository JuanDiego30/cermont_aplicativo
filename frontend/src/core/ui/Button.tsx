import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/_shared/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-[var(--color-brand-blue)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] hover:bg-[var(--color-brand-blue-hover)]",
				primary:
					"bg-[var(--color-brand-blue)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] hover:bg-[var(--color-brand-blue-hover)]",
				secondary:
					"bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--color-neutral-200)]",
				ghost:
					"bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
				destructive: "bg-[var(--color-danger)] text-[var(--text-inverse)] hover:opacity-90",
				outline:
					"border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
				link: "text-[var(--color-brand-blue)] underline-offset-4 hover:underline",
			},
			size: {
				default: "h-11 px-4 py-2",
				sm: "h-10 rounded-lg px-3 text-xs",
				md: "h-11 px-4 text-sm",
				lg: "h-11 rounded-lg px-6 text-base",
				icon: "h-11 w-11 rounded-lg",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
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
	const spinner = (
		<span
			className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		/>
	);

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
			{loading ? spinner : null}
			{children}
		</Comp>
	);
};
Button.displayName = "Button";

export { Button, buttonVariants };
