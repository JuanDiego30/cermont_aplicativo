"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { AlertCircle, Filter, RefreshCw, Search, TableProperties } from "lucide-react";
import { ordersAPI, type OrdersFilters } from "@/lib/api/orders";
import type { EstadoOrden, OrdenTrabajo, PrioridadOrden } from "@/lib/types/database";
import { ROUTES } from "@/lib/constants";

type AnimeInstance = { pause?: () => void } | void;
type AnimeFactory = (params: Record<string, unknown>) => AnimeInstance;

interface OrdersListProps {
  initialFilters?: OrdersFilters;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const estadoBadgeColor: Record<string, string> = {
  pendiente: "yellow",
  asignada: "cerBlue",
  en_progreso: "grape",
  completada: "cerGreen",
  cancelada: "red",
  aprobada: "teal",
};

const prioridadBadgeColor: Record<string, string> = {
  baja: "gray",
  normal: "cerBlue",
  alta: "orange",
  urgente: "red",
};

const OrdersList = ({ initialFilters }: OrdersListProps) => {
  const [orders, setOrders] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrdersFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<EstadoOrden | "">("");
  const [selectedPrioridad, setSelectedPrioridad] = useState<PrioridadOrden | "">("");
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const estadoOptions = useMemo(
    () => [
      { label: "Todos", value: "" },
      { label: "Pendiente", value: "pendiente" },
      { label: "Asignada", value: "asignada" },
      { label: "En progreso", value: "en_progreso" },
      { label: "Completada", value: "completada" },
      { label: "Cancelada", value: "cancelada" },
      { label: "Aprobada", value: "aprobada" },
    ],
    []
  );

  const prioridadOptions = useMemo(
    () => [
      { label: "Todas", value: "" },
      { label: "Baja", value: "baja" },
      { label: "Normal", value: "normal" },
      { label: "Alta", value: "alta" },
      { label: "Urgente", value: "urgente" },
    ],
    []
  );

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await ordersAPI.list(filters);
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return;
    }

    if (response.data) {
      const result = response.data as { data?: OrdenTrabajo[]; pagination?: PaginationState };
      if (result?.data) {
        setOrders(result.data);
      }
      if (result?.pagination) {
        setPagination(result.pagination);
      }
    }

    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const animateFilters = async () => {
      try {
        const animeModule = await import("animejs");
        const anime = (
          (animeModule as unknown as { default?: AnimeFactory }).default ??
          (animeModule as unknown as AnimeFactory)
        ) as AnimeFactory;
        if (filtersRef.current) {
          anime({
            targets: filtersRef.current,
            opacity: [0, 1],
            translateY: [-16, 0],
            duration: 520,
            easing: "easeOutQuad",
          });
        }
      } catch (animationError) {
        console.error("No se pudo animar el panel de filtros:", animationError);
      }
    };

