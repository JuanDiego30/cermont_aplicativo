/**
 * ARCHIVO: uiStore.ts
 * FUNCION: Store global para estado de UI (tema, sidebar)
 * IMPLEMENTACION: Zustand con middleware persist para localStorage
 * DEPENDENCIAS: zustand, zustand/middleware
 * EXPORTS: useUIStore, useInitializeTheme
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Sidebar
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme state
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';

          if (typeof window !== 'undefined') {
            if (newTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }

          return { theme: newTheme };
        }),
      setTheme: (theme) =>
        set(() => {
          if (typeof window !== 'undefined') {
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { theme };
        }),

      // Sidebar state
      isExpanded: true,
      isMobileOpen: false,
      isHovered: false,
      setIsHovered: (value) => set({ isHovered: value }),
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      closeMobileSidebar: () => set({ isMobileOpen: false }),
    }),
    {
      name: 'cermont-ui',
      partialize: (state) => ({
        theme: state.theme,
        isExpanded: state.isExpanded,
      }),
    }
  )
);

// Hook to initialize theme on client side
export function useInitializeTheme() {
  const { theme, setTheme } = useUIStore();

  if (typeof window !== 'undefined') {
    // Apply saved theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return { theme, setTheme };
}
