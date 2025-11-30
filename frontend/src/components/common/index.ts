/**
 * Common Components - Cermont
 * Shared utility components
 */

// ============================================================================
// Branding
// ============================================================================
export { CermontLogo, CermontLogoWithTagline } from './CermontLogo';
export type { LogoVariant, LogoFrame, LogoSize } from './CermontLogo';

// ============================================================================
// Cards & Layouts
// ============================================================================
export { default as ComponentCard } from './ComponentCard';
export { default as GridShape } from './GridShape';
export { StatCard } from './StatCard';
export type { StatCardVariant } from './StatCard';
export { ActionCard } from './ActionCard';

// ============================================================================
// Status & Badges
// ============================================================================
export { StatusBadge } from './StatusBadge';
export type { StatusType } from './StatusBadge';

// ============================================================================
// Navigation & Breadcrumbs
// ============================================================================
export { default as PageBreadcrumb } from './PageBreadCrumb';

// ============================================================================
// Theme & UI
// ============================================================================
export { ThemeToggleButton } from './ThemeToggleButton';
export { default as ThemeTogglerTwo } from './ThemeTogglerTwo';

// ============================================================================
// Error Handling
// ============================================================================
export { ErrorBoundary, ErrorFallback, withErrorBoundary } from './ErrorBoundary';

// ============================================================================
// Charts & Tables
// ============================================================================
export { default as ChartTab } from './ChartTab';

// ============================================================================
// Loading & Skeletons
// ============================================================================
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonStatCard,
  SkeletonList,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonOrderDetail,
  SkeletonProfile,
} from './Skeleton';

// ============================================================================
// Accessibility
// ============================================================================
export { SkipToContent } from './SkipToContent';