    void animateFilters();
  }, []);

  useEffect(() => {
    if (loading) return;

    const animateContent = async () => {
      try {
        const animeModule = await import("animejs");
        const anime = (
          (animeModule as unknown as { default?: AnimeFactory }).default ??
          (animeModule as unknown as AnimeFactory)
        ) as AnimeFactory;

        const target = orders.length > 0 ? tableRef.current : feedbackRef.current;
        if (target) {
          anime({
            targets: target,
            opacity: [0, 1],
            translateY: [12, 0],
            duration: 480,
            easing: "easeOutQuad",
          });
        }
      } catch (animationError) {
        console.error("No se pudo animar el contenido de órdenes:", animationError);
      }
    };

    void animateContent();
  }, [loading, orders.length]);

  const handleApplyFilters = () => {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: searchTerm || undefined,
      estado: selectedEstado || undefined,
      prioridad: selectedPrioridad || undefined,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("");
    setSelectedPrioridad("");
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((current) => ({ ...current, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (loading) {
    return (
      <Card
        radius="xl"
        padding="xl"
        shadow="lg"
        withBorder
        style={{
          background: "linear-gradient(135deg, rgba(226, 232, 240, 0.06), rgba(148, 163, 184, 0.08))",
          borderColor: "rgba(148, 163, 184, 0.14)",
        }}
      >
        <Stack align="center" gap="sm">
          <Loader color="cerBlue" size="md" />
          <Text c="dimmed">Cargando órdenes…</Text>
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        ref={feedbackRef}
        radius="xl"
        padding="xl"
        withBorder
        shadow="lg"
        style={{
          background: "linear-gradient(140deg, rgba(248, 113, 113, 0.18), rgba(248, 113, 113, 0.32))",
          borderColor: "rgba(248, 113, 113, 0.45)",
        }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" radius="xl" size={42}>
              <AlertCircle size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>Error al cargar órdenes</Text>
              <Text fz="sm" c="rgba(239, 68, 68, 0.88)">
                {error}
              </Text>
            </div>
          </Group>

          <Group justify="flex-end">
            <Button
              size="sm"
              color="red"
              radius="xl"
              leftSection={<RefreshCw size={16} />}
              onClick={() => loadOrders()}
            >
              Reintentar
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Card
        ref={filtersRef}
        withBorder
        shadow="lg"
        radius="xl"
        padding="xl"
        style={{
          position: "relative",
          overflow: "hidden",
          borderColor: "rgba(59, 130, 246, 0.24)",
          background: "linear-gradient(135deg, rgba(30, 64, 175, 0.12), rgba(14, 165, 233, 0.05))",
        }}
      >
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: "-30%",
            background: "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18), transparent 55%)",
            filter: "blur(64px)",
          }}
        />
        <Stack gap="xl" style={{ position: "relative", zIndex: 1 }}>
          <Group gap="sm" justify="space-between" align="flex-start" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon variant="light" color="cerBlue" radius="xl" size={42}>
                <Filter size={18} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={700}>Filtrar órdenes</Text>
                <Text fz="sm" c="dimmed">
                  Busca por palabras clave o perfila por estado y prioridad.
                </Text>
              </Stack>
            </Group>
            <Badge size="sm" variant="light" color="cerBlue">
              Búsqueda asistida
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
            <TextInput
              label="Buscar"
              placeholder="Número de orden o descripción"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              leftSection={<Search size={16} />}
              radius="lg"
              size="md"
              variant="filled"
            />
            <Select
              label="Estado"
              data={estadoOptions}
              value={selectedEstado}
              onChange={(value) => setSelectedEstado((value as EstadoOrden) ?? "")}
              leftSection={<TableProperties size={16} />}
              radius="lg"
              size="md"
              variant="filled"
            />
            <Select
              label="Prioridad"
              data={prioridadOptions}
              value={selectedPrioridad}
              onChange={(value) => setSelectedPrioridad((value as PrioridadOrden) ?? "")}
              leftSection={<TableProperties size={16} />}
              radius="lg"
              size="md"
              variant="filled"
            />
            <Stack gap="sm" justify="flex-end">
              <Button radius="lg" color="cerBlue" onClick={handleApplyFilters} fullWidth>
                Aplicar filtros
              </Button>
              <Button variant="subtle" radius="lg" color="gray" onClick={handleClearFilters} fullWidth>
                Limpiar
              </Button>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Card>

      {orders.length === 0 ? (
        <Card
          ref={feedbackRef}
          withBorder
          radius="xl"
          padding="xl"
          shadow="lg"
          style={{
            background: "linear-gradient(140deg, rgba(125, 211, 252, 0.18), rgba(14, 165, 233, 0.24))",
            borderColor: "rgba(56, 189, 248, 0.36)",
          }}
        >
          <Stack gap="md" align="center">
            <TableProperties size={rem(36)} color="rgba(14, 165, 233, 0.85)" />
            <Text c="rgba(30, 64, 175, 0.76)" ta="center">
              No encontramos órdenes con los criterios seleccionados.
            </Text>
            <Button
              variant="white"
              color="cerBlue"
              radius="xl"
              leftSection={<RefreshCw size={16} />}
              onClick={handleClearFilters}
            >
              Ver todas las órdenes
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack gap="lg">
          <Card
            ref={tableRef}
            withBorder
            shadow="lg"
            radius="xl"
            padding={0}
            style={{
              overflow: "hidden",
              borderColor: "rgba(148, 163, 184, 0.18)",
            }}
          >
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg" striped withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Número</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Descripción</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Prioridad</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map((order) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>
                        <Text fw={600}>{order.numero_orden}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{order.cliente?.nombre ?? "N/A"}</Text>
                      </Table.Td>
                      <Table.Td maw={280}>
                        <Text lineClamp={2}>{order.titulo || order.descripcion}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={estadoBadgeColor[order.estado] ?? "gray"} variant="light">
                          {formatLabel(order.estado)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={prioridadBadgeColor[order.prioridad] ?? "gray"} variant="light">
                          {formatLabel(order.prioridad)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text c="dimmed" fz="sm">
                          {formatDate(order.created_at)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          component={Link}
                          href={ROUTES.WORK_ORDER_DETAIL(order.id)}
                          variant="subtle"
                          size="xs"
                          color="cerBlue"
                        >
                          Ver detalle
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>

          {pagination.totalPages > 1 && (
              <Card withBorder radius="lg" padding="md" shadow="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Text fz="sm" c="dimmed">
                  Mostrando {Math.max((pagination.page - 1) * pagination.limit + 1, 1)} -
                  {" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} órdenes
                </Text>
                <Pagination
                  total={pagination.totalPages}
                  value={pagination.page}
                  onChange={handlePageChange}
                  color="cerBlue"
                  radius="lg"
                />
              </Group>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default OrdersList;
