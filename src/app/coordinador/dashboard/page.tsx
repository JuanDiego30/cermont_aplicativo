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
import { ROUTES } from "@/lib/constants";
import {
  CalendarClock,
  ClipboardList,
  Route,
  UserCheck2,
  Users,
  Wrench,
} from "lucide-react";

const summaryCards = [
  { label: "Órdenes totales", value: "0", color: "cerBlue", icon: ClipboardList },
  { label: "Sin asignar", value: "0", color: "red", icon: Route },
  { label: "En progreso", value: "0", color: "cerBlue", icon: CalendarClock },
  { label: "Completadas", value: "0", color: "cerGreen", icon: UserCheck2 },
  { label: "Técnicos activos", value: "0", color: "grape", icon: Users },
];

const quickLinks = [
  {
    label: "Asignar técnicos",
    description: "Distribuye órdenes y balancea la carga",
    href: ROUTES.ROLES.COORDINADOR.ASSIGN,
    color: "cerBlue",
    icon: Wrench,
  },
  {
    label: "Ver todas las órdenes",
    description: "Control y filtros avanzados",
    href: ROUTES.ROLES.COORDINADOR.ORDERS,
    color: "cerGreen",
    icon: ClipboardList,
  },
  {
    label: "Calendario general",
    description: "Agenda y disponibilidad",
    href: ROUTES.ROLES.COORDINADOR.CALENDAR,
    color: "grape",
    icon: CalendarClock,
  },
];

export default function CoordinadorDashboard() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} fw={700}>
            Panel de Coordinación
          </Title>
          <Text c="dimmed" fz="sm">
            {user?.nombre ? `Hola, ${user.nombre}. ` : null}
            Supervisa el ciclo de órdenes y mantiene al equipo técnico alineado.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg">
          {summaryCards.map(({ label, value, color, icon: Icon }) => (
            <Card key={label} withBorder shadow="sm" radius="lg" padding="lg">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text c="dimmed" fz="sm" tt="uppercase" fw={600}>
                    {label}
                  </Text>
                  <ThemeIcon variant="light" color={color} radius="md" size={40}>
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
                  Tareas clave para mantener el flujo operativo.
                </Text>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {quickLinks.map(({ label, description, href, color, icon: Icon }) => (
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
                    <ThemeIcon variant="light" color={color} radius="lg" size={42}>
                      <Icon size={rem(20)} />
                    </ThemeIcon>
                    <Stack gap={4}>
                      <Text fw={600}>{label}</Text>
                      <Text c="dimmed" fz="sm">
                        {description}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder shadow="md" radius="lg" padding="lg">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Text fz="lg" fw={600}>
                Órdenes sin asignar
              </Text>
              <Badge color="red" variant="light">
                Requieren atención
              </Badge>
            </Group>
            <Stack gap="sm" align="center" py="xl">
              <Route size={rem(36)} color="var(--mantine-color-gray-5)" />
              <Text c="dimmed" fz="sm" ta="center">
                No hay órdenes pendientes de asignación. ¡Todo en orden!
              </Text>
            </Stack>
          </Stack>
        </Card>

        <Card withBorder shadow="md" radius="lg" padding="lg">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Text fz="lg" fw={600}>
                Técnicos disponibles
              </Text>
              <Badge color="cerBlue" variant="light">
                Datos monitoreados
              </Badge>
            </Group>
            <Stack gap="sm" align="center" py="xl">
              <Users size={rem(36)} color="var(--mantine-color-gray-5)" />
              <Text c="dimmed" fz="sm" ta="center">
                Cargando información del equipo...
              </Text>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
