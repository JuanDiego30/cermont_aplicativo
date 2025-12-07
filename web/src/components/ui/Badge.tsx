import { cn } from '@/lib/cn';

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark"
  // Legacy colors for compatibility
  | "gray"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
}

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
};

const variants = {
  light: {
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    success: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
    error: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-orange-400",
    info: "bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-500",
    light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
    dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    // Legacy mappings
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  solid: {
    primary: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-sky-500 text-white",
    light: "bg-gray-400 text-white dark:bg-white/5",
    dark: "bg-gray-700 text-white",
    // Legacy mappings
    gray: "bg-gray-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-white",
    red: "bg-red-500 text-white",
    purple: "bg-purple-500 text-white",
  },
};

export function Badge({
  children,
  variant = "light",
  size = "sm",
  color = "gray",
  startIcon,
  endIcon,
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full font-medium",
        sizeStyles[size],
        variants[variant][color],
        className
      )}
    >
      {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
    </span>
  );
}

export default Badge;
