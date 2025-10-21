"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionIcon,
  Avatar,
  Container,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBell,
  IconChevronDown,
  IconClipboardList,
  IconHome2,
  IconLogout,
  IconReportAnalytics,
  IconUsersGroup,
  IconPlus,
  IconListCheck,
  IconCalendarEvent,
  IconChartBar,
  IconFileAnalytics,
  IconUserCog,
  IconUserPlus,
  IconDashboard,
} from "@tabler/icons-react";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { NavbarMinimal } from "@/components/NavbarMinimal";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import classes from "./HeaderTabs.module.css";

const NAV_MENU_ITEMS = [
  {
    label: "Inicio",
    value: ROUTES.LANDING,
    icon: IconHome2,
    menuItems: [
      { label: "Dashboard Principal", href: ROUTES.LANDING, icon: IconDashboard },
    ],
  },
  {
    label: "Órdenes",
    value: ROUTES.WORK_ORDERS,
    icon: IconClipboardList,
    menuItems: [
      { label: "Centro de órdenes", href: ROUTES.WORK_ORDERS, icon: IconListCheck },
      { label: "Crear nueva orden", href: ROUTES.WORK_ORDERS_NEW, icon: IconPlus },
      { label: "Planeación de obra", href: ROUTES.WORK_PLAN, icon: IconCalendarEvent },
      { label: "Órdenes CCTV", href: ROUTES.CCTV_LIST, icon: IconClipboardList },
    ],
  },
  {
    label: "Usuarios",
    value: ROUTES.USERS,
    icon: IconUsersGroup,
    menuItems: [
      { label: "Gestión de usuarios", href: ROUTES.USERS, icon: IconUserCog },
      { label: "Agregar usuario", href: ROUTES.USERS, icon: IconUserPlus },
    ],
  },
  {
    label: "Reportes",
    value: ROUTES.REPORTS,
    icon: IconReportAnalytics,
    menuItems: [
      { label: "Centro de reportes", href: ROUTES.REPORTS, icon: IconChartBar },
      { label: "Análisis avanzado", href: ROUTES.REPORTS, icon: IconFileAnalytics },
    ],
  },
];

const HIDDEN_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];

function HeaderTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { user, signOut } = useAuth();

  const activeTab = useMemo(() => {
    if (!pathname) {
      return NAV_MENU_ITEMS[0].value;
    }
    const match = NAV_MENU_ITEMS.find((item) => pathname.startsWith(item.value));
    return match?.value ?? NAV_MENU_ITEMS[0].value;
  }, [pathname]);

  const displayName = useMemo(
    () => user?.nombre || user?.email || "Usuario",
    [user?.email, user?.nombre]
  );

  const initials = useMemo(() => {
    const basis = displayName.trim();
    if (!basis) return "U";
    const parts = basis.split(" ");
    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";
    return `${first}${second}`.toUpperCase();
  }, [displayName]);

  const shouldHide = useMemo(
    () => (pathname ? HIDDEN_ROUTES.some((route) => pathname.startsWith(route)) : false),
    [pathname]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
    router.push(ROUTES.LOGIN);
  }, [router, signOut]);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <div className={classes.headerRoot}>
          <Container size="responsive" className={classes.headerInner}>
            <div className={classes.metaRow}>
              <Link href={ROUTES.LANDING} className={classes.brandLink} aria-label="Ir al inicio">
                <AnimatedLogo size={52} enableEntrance={false} />
                <div className={classes.brandCopy}>
                  <Text className={classes.brandTitle}>Cermont</Text>
                  <Text className={classes.brandSubtitle}>Centro operativo</Text>
                </div>
              </Link>

              <div className={classes.actions}>
                <ActionIcon
                  variant="transparent"
                  radius="xl"
                  size={46}
                  aria-label="Notificaciones"
                  className={classes.iconButton}
                >
                  <IconBell size="1.05rem" stroke={1.6} />
                </ActionIcon>
                <ThemeToggle className={classes.themeToggle} variant="transparent" />
                <Menu
                  shadow="md"
                  width={220}
                  position="bottom-end"
                  classNames={{ dropdown: classes.menuDropdown, label: classes.menuLabel }}
                >
                  <Menu.Target>
                    <UnstyledButton className={classes.user} aria-label="Abrir menú de usuario">
                      {user?.avatar_url ? (
                        <Avatar src={user.avatar_url} size={34} radius="xl" alt={displayName} />
                      ) : (
                        <Avatar size={34} radius="xl" color="blue">
                          {initials}
                        </Avatar>
                      )}
                      <div className={classes.userDetails}>
                        <Text className={classes.userName}>{displayName}</Text>
                        {user?.rol ? (
                          <Text size="xs" c="dimmed" className={classes.userRole}>
                            {user.rol.toLowerCase()}
                          </Text>
                        ) : null}
                      </div>
                      <IconChevronDown size="1rem" stroke={1.4} />
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Navegación</Menu.Label>
                    <Menu.Item
                      component={Link}
                      href={ROUTES.WORK_ORDERS}
                      leftSection={<IconClipboardList size="1rem" stroke={1.6} />}
                    >
                      Mis órdenes
                    </Menu.Item>
                    <Menu.Item
                      component={Link}
                      href={ROUTES.USERS}
                      leftSection={<IconUsersGroup size="1rem" stroke={1.6} />}
                    >
                      Equipo
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconLogout size="1rem" stroke={1.6} />}
                      onClick={handleSignOut}
                      color="red"
                    >
                      Cerrar sesión
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>

            <div className={classes.tabsShell}>
              <div className={classes.navRow}>
                {NAV_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <Menu
                      key={item.value}
                      withinPortal={false}
                      position="bottom"
                      offset={8}
                      shadow="md"
                      classNames={{ dropdown: classes.navDropdown, label: classes.navDropdownLabel }}
                    >
                      <Menu.Target>
                        <button
                          type="button"
                          className={cn(classes.navTrigger, isActive && classes.navTriggerActive)}
                          aria-label={item.label}
                        >
                          <Icon size="1.05rem" stroke={1.65} />
                        </button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>{item.label}</Menu.Label>
                        <Menu.Divider />
                        {item.menuItems.map((menuItem) => {
                          const MenuIcon = menuItem.icon;
                          return (
                            <Menu.Item
                              key={menuItem.href}
                              component={Link}
                              href={menuItem.href}
                              leftSection={<MenuIcon size="0.95rem" stroke={1.6} />}
                            >
                              {menuItem.label}
                            </Menu.Item>
                          );
                        })}
                      </Menu.Dropdown>
                    </Menu>
                  );
                })}
              </div>
            </div>
          </Container>
        </div>
      )}

      <NavbarMinimal opened={!isMobile} />
    </>
  );
}

export default HeaderTabs;


