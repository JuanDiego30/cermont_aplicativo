"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import AnimatedLogo from "@/components/AnimatedLogo";
import PageContainer from "@/components/layout/PageContainer";
import { ROUTES } from "@/lib/constants";
import {
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Users2,
  Workflow,
} from "lucide-react";

const highlights = [
  {
    label: "Órdenes inteligentes",
    description: "Crea, asigna y da seguimiento con flujos visuales en tiempo real.",
    icon: Workflow,
    color: "cerBlue",
  },
  {
    label: "Evidencias centralizadas",
    description: "Captura multimedia y reportes con trazabilidad completa.",
    icon: ClipboardList,
    color: "cerGreen",
  },
  {
    label: "Insights ejecutivos",
    description: "Paneles listos para la dirección con métricas clave.",
    icon: BarChart3,
    color: "grape",
  },
];

export default function PaginaInicio() {
  const decorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let mounted = true;

    const setup = async () => {
      const nodes = decorRef.current?.querySelectorAll<HTMLElement>("[data-spot]");
      if (!nodes || nodes.length === 0) {
        return;
      }

      const { animate, stagger, random } = await import("animejs");
      if (!mounted) {
        return;
      }

      const animation = animate(nodes, {
        translateY: () => random(-20, 20),
        translateX: () => random(-16, 16),
        scale: () => random(90, 110) / 100,
        opacity: () => random(45, 80) / 100,
        easing: "easeInOutSine",
        direction: "alternate",
        duration: 4800,
        delay: stagger(240),
        loop: true,
      });

      dispose = () => {
        if (typeof animation.pause === "function") {
          animation.pause();
        }
      };
    };

    void setup();

    return () => {
      mounted = false;
      dispose?.();
    };
  }, []);

  return (
    <div className="landing-hero">
      <div className="landing-decor" ref={decorRef} aria-hidden>
        <span className="landing-spot" data-spot />
        <span className="landing-spot" data-spot />
        <span className="landing-spot" data-spot />
      </div>
      <PageContainer>
        <Stack gap="xl" align="center">
          <Stack gap="sm" align="center">
            <AnimatedLogo size={120} priority={false} />
            <Badge color="cerGreen" variant="light" radius="lg" size="lg">
              Plataforma integral de mantenimiento inteligente
            </Badge>
            <Title order={1} ta="center" fw={800} size={42} className="landing-title">
              Gestiona operaciones críticas con la precisión de Cermont
            </Title>
            <Text ta="center" c="dimmed" maw={620}>
              Unifica órdenes, equipos y talento en un solo lugar. Automatiza flujos, analiza el desempeño
              y comparte evidencias desde cualquier dispositivo.
            </Text>
          </Stack>

          <Group justify="center" gap="md" wrap="wrap">
            <Button
              component={Link}
              href={ROUTES.LOGIN}
              size="lg"
              radius="xl"
              leftSection={<ShieldCheck size={rem(18)} />}
            >
              Ingresar a la plataforma
            </Button>
            <Button
              component={Link}
              href={ROUTES.REGISTER}
              size="lg"
              radius="xl"
              variant="outline"
              color="cerGreen"
              leftSection={<Users2 size={rem(18)} />}
            >
              Crear cuenta para mi equipo
            </Button>
          </Group>

          <Card withBorder radius="xl" className="landing-info">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {highlights.map(({ label, description, icon: Icon, color }) => (
                <Stack key={label} gap="sm" align="center" ta="center">
                  <ThemeIcon size={52} radius="xl" variant="light" color={color}>
                    <Icon size={rem(22)} />
                  </ThemeIcon>
                  <Text fw={600}>{label}</Text>
                  <Text c="dimmed" fz="sm">
                    {description}
                  </Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Card>
        </Stack>
      </PageContainer>
    </div>
  );
}
