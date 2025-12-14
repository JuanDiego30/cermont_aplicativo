/**
 * ARCHIVO: AppHeader.tsx
 * FUNCION: Header principal con búsqueda, notificaciones, toggle tema y menú usuario
 * IMPLEMENTACION: Barra fija con dropdowns, integración con SidebarContext para toggles
 * DEPENDENCIAS: React, SidebarContext, lucide-react
 * EXPORTS: AppHeader (default)
 */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { Menu, Bell, Sun, Moon, Search, Settings, LogOut, User, ChevronDown } from "lucide-react";

const AppHeader: React.FC = () => {
    const { toggleMobileSidebar, toggleSidebar } = useSidebar();
    const [darkMode, setDarkMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex grow items-center justify-between px-4 py-3 md:px-6">
                {/* Left Section: Hamburger & Toggle */}
                <div className="flex items-center gap-4">
                    {/* Mobile Hamburger */}
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMobileSidebar();
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Desktop Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="h-10 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            {/* Notification Badge */}
                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                            </span>
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notificaciones</h3>
                                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">3 nuevas</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-50 text-success-500 dark:bg-success-500/15">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Nueva orden asignada</p>
                                            <span className="text-xs text-gray-400">Hace 5 min</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-500/15">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Orden #1234 pendiente</p>
                                            <span className="text-xs text-gray-400">Hace 1 hora</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-3 w-full rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                    Ver todas
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-linear-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">A</span>
                            </div>
                            <div className="hidden lg:block text-left">
                                <span className="block text-sm font-medium text-gray-800 dark:text-white">
                                    Administrador
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Cermont SAS</span>
                            </div>
                            <ChevronDown className={`hidden lg:block h-4 w-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* User Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">Administrador</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">admin@cermont.co</p>
                                </div>
                                <div className="py-1">
                                    <a href="/dashboard/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <User className="h-4 w-4" />
                                        Mi Perfil
                                    </a>
                                    <a href="/dashboard/config" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                        <Settings className="h-4 w-4" />
                                        Configuración
                                    </a>
                                </div>
                                <div className="border-t border-gray-100 py-1 dark:border-gray-800">
                                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10">
                                        <LogOut className="h-4 w-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="absolute top-full left-0 right-0 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:hidden">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Search className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default AppHeader;
