'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface ActionCardProps {
  /** Title of the action */
  title: string;
  /** Description text */
  description?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Link href (makes card clickable) */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Variant style */
  variant?: 'default' | 'primary' | 'outline';
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ActionCard - Tarjeta de acción rápida reutilizable
 * 
 * @example
 * // Acción con link
 * <ActionCard 
 *   title="Nueva Orden" 
 *   description="Crear nueva orden de trabajo"
 *   href="/orders/new"
 *   icon={<PlusIcon />}
 * />
 * 
 * @example
 * // Acción con onClick
 * <ActionCard 
 *   title="Exportar" 
 *   onClick={() => handleExport()}
 *   variant="outline"
 * />
 */
export function ActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
}: ActionCardProps) {
  const baseClasses = `
    flex items-center gap-4 p-4 rounded-xl 
    transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variantClasses = {
    default: `
      bg-gray-50 dark:bg-gray-800/50 
      hover:bg-gray-100 dark:hover:bg-gray-700/50
      border border-transparent
    `,
    primary: `
      bg-brand-50 dark:bg-brand-900/20 
      hover:bg-brand-100 dark:hover:bg-brand-900/30
      border border-brand-200 dark:border-brand-800
    `,
    outline: `
      bg-transparent 
      hover:bg-gray-50 dark:hover:bg-gray-800/50
      border border-gray-200 dark:border-gray-700
    `,
  };

  const content = (
    <>
      {icon && (
        <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {description}
          </p>
        )}
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </>
  );

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

export default ActionCard;
