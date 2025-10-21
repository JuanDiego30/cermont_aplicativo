"use client";

import Link from "next/link";
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import { useAuth } from "@/lib/auth";
import {
  BarChart3,
  BriefcaseBusiness,
  LineChart,
  PiggyBank,
  TrendingUp,
  Users2,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

const kpiCards = [
  {
    label: "Ingresos del mes",
    value: "$0",
    hint: "↗︎ 0% vs mes anterior",
    gradient: { from: "cerBlue.5", to: "cerBlue.7", deg: 135 },
    icon: PiggyBank,
  },
  {
    label: "Órdenes completadas",
    value: "0",
    hint: "↗︎ 0% vs mes anterior",
    gradient: { from: "cerGreen.4", to: "cerGreen.6", deg: 135 },
    icon: TrendingUp,
  },
  {
    label: "Clientes activos",
    value: "0",
    hint: "Total registrados",
    gradient: { from: "grape.4", to: "grape.6", deg: 135 },
    icon: Users2,
  },
  {
    label: "Tiempo promedio",
    value: "0 h",
    hint: "Resolución de órdenes",
    gradient: { from: "orange.4", to: "orange.6", deg: 135 },
    icon: BriefcaseBusiness,
  },
];

const performanceTiles = [
  {
    label: "Pendientes",
    value: "0",
    badgeColor: "yellow",
  },
  {
    label: "En progreso",
    value: "0",
    badgeColor: "cerBlue",
  },
  {
    label: "Completadas",
    value: "0",
    badgeColor: "cerGreen",
  },
  {
    label: "Canceladas",
    value: "0",
    badgeColor: "red",
  },
];

const quickAccess = [
  {
    label: "Reportes ejecutivos",
    href: ROUTES.ROLES.GERENTE.REPORTS,
    color: "cerBlue",
    icon: BarChart3,
  },
  {
    label: "KPIs y tendencias",
    href: ROUTES.ROLES.GERENTE.KPIS,
    color: "cerGreen",
    icon: TrendingUp,
  },
  {
    label: "Clientes clave",
    href: ROUTES.ROLES.GERENTE.CLIENTS,
    color: "grape",
    icon: Users2,
  },
  {
    label: "Equipo & talento",
    href: ROUTES.ROLES.GERENTE.TEAM,
    color: "orange",
    icon: BriefcaseBusiness,
  },
];

export default function GerenteDashboard() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} fw={700}>
            Dashboard Ejecutivo
          </Title>
          <Text c="dimmed" fz="sm">
            {user?.nombre ? `Hola, ${user.nombre}. ` : null}
            Visualiza la salud financiera y operativa de Cermont en un vistazo.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {kpiCards.map(({ label, value, hint, gradient, icon: Icon }) => (
            <Card key={label} padding="lg" radius="lg" shadow="lg">
              <Stack gap="sm">
                <ThemeIcon size={48} radius="lg" variant="gradient" gradient={gradient}>
                  <Icon size={rem(22)} />
                </ThemeIcon>
                <Text fz="sm" tt="uppercase" fw={600} c="dimmed">
                  {label}
                </Text>
                <Text fz={34} fw={700} lh={1}>
                  {value}
                </Text>
                <Text fz="sm" c="dimmed">
                  {hint}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Card withBorder padding="lg" radius="lg" shadow="sm">
            <Stack gap="lg">
              <Text fz="lg" fw={600}>
                Estado de órdenes
              </Text>
              <Stack gap="md">
                {performanceTiles.map(({ label, value, badgeColor }) => (
                  <Group key={label} justify="space-between">
                    <Text c="dimmed">{label}</Text>
                    <Badge color={badgeColor} variant="light">
                      {value}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="lg" shadow="sm">
            <Stack gap="lg">
              <Text fz="lg" fw={600}>
                Desempeño del equipo
              </Text>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text c="dimmed">Técnicos activos</Text>
                  <Badge variant="light" color="cerBlue">
                    0
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Tasa de finalización</Text>
                  <Badge variant="light" color="cerGreen">
                    0%
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Promedio por técnico</Text>
                  <Badge variant="light" color="grape">
                    0
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Satisfacción cliente</Text>
                  <Badge variant="light" color="cerBlue">
                    0%
                  </Badge>
                </Group>
              </Stack>
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="lg" shadow="sm">
            <Stack gap="lg">
              <Text fz="lg" fw={600}>
                Tipos de servicio
              </Text>
              <Stack gap="md">
                {["Mantenimiento", "Reparación", "Instalación", "Inspección"].map((label) => (
                  <Group key={label} justify="space-between">
                    <Text c="dimmed">{label}</Text>
                    <Badge variant="light" color="gray">
                      0
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </SimpleGrid>

        <Card withBorder padding="lg" radius="lg" shadow="md">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fz="lg" fw={600}>
                  Acceso rápido
                </Text>
                <Text fz="sm" c="dimmed">
                  Enlaces clave para decisiones estratégicas.
                </Text>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
              {quickAccess.map(({ label, href, color, icon: Icon }) => (
                <Card
                  key={label}
                  component={Link}
                  href={href}
                  withBorder
                  radius="lg"
                  shadow="sm"
                  padding="lg"
                  style={{ transition: "transform 150ms ease, box-shadow 150ms ease" }}
                >
                  <Stack gap="md" align="center">
                    <ThemeIcon variant="light" color={color} radius="lg" size={46}>
                      <Icon size={rem(22)} />
                    </ThemeIcon>
                    <Text fw={600} ta="center">
                      {label}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="lg" shadow="md">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Group gap="sm" align="center">
                <ThemeIcon variant="light" color="cerBlue" radius="md">
                  <LineChart size={rem(20)} />
                </ThemeIcon>
                <Text fz="lg" fw={600}>
                  Tendencia de órdenes (30 días)
                </Text>
              </Group>
              <Badge variant="light" color="cerGreen">
                Próximamente
              </Badge>
            </Group>
            <Card radius="lg" padding="xl" withBorder style={{ background: "var(--mantine-color-gray-0)" }}>
              <Text c="dimmed" ta="center">
                Integraremos visualizaciones interactivas con Mantine Charts y datos reales muy pronto.
              </Text>
            </Card>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
