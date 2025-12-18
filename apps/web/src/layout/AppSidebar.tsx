/**
 * ARCHIVO: AppSidebar.tsx
 * FUNCION: Sidebar principal de navegación con soporte responsive y submenús colapsables
 * IMPLEMENTACION: Componente con estado local para submenús, animaciones CSS y hover detection
 * DEPENDENCIAS: React, Next.js (Link, Image, usePathname), SidebarContext, lucide-react
 * EXPORTS: AppSidebar (default)
 */
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    UserCircle,
    Users,
    PieChart,
    Settings,
    MoreHorizontal,
    ChevronDown,
    Wrench,
    FileText,
    Map,
} from "lucide-react";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
    {
        icon: <LayoutDashboard size={20} />,
        name: "Dashboard",
        path: "/dashboard",
    },
    {
        icon: <ClipboardList size={20} />,
        name: "Órdenes",
        path: "/dashboard/ordenes",
    },
    {
        icon: <Package size={20} />,
        name: "Kits",
        path: "/dashboard/kits",
    },
    {
        icon: <UserCircle size={20} />,
        name: "Clientes",
        path: "/dashboard/clientes",
    },
    {
        icon: <Users size={20} />,
        name: "Técnicos",
        path: "/dashboard/tecnicos",
    },
    {
        icon: <Wrench size={20} />,
        name: "Mantenimientos",
        path: "/dashboard/mantenimientos",
    },
    {
        icon: <FileText size={20} />,
        name: "Formularios",
        path: "/dashboard/formularios",
    },
    {
        icon: <Map size={20} />,
        name: "Mapa GPS",
        path: "/dashboard/mapa",
    },
    {
        name: "Reportes",
        icon: <PieChart size={20} />,
        subItems: [
            { name: "Financieros", path: "/dashboard/reportes/financieros" },
            { name: "Operativos", path: "/dashboard/reportes/operativos" },
        ],
    },
    {
        name: "Configuración",
        icon: <Settings size={20} />,
        path: "/dashboard/config",
    },
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();
    const showFullLogo = isExpanded || isHovered || isMobileOpen;

    // Estados y refs - definidos antes de usarse
    const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isActive = useCallback((path: string) => path === pathname, [pathname]);

    const handleSubmenuToggle = (index: number) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (prevOpenSubmenu && prevOpenSubmenu.index === index) {
                return null;
            }
            return { index };
        });
    };

    // Sincronizar submenú abierto con la ruta actual
    useEffect(() => {
        let submenuMatched = false;
        navItems.forEach((nav, index) => {
            if (nav.subItems) {
                nav.subItems.forEach((subItem) => {
                    if (isActive(subItem.path)) {
                        setOpenSubmenu({ index });
                        submenuMatched = true;
                    }
                });
            }
        });
        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [pathname, isActive]);

    // Calcular altura del submenú para animación
    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `main-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const renderMenuItems = (navItems: NavItem[]) => (
        <ul className="flex flex-col gap-4">
            {navItems.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index)}
                            className={`menu-item group ${openSubmenu?.index === index
                                ? "menu-item-active"
                                : "menu-item-inactive"
                                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                                }`}
                        >
                            <span
                                className={`${openSubmenu?.index === index
                                    ? "menu-item-icon-active"
                                    : "menu-item-icon-inactive"
                                    }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className={`menu-item-text`}>{nav.name}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDown
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                                        }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                href={nav.path}
                                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                    }`}
                            >
                                <span
                                    className={`${isActive(nav.path)
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className={`menu-item-text`}>{nav.name}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[`main-${index}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.index === index
                                        ? `${subMenuHeight[`main-${index}`]}px`
                                        : "0px",
                            }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map((subItem) => (
                                    <li key={subItem.name}>
                                        <Link
                                            href={subItem.path}
                                            className={`menu-dropdown-item ${isActive(subItem.path)
                                                ? "menu-dropdown-item-active"
                                                : "menu-dropdown-item-inactive"
                                                }`}
                                        >
                                            {subItem.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
                    ? "w-72.5"
                    : isHovered
                        ? "w-72.5"
                        : "w-22.5"
                }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
            >
                <Link href="/dashboard" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Cermont"
                        width={150}
                        height={40}
                        className="object-contain transition-[width] duration-200"
                        priority
                        style={{
                            width: showFullLogo ? '150px' : '40px',
                            height: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Menu"
                                ) : (
                                    <MoreHorizontal size={20} />
                                )}
                            </h2>
                            {renderMenuItems(navItems)}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
