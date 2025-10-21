"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ClipboardList, Plus, ShieldCheck } from "lucide-react";
import OrdersList from "@/components/orders/OrdersList";
import PageContainer from "@/components/layout/PageContainer";
import { ROUTES } from "@/lib/constants";

type AnimeInstance = { pause?: () => void } | void;
type AnimeFactory = (params: Record<string, unknown>) => AnimeInstance;

export default function PaginaOrdenes() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const animateHero = async () => {
      try {
        const animeModule = await import("animejs");
        const anime = (
          (animeModule as unknown as { default?: AnimeFactory }).default ??
          (animeModule as unknown as AnimeFactory)
        ) as AnimeFactory;
        if (heroRef.current) {
          anime({
            targets: heroRef.current,
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 680,
            easing: "easeOutQuart",
          });
        }
        if (overlayRef.current) {
          anime({
            targets: overlayRef.current,
            opacity: [0.1, 0.35],
            translateY: [18, 0],
            duration: 820,
            easing: "easeOutExpo",
          });
        }
      } catch (error) {
        console.error("No se pudo animar el encabezado de órdenes:", error);
      }
    };

    void animateHero();
  }, []);

  return (
    <PageContainer>
      <Stack gap="xl">
        <Card
          ref={heroRef}
          padding="xl"
          radius="xl"
          shadow="lg"
          withBorder
          style={{
            position: "relative",
            overflow: "hidden",
            background: "radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.22), transparent 45%), linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.88))",
            borderColor: "rgba(148, 163, 184, 0.2)",
          }}
        >
          <Box
            ref={overlayRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: "-40%",
              background: "conic-gradient(from 180deg at 65% 45%, rgba(59, 130, 246, 0.18), rgba(14, 165, 233, 0.04), rgba(20, 184, 166, 0.16))",
              filter: "blur(58px)",
              opacity: 0.25,
              pointerEvents: "none",
            }}
          />

          <Stack gap="xl" style={{ position: "relative", zIndex: 1 }}>
            <Group align="flex-start" justify="space-between" wrap="wrap" gap="xl">
              <Stack gap="md" maw={560}>
                <Title order={1} fw={800} c="var(--mantine-color-white)">
                  Centro de órdenes 2.0
                </Title>
                <Text fw={600} fz="lg" c="rgba(241, 245, 249, 0.92)">
                  Órdenes de trabajo
                </Text>
                <Text fz="lg" c="rgba(241, 245, 249, 0.85)">
                  Consolida tus solicitudes, verifica el estado de cada servicio y gestiona la prioridad sin
                  salir de la plataforma. Sincronizamos en tiempo real con coordinadores y técnicos.
                </Text>
                <Group gap="sm" wrap="wrap">
                  <Button
                    component={Link}
                    href={ROUTES.WORK_ORDERS_NEW}
                    radius="xl"
                    size="md"
                    variant="gradient"
                    gradient={{ from: "cerBlue.4", to: "cerBlue.6", deg: 120 }}
                    leftSection={<Plus size={18} />}
                    styles={{
                      root: {
                        boxShadow: "0 18px 32px rgba(59, 130, 246, 0.28)",
                      },
                    }}
                  >
                    Crear nueva orden
                  </Button>
                  <Button
                    component={Link}
                    href={ROUTES.WORK_PLAN}
                    radius="xl"
                    size="md"
                    variant="gradient"
                    gradient={{ from: "cerBlue.6", to: "grape.5", deg: 120 }}
                    leftSection={<ClipboardList size={18} />}
                    styles={{
                      root: {
                        boxShadow: "0 18px 32px rgba(126, 58, 242, 0.28)",
                      },
                    }}
                  >
                    Planeación de obra
                  </Button>
                </Group>
              </Stack>

              <Card
                radius="lg"
                padding="lg"
                shadow="sm"
                withBorder
                style={{
                  background: "linear-gradient(160deg, rgba(30, 41, 59, 0.9), rgba(15, 118, 110, 0.88))",
                  borderColor: "rgba(45, 212, 191, 0.32)",
                  minWidth: 240,
                }}
              >
                <Stack gap="md">
                  <Group gap="sm">
                    <ThemeIcon size={42} radius="xl" variant="light" color="teal">
                      <ShieldCheck size={22} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text fw={600} fz="sm" c="rgba(226, 232, 240, 0.82)">
                        Operación confiable
                      </Text>
                      <Text fz="xs" c="rgba(148, 163, 184, 0.82)">
                        Monitorizamos flujos y SLA en vivo.
                      </Text>
                    </Stack>
                  </Group>
                  <Divider color="rgba(148, 163, 184, 0.2)" />
                  <Group justify="space-between">
                    <Stack gap={2}>
                      <Text fz="xs" c="rgba(203, 213, 225, 0.7)">
                        Órdenes activas
                      </Text>
                      <Text fw={700} fz={34} c="var(--mantine-color-white)">
                        24
                      </Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text fz="xs" c="rgba(203, 213, 225, 0.7)">
                        SLA cumplido
                      </Text>
                      <Text fw={700} fz={32} c="var(--mantine-color-white)">
                        98%
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            </Group>
          </Stack>
        </Card>

        <OrdersList />
      </Stack>
    </PageContainer>
  );
}
