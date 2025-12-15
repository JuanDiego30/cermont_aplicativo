'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuthStore();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                {/* Avatar */}
                <span className="overflow-hidden rounded-full h-9 w-9 sm:h-11 sm:w-11 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm sm:text-base">
                    {user?.avatar ? (
                        <Image
                            width={44}
                            height={44}
                            src={user.avatar}
                            alt={user.name || 'Usuario'}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        getInitials(user?.name || 'Usuario')
                    )}
                </span>

                {/* Name - hidden on mobile */}
                <span className="hidden sm:block font-medium text-sm max-w-30 truncate">
                    {user?.name || 'Usuario'}
                </span>

                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user?.name || 'Usuario'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || 'usuario@cermont.com'}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <ul className="py-2">
                        <li>
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Mi Perfil
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/config"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Configuración
                            </Link>
                        </li>
                    </ul>

                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
