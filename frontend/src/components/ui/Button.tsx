'use client';

import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
}

export function Button({
  children,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary:
      'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    secondary:
      'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700',
    outline:
      'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-950',
    ghost:
      'bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
    danger:
      'bg-error-600 text-white shadow-sm hover:bg-error-700 focus:ring-2 focus:ring-error-500 focus:ring-offset-2',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors
        focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
