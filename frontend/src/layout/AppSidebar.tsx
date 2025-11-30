"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/core/providers";
import { usePermissions } from "@/features/auth";
import { PERMISSIONS } from "@/shared/constants";
import { CermontLogo } from "@/components/common";
import {
  GridIcon,
  HorizontaLDots,
  ListIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@/icons/index";
import {
  OrdersIcon,
  KitsIcon,
  ChecklistIcon,
  BillingIcon,
  UsersIcon,
  SettingsIcon,
  PlusCircleIcon,
  ReportsIcon,
  WorkPlansIcon,
  EvidencesIcon,
  AIAssistantIcon,
  WeatherIcon,
  ArchiveIcon,
} from "@/icons/navigation";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  show?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; show?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { hasPermission, isClient } = usePermissions();

  // Business navigation items based on user permissions
  const navItems: NavItem[] = [
    // Dashboard - always show, redirect handled by middleware
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: isClient() ? "/client/dashboard" : "/dashboard",
      show: true,
    },
    // Client specific items
    {
      icon: <PlusCircleIcon />,
      name: "Nueva Cotización",
      path: "/client/quotes/new",
      show: isClient(),
    },
    {
      icon: <OrdersIcon />,
      name: "Mis Cotizaciones",
      path: "/client/quotes",
      show: isClient(),
    },
    // Staff / Admin items
    {
      icon: <OrdersIcon />,
      name: "Órdenes",
      path: "/orders",
      show: hasPermission(PERMISSIONS.ORDERS_VIEW) && !isClient(),
    },
    {
      icon: <KitsIcon />,
      name: "Kits",
      path: "/kits",
      show: hasPermission(PERMISSIONS.READ_KITS),
    },
    {
      icon: <ChecklistIcon />,
      name: "Checklists",
      path: "/checklists",
      show: hasPermission(PERMISSIONS.READ_CHECKLISTS),
    },
    {
      icon: <WorkPlansIcon />,
      name: "Planes de Trabajo",
      path: "/workplans",
      show: hasPermission(PERMISSIONS.ORDERS_VIEW) && !isClient(),
    },
    {
      icon: <EvidencesIcon />,
      name: "Evidencias",
      path: "/evidences",
      show: hasPermission(PERMISSIONS.ORDERS_VIEW) && !isClient(),
    },
    {
      icon: <BillingIcon />,
      name: "Facturación",
      path: "/billing",
      show: hasPermission(PERMISSIONS.VIEW_BILLING),
    },
    {
      icon: <ReportsIcon />,
      name: "Reportes",
      path: "/reports",
      show: hasPermission(PERMISSIONS.REPORTS_VIEW) || hasPermission(PERMISSIONS.ORDERS_VIEW),
    },
    {
      icon: <WeatherIcon />,
      name: "Clima",
      path: "/weather",
      show: true, // Available to all authenticated users
    },
    {
      icon: <AIAssistantIcon />,
      name: "Asistente IA",
      path: "/assistant",
      show: true, // Available to all authenticated users
    },
  ];

  const adminItems: NavItem[] = [
    {
      icon: <ArchiveIcon />,
      name: "Archivos",
      path: "/archives",
      show: hasPermission(PERMISSIONS.VIEW_ARCHIVES),
    },
    {
      icon: <UsersIcon />,
      name: "Usuarios",
      path: "/users",
      show: hasPermission(PERMISSIONS.USERS_VIEW),
    },
    {
      icon: <SettingsIcon />,
      name: "Configuración",
      path: "/settings",
      show: true, // Usually visible to all logged in
    },
    {
      icon: <UserCircleIcon />,
      name: "Perfil",
      path: "/profile",
      show: true,
    },
  ];

  // Filter items based on visibility
  const visibleNavItems = navItems.filter(item => item.show !== false);
  const visibleAdminItems = adminItems.filter(item => item.show !== false);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
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
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
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
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
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
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
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

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? visibleNavItems : visibleAdminItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, visibleNavItems, visibleAdminItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-center"}`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          <CermontLogo
            href="/"
            size="lg"
            variant="default"
            frame="circle"
            withShadow
          />
        ) : (
          <CermontLogo
            href="/"
            size="sm"
            variant="default"
            frame="circle"
            withShadow
          />
        )}
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
                  "Menú Principal"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(visibleNavItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administración"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(visibleAdminItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
