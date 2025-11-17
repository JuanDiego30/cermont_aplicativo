// components/layout/Navbar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Bell,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Settings,
  HelpCircle,
  CreditCard,
  LifeBuoy,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type NavbarProps = {
  onToggleSidebar?: () => void;
};

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-neutral-200 bg-white/95 backdrop-blur-md shadow-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo */}
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-primary-500 bg-white p-1 shadow-lg transition-all group-hover:shadow-xl dark:bg-neutral-900">
              <Image
                src="/logo-cermont.png"
                alt="CERMONT"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                CERMONT S.A.S
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Sistema ATG</div>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search - Desktop Only */}
          <button className="hidden h-10 items-center gap-2 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 transition-all hover:border-primary-500 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-500 lg:flex">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Buscar...</span>
            <kbd className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Badge */}
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-bold text-white shadow-lg">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 animate-slide-up overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                <div className="border-b-2 border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-50">
                    Notificaciones
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Tienes 3 notificaciones nuevas
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-b border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${notif.bgColor}`}>
                        <notif.icon className={`h-5 w-5 ${notif.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                          {notif.title}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {notif.description}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-neutral-200 p-3 dark:border-neutral-800">
                  <button className="w-full rounded-xl bg-neutral-100 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3 py-2 transition-all hover:border-primary-500 hover:bg-white hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-500"
            >
              {/* Avatar */}
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                    {getInitials(user?.name || 'Usuario')}
                  </div>
                )}
              </div>

              <span className="hidden text-sm font-semibold text-neutral-900 dark:text-neutral-50 sm:inline">
                {user?.name || 'Usuario'}
              </span>

              <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 animate-slide-up overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                {/* User Info */}
                <div className="border-b-2 border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User'}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                          {getInitials(user?.name || 'Usuario')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900 dark:text-neutral-50">
                        {user?.name || 'Usuario'}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user?.email || 'usuario@cermont.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <item.icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t-2 border-neutral-200 p-2 dark:border-neutral-800">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-error-600 transition-colors hover:bg-error-50 dark:hover:bg-error-950"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const menuItems = [
  { label: 'Mi Perfil', href: '/profile', icon: User },
  { label: 'Configuración', href: '/settings', icon: Settings },
  { label: 'Ayuda', href: '/help', icon: HelpCircle },
  { label: 'Facturación', href: '/billing', icon: CreditCard },
];

const notifications = [
  {
    title: 'Nueva orden asignada',
    description: 'OT-2025-156 requiere tu atención',
    time: 'Hace 5 min',
    icon: Bell,
    bgColor: 'bg-primary-50 dark:bg-primary-950',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    title: 'Orden completada',
    description: 'OT-2025-144 fue cerrada exitosamente',
    time: 'Hace 1 hora',
    icon: Bell,
    bgColor: 'bg-success-50 dark:bg-success-950',
    iconColor: 'text-success-600 dark:text-success-400',
  },
  {
    title: 'Recordatorio',
    description: '3 órdenes próximas a vencer',
    time: 'Hace 2 horas',
    icon: Bell,
    bgColor: 'bg-warning-50 dark:bg-warning-950',
    iconColor: 'text-warning-600 dark:text-warning-400',
  },
];





