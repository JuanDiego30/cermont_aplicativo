/**
 * ARCHIVO: Header.tsx
 * FUNCION: Cabecera principal del dashboard con búsqueda, notificaciones y perfil
 * IMPLEMENTACION: Barra de búsqueda con shortcut Ctrl+K, toggle de sidebar móvil,
 *                 dropdowns de notificaciones y usuario, toggle de tema
 * DEPENDENCIAS: React, lucide-react, ThemeToggleButton, NotificationDropdown, UserDropdown, uiStore
 * EXPORTS: Header (named export)
 */
'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import ThemeToggleButton from '@/components/common/ThemeToggleButton';
import NotificationDropdown from '@/components/header/NotificationDropdown';
import UserDropdown from '@/components/header/UserDropdown';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const { toggleMobileSidebar, isMobileOpen } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Left: Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Search - hidden on mobile, expandable */}
          <div className={`hidden sm:block relative ${searchFocused ? 'w-80' : 'w-64'} transition-all duration-200`}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar órdenes, técnicos..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <kbd className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Mobile search button */}
        <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <Search className="w-5 h-5" />
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
