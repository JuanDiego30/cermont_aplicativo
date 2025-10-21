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
import { useAuth } from "@/lib/auth";
import {
  ClipboardList,
  HeartHandshake,
  Home,
  Laptop,
  Layers3,
  PlusCircle,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

const snapshotCards = [
  { label: "Órdenes activas", value: "0", color: "cerBlue", icon: ClipboardList },
  { label: "Equipos registrados", value: "0", color: "cerGreen", icon: Laptop },
  { label: "Servicios completados", value: "0", color: "grape", icon: Layers3 },
];

const actions = [
  {
    label: "Solicitar servicio",
    description: "Crea una nueva orden personalizada",
    href: ROUTES.ROLES.CLIENTE.REQUEST_SERVICE,
    color: "cerBlue",
    icon: PlusCircle,
  },
  {
    label: "Gestionar equipos",
    description: "Actualiza fichas técnicas y agrega activos",
    href: ROUTES.ROLES.CLIENTE.EQUIPMENT,
    color: "cerGreen",
    icon: Laptop,
  },
];

export default function ClienteDashboard() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} fw={700}>
            {user?.nombre ? `Hola, ${user.nombre}` : "Portal del cliente"}
          </Title>
          <Text c="dimmed" fz="sm">
            Monitorea tus servicios, administra tus equipos y mantén comunicación directa con el equipo Cermont.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {snapshotCards.map(({ label, value, color, icon: Icon }) => (
            <Card key={label} withBorder shadow="sm" radius="lg" padding="lg">
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
                  Datos en sincronización
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
                  Gestiona tus servicios en un par de clics.
                </Text>
              </Stack>
              <Badge color="cerBlue" variant="light" radius="md">
                Recomendada
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {actions.map(({ label, description, href, color, icon: Icon }) => (
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
                    <Group gap={6} align="center">
                      <Text fw={600} fz="sm" c="var(--mantine-color-primary-5)">
                        Continuar
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
                  <Home size={rem(20)} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fz="lg" fw={600}>
                    Órdenes recientes
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Tus últimas solicitudes aparecerán aquí con actualizaciones en tiempo real.
                  </Text>
                </Stack>
              </Group>
              <Button
                component={Link}
                href={ROUTES.ROLES.CLIENTE.REQUEST_SERVICE}
                radius="xl"
                variant="light"
                color="cerGreen"
                leftSection={<PlusCircle size={rem(18)} />}
              >
                Solicitar servicio
              </Button>
            </Group>
            <Card radius="lg" withBorder padding="xl" style={{ background: "var(--mantine-color-gray-0)" }}>
              <Stack gap="sm" align="center">
                <HeartHandshake size={rem(32)} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed" ta="center" fz="sm">
                  Aún no registramos órdenes activas. Cuando envíes tu primer servicio, podrás seguir cada etapa desde aquí.
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
