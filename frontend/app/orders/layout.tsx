'use client';

import React, { useState, type ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

type OrdersLayoutProps = {
    children: ReactNode;
};

export default function OrdersLayout({ children }: OrdersLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
            <Navbar onToggleSidebar={toggleSidebar} />

            <div className="flex flex-1">
                <div className="hidden md:block">
                    <Sidebar variant="desktop" />
                </div>

                <Sidebar variant="mobile" isOpen={isSidebarOpen} onClose={closeSidebar} />

                <main className="flex-1 overflow-x-hidden">
                    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">{children}</div>
                </main>
            </div>
        </div>
    );
}
