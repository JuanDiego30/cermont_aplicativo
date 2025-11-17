// components/patterns/AnimatedBackground.tsx
import { ReactNode } from 'react';

type AnimatedBackgroundProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-neutral-950 dark:to-secondary-950 ${className}`}
    >
      {/* Animated Blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-800/20"></div>
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-float rounded-full bg-secondary-300/40 blur-3xl dark:bg-secondary-800/20"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
