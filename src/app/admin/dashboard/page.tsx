"use client";

import Link from "next/link";
import {
  Badge,
  Card,
  Container,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import {
  Activity,
  AlertTriangle,
  Cog,
  Database,
  FileKey2,
  Settings2,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const overviewStats = [
  {
    label: "Total de usuarios",
    value: "0",
    indicator: "Última sincronización hace 5 min",
    icon: Users,
    gradient: { from: "cerBlue.5", to: "cerBlue.7" as const },
  },
  {
    label: "Usuarios activos",
    value: "0",
    indicator: "0% incremento semanal",
    icon: ShieldCheck,
    gradient: { from: "cerGreen.4", to: "cerGreen.6" as const },
  },
  {
    label: "Sesiones activas",
    value: "0",
    indicator: "Monitoreo en tiempo real",
    icon: Activity,
    gradient: { from: "grape.4", to: "grape.6" as const },
  },
  {
    label: "Uso de almacenamiento",
    value: "0 GB",
    indicator: "15% de la cuota utilizada",
    icon: Database,
    gradient: { from: "orange.4", to: "orange.6" as const },
  },
];

const roleDistribution = [
  { label: "Clientes", value: 0, percentage: 0, color: "cerBlue.5" },
  { label: "Técnicos", value: 0, percentage: 0, color: "cerGreen.5" },
  { label: "Coordinadores", value: 0, percentage: 0, color: "yellow.6" },
  { label: "Gerentes", value: 0, percentage: 0, color: "grape.5" },
  { label: "Administradores", value: 1, percentage: 100, color: "red.5" },
];

const adminShortcuts = [
  {
    label: "Gestionar usuarios",
    description: "Crear, editar y suspender accesos",
    href: "/admin/usuarios",
    icon: UsersRound,
    color: "cerBlue",
  },
  {
    label: "Roles y permisos",
    description: "Configura niveles de acceso",
    href: "/admin/roles",
    icon: FileKey2,
    color: "grape",
  },
  {
    label: "Configuración",
    description: "Parámetros generales del sistema",
    href: "/admin/sistema",
    icon: Settings2,
    color: "cerGreen",
  },
];

const systemHealth = [
  { label: "Base de datos", status: "Operativo", progress: 100, color: "cerGreen.5" },
  { label: "API", status: "Operativo", progress: 100, color: "cerGreen.5" },
  { label: "Almacenamiento", status: "Operativo", progress: 15, color: "cerBlue.5" },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} fw={700}>
            Panel de Administración
          </Title>
          <Text c="dimmed" fz="sm">
            {user?.nombre ? `Hola, ${user.nombre}. ` : null}
            Gestiona usuarios, roles y el estado general de la plataforma Cermont.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {overviewStats.map(({ label, value, indicator, icon: Icon, gradient }) => (
            <Card key={label} shadow="md" radius="lg" padding="lg" withBorder>
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text c="dimmed" fz="sm" tt="uppercase" fw={600}>
                    {label}
                  </Text>
                  <Text fz={34} fw={700} lh={1}>
                    {value}
                  </Text>
                  <Badge variant="light" color="cerBlue" radius="sm">
                    {indicator}
                  </Badge>
                </Stack>
                <ThemeIcon size={54} radius="xl" variant="gradient" gradient={gradient}>
                  <Icon size={rem(26)} />
                </ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Card shadow="md" radius="lg" padding="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fz="lg" fw={600}>
                  Usuarios por rol
                </Text>
                <ThemeIcon variant="light" color="cerBlue" radius="md">
                  <Users size={rem(18)} />
                </ThemeIcon>
              </Group>

              <Stack gap="lg">
                {roleDistribution.map(({ label, value, percentage, color }) => (
                  <Stack key={label} gap={6}>
                    <Group justify="space-between" align="center">
                      <Text fw={500}>{label}</Text>
                      <Badge color="gray" variant="light">
                        {value}
                      </Badge>
                    </Group>
                    <Progress value={percentage} size="md" radius="xl" color={color} />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card shadow="md" radius="lg" padding="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fz="lg" fw={600}>
                  Actividad reciente
                </Text>
                <ThemeIcon variant="light" color="cerGreen" radius="md">
                  <Cog size={rem(18)} />
                </ThemeIcon>
              </Group>
              <Stack gap="sm" align="center" py="xl">
                <AlertTriangle size={rem(32)} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed" fz="sm" ta="center">
                  Aún no se registran eventos recientes en la plataforma.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </SimpleGrid>

        <Card shadow="md" radius="lg" padding="lg" withBorder>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text fz="lg" fw={600}>
                  Acciones administrativas
                </Text>
                <Text c="dimmed" fz="sm">
                  Accesos directos para las tareas más frecuentes.
                </Text>
              </Stack>
              <ThemeIcon variant="light" color="cerBlue" radius="md">
                <Settings2 size={rem(18)} />
              </ThemeIcon>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {adminShortcuts.map(({ label, description, href, icon: Icon, color }) => (
                <Card
                  key={label}
                  component={Link}
                  href={href}
                  padding="lg"
                  radius="lg"
                  withBorder
                  shadow="sm"
                  style={{
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
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

        <Card shadow="md" radius="lg" padding="lg" withBorder>
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon variant="light" color="cerGreen" radius="md">
                  <ShieldCheck size={rem(18)} />
                </ThemeIcon>
                <Text fz="lg" fw={600}>
                  Salud del sistema
                </Text>
              </Group>
              <Badge color="cerGreen" variant="light">
                Operativo 24/7
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {systemHealth.map(({ label, status, progress, color }) => (
                <Card key={label} padding="lg" radius="lg" withBorder shadow="sm">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={600}>{label}</Text>
                      <Badge color="cerGreen" variant="light" size="sm">
                        {status}
                      </Badge>
                    </Group>
                    <Progress value={progress} color={color} radius="xl" size="lg" />
                    <Text c="dimmed" fz="xs">
                      {progress}% de capacidad utilizada
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
