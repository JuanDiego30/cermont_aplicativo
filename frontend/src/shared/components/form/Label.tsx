import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// ============================================================================
// Types
// ============================================================================

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

// ============================================================================
// Default Styles
// ============================================================================

const DEFAULT_CLASSES =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

// ============================================================================
// Component
// ============================================================================

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label htmlFor={htmlFor} className={twMerge(DEFAULT_CLASSES, className)}>
      {children}
    </label>
  );
};

export default Label;
