"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";

const subscribeMounted = (_callback: () => void) => () => {};
const getSnapshotMounted = () => true;
const getServerSnapshotMounted = () => false;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeMounted,
    getSnapshotMounted,
    getServerSnapshotMounted,
  );

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        title="Cambiar tema"
        className="flex size-11 items-center justify-center rounded-full border border-hairline bg-canvas text-charcoal transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        disabled
      >
        <Sun className="size-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-11 items-center justify-center rounded-full border border-hairline bg-canvas text-charcoal transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
