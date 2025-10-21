'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Stack,
  Menu,
  Avatar,
  ActionIcon,
  Text,
} from '@mantine/core';
import {
  IconHome2,
  IconClipboardList,
  IconUsersGroup,
  IconReportAnalytics,
  IconChevronDown,
  IconLogout,
  IconPlus,
  IconListCheck,
  IconCalendarEvent,
  IconChartBar,
  IconFileAnalytics,
  IconUserCog,
  IconUserPlus,
  IconDashboard,
} from '@tabler/icons-react';
import { ROUTES } from '@/lib/constants';
import AnimatedLogo from '@/components/AnimatedLogo';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/cn';
import classes from './NavbarMinimal.module.css';

const NAV_MENU_ITEMS = [
  {
    label: 'Inicio',
    href: ROUTES.LANDING,
    icon: IconHome2,
    menuItems: [
      { label: 'Dashboard Principal', href: ROUTES.LANDING, icon: IconDashboard },
    ],
  },
  {
    label: 'Órdenes',
    href: ROUTES.WORK_ORDERS,
    icon: IconClipboardList,
    menuItems: [
      { label: 'Centro de órdenes', href: ROUTES.WORK_ORDERS, icon: IconListCheck },
      { label: 'Crear nueva orden', href: ROUTES.WORK_ORDERS_NEW, icon: IconPlus },
      { label: 'Planeación de obra', href: ROUTES.WORK_PLAN, icon: IconCalendarEvent },
      { label: 'Órdenes CCTV', href: ROUTES.CCTV_LIST, icon: IconClipboardList },
    ],
  },
  {
    label: 'Usuarios',
    href: ROUTES.USERS,
    icon: IconUsersGroup,
    menuItems: [
      { label: 'Gestión de usuarios', href: ROUTES.USERS, icon: IconUserCog },
      { label: 'Agregar usuario', href: ROUTES.USERS, icon: IconUserPlus },
    ],
  },
  {
    label: 'Reportes',
    href: ROUTES.REPORTS,
    icon: IconReportAnalytics,
    menuItems: [
      { label: 'Centro de reportes', href: ROUTES.REPORTS, icon: IconChartBar },
      { label: 'Análisis avanzado', href: ROUTES.REPORTS, icon: IconFileAnalytics },
    ],
  },
];

interface NavbarMinimalProps {
  opened: boolean;
}

export function NavbarMinimal({ opened }: NavbarMinimalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName = useMemo(
    () => user?.nombre || user?.email || 'Usuario',
    [user?.email, user?.nombre]
  );

  const initials = useMemo(() => {
    const basis = displayName.trim();
    if (!basis) return 'U';
    const parts = basis.split(' ');
    const first = parts[0]?.[0] ?? 'U';
    const second = parts[1]?.[0] ?? '';
    return `${first}${second}`.toUpperCase();
  }, [displayName]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('No se pudo cerrar sesión', error);
    }
    router.push(ROUTES.LOGIN);
  }, [router, signOut]);

  return (
    <nav className={classes.navbar} data-opened={opened || undefined}>
      <div className={classes.inner}>
        <div className={classes.brand}>
          <AnimatedLogo size={56} enableEntrance={false} />
          <div className={classes.brandCopy}>
            <Text className={classes.brandTitle}>Cermont</Text>
            <Text className={classes.brandSubtitle}>Centro operativo</Text>
          </div>
        </div>

        <Stack gap="md" justify="center" className={classes.stack}>
          {NAV_MENU_ITEMS.map((navItem) => {
            const Icon = navItem.icon;
            const active = pathname ? pathname.startsWith(navItem.href) : false;

            return (
              <Menu
                key={navItem.href}
                shadow="md"
                withinPortal={false}
                position="right-start"
                offset={12}
                classNames={{ dropdown: classes.navDropdown, label: classes.navDropdownLabel }}
              >
                <Menu.Target>
                  <button
                    type="button"
                    className={cn(classes.navTrigger, active && classes.navTriggerActive)}
                    aria-label={navItem.label}
                  >
                    <Icon size="1.12rem" stroke={1.6} />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{navItem.label}</Menu.Label>
                  <Menu.Divider />
                  {navItem.menuItems.map((menuItem) => {
                    const MenuIcon = menuItem.icon;
                    return (
                      <Menu.Item
                        key={menuItem.href}
                        component={Link}
                        href={menuItem.href}
                        leftSection={<MenuIcon size="0.95rem" stroke={1.55} />}
                      >
                        {menuItem.label}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            );
          })}
        </Stack>

        <div className={classes.footer}>
          <ThemeToggle className={classes.themeToggle} variant="transparent" />
          <Menu shadow="lg" width={220} position="right-start" withArrow arrowOffset={16}>
            <Menu.Target>
              <ActionIcon
                radius="xl"
                size={48}
                variant="transparent"
                className={classes.avatarButton}
                aria-label="Abrir menú de usuario"
              >
                {user?.avatar_url ? (
                  <Avatar src={user.avatar_url} size={36} radius="xl" alt={displayName} />
                ) : (
                  <Avatar size={36} radius="xl" color="blue">
                    {initials}
                  </Avatar>
                )}
                <IconChevronDown size="1rem" stroke={1.4} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown className={classes.menuDropdown}>
              <Menu.Label>{displayName}</Menu.Label>
              {user?.email ? <Menu.Label className={classes.menuEmail}>{user.email}</Menu.Label> : null}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size="1rem" stroke={1.6} />}
                onClick={handleLogout}
                color="red"
              >
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
