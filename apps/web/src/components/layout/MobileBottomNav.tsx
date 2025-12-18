"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    Plus,
    Package,
    User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MagnetButton } from "@/components/ui/MagnetButton";

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    isCenter?: boolean;
}

const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ClipboardList, label: "Órdenes", href: "/dashboard/ordenes" },
    { icon: Plus, label: "", href: "/dashboard/ordenes/nueva", isCenter: true },
    { icon: Package, label: "Kits", href: "/dashboard/kits" },
    { icon: User, label: "Perfil", href: "/dashboard/perfil" },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Background with blur */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800" />

            {/* Navigation Items */}
            <div className="relative flex items-end justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-4 flex items-center justify-center"
                            >
                                <MagnetButton
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30"
                                    strength={50}
                                    activeScale={0.85}
                                >
                                    <item.icon className="h-6 w-6" />
                                </MagnetButton>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-4 py-3 transition-colors",
                                isActive
                                    ? "text-brand-600 dark:text-brand-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                            <span className="text-xs font-medium">{item.label}</span>
                            {isActive && (
                                <div className="absolute bottom-0 h-0.5 w-8 rounded-full bg-brand-500" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav >
    );
}

export default MobileBottomNav;
