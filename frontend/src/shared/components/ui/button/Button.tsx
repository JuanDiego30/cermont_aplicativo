'use client';

import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  className = "",
  disabled = false,
  loading = false,
  ...props
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-sm hover:bg-brand-600 disabled:bg-brand-300 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700",
    outline:
      "bg-transparent text-brand-600 border border-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-950",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition-colors focus:outline-none ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        isDisabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        startIcon && <span className="flex items-center" aria-hidden="true">{startIcon}</span>
      )}
      {children}
      {endIcon && !loading && <span className="flex items-center" aria-hidden="true">{endIcon}</span>}
    </button>
  );
};

export default Button;
export { Button };
