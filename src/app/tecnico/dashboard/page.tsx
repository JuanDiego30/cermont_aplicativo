"use client";

import Link from "next/link";
import {
  Badge,
  Button,
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
import {
  AlarmClock,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  MapPinned,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

const summaryCards = [
  { label: "Pendientes", value: "0", color: "yellow", icon: AlarmClock },
  { label: "En progreso", value: "0", color: "cerBlue", icon: Wrench },
  { label: "Para hoy", value: "0", color: "cerGreen", icon: CalendarClock },
  { label: "Completadas", value: "0", color: "grape", icon: ClipboardCheck },
];

const quickActions = [
  {
    label: "Reportar trabajo",
    description: "Actualiza evidencias y marca los hitos",
    href: ROUTES.ROLES.TECNICO.REPORT,
    color: "cerBlue",
    icon: ClipboardList,
  },
  {
    label: "Ver calendario",
    description: "Consulta rutas y citas asignadas",
    href: ROUTES.ROLES.TECNICO.CALENDAR,
    color: "cerGreen",
    icon: CalendarClock,
  },
];

export default function TecnicoDashboard() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} fw={700}>
            {user?.nombre ? `Hola, ${user.nombre}` : "Panel del técnico"}
          </Title>
          <Text c="dimmed" fz="sm">
            Mantén tus órdenes al día, registra avances y revisa tu ruta de hoy.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {summaryCards.map(({ label, value, color, icon: Icon }) => (
            <Card key={label} withBorder radius="lg" shadow="sm" padding="lg">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text c="dimmed" fz="sm" tt="uppercase" fw={600}>
                    {label}
                  </Text>
                  <ThemeIcon variant="light" color={color} radius="md" size={42}>
                    <Icon size={rem(20)} />
                  </ThemeIcon>
                </Group>
                <Text fz={32} fw={700} lh={1}>
                  {value}
                </Text>
                <Badge variant="light" color={color} radius="sm">
                  Datos en tiempo real
                </Badge>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Card withBorder shadow="md" radius="lg" padding="lg">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fz="lg" fw={600}>
                  Acciones rápidas
                </Text>
                <Text c="dimmed" fz="sm">
                  Atajos para reportar tus avances sin complicaciones.
                </Text>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {quickActions.map(({ label, description, href, color, icon: Icon }) => (
                <Card
                  key={label}
                  component={Link}
                  href={href}
                  withBorder
                  shadow="sm"
                  radius="lg"
                  padding="lg"
                  style={{ transition: "transform 150ms ease, box-shadow 150ms ease" }}
                >
                  <Stack gap="md">
                    <ThemeIcon variant="light" color={color} radius="lg" size={44}>
                      <Icon size={rem(20)} />
                    </ThemeIcon>
                    <Stack gap={4}>
                      <Text fw={600}>{label}</Text>
                      <Text c="dimmed" fz="sm">
                        {description}
                      </Text>
                    </Stack>
                    <Group gap={4} c="primary" fz="sm">
                      <Text fw={600}>
                        Abrir módulo
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder shadow="md" radius="lg" padding="xl">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm" align="center">
                <ThemeIcon variant="light" color="cerBlue" radius="md" size={44}>
                  <MapPinned size={rem(20)} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fz="lg" fw={600}>
                    Agenda de hoy
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Tus próximas visitas aparecerán aquí en cuanto el coordinador confirme la ruta.
                  </Text>
                </Stack>
              </Group>
              <Button
                component={Link}
                href={ROUTES.ROLES.TECNICO.ASSIGNED_ORDERS}
                variant="light"
                color="cerBlue"
                radius="xl"
              >
                Ver órdenes asignadas
              </Button>
            </Group>
            <Card radius="lg" withBorder padding="xl" style={{ background: "var(--mantine-color-gray-0)" }}>
              <Stack gap="sm" align="center">
                <ClipboardList size={rem(32)} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed" ta="center" fz="sm">
                  No tienes servicios programados para hoy. Revisa nuevamente más tarde o sincroniza tu agenda.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
