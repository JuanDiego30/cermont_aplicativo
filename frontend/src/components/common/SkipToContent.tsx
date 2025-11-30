'use client';

/**
 * SkipToContent - Accessibility component for keyboard navigation
 * 
 * Allows users to skip directly to main content bypassing navigation.
 * Essential for screen reader users and keyboard-only navigation.
 * 
 * @example
 * // In layout.tsx
 * <SkipToContent targetId="main-content" />
 * <Navigation />
 * <main id="main-content">...</main>
 */

interface SkipToContentProps {
  /** ID of the target element to focus */
  targetId?: string;
  /** Text shown in the skip link */
  text?: string;
  /** Additional classes */
  className?: string;
}

export function SkipToContent({
  targetId = 'main-content',
  text = 'Ir al contenido principal',
  className = '',
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-99999
        focus:px-4 focus:py-2
        focus:bg-brand-500 focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2
        transition-all
        ${className}
      `}
    >
      {text}
    </a>
  );
}

export default SkipToContent;
