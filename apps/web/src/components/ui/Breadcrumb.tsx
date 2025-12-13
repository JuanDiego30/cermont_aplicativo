// 📁 web/src/components/ui/Breadcrumb.tsx
// Diseño TailAdmin - Componente Breadcrumb mejorado

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  pageTitle?: string;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  pageTitle,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {pageTitle && (
        <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
          {pageTitle}
        </h2>
      )}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
          </li>

          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-800 dark:text-white/90">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

// Componente simple de título de página con breadcrumb
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbItems = [],
  actions,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {item.href && index < breadcrumbItems.length - 1 ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-brand-500 dark:text-brand-400">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
