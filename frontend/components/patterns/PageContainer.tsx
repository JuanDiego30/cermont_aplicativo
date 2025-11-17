// components/patterns/PageContainer.tsx
import { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
};

export function PageContainer({
  children,
  maxWidth = '7xl',
  className = '',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-8 dark:from-primary-950 dark:via-neutral-950 dark:to-secondary-950 ${className}`}
    >
      {/* Animated Blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-800/20"></div>
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-float rounded-full bg-secondary-300/40 blur-3xl dark:bg-secondary-800/20"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Content Container */}
      <div className={`relative mx-auto ${maxWidthClasses[maxWidth]}`}>{children}</div>
    </div>
  );
}
