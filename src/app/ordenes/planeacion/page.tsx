"use client";

import {
  Alert,
  List,
  rem,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { AlertCircle, ClipboardList, Wand2 } from "lucide-react";
import { CustomFormatBuilder, WorkPlanForm } from "@/components/forms";
import PageContainer from "@/components/layout/PageContainer";

const failureDrivers = [
  "Planeaciones sin lista detallada de herramientas generan reprocesos y desplazamientos adicionales.",
  "Olvidos de logística ocasionan demoras en la ejecución y retrasan la fecha de entrega del informe y actas.",
  "La ausencia de un registro centralizado dificulta conocer los costos reales frente a lo estimado.",
  "El trabajo simultáneo en varios frentes hace que las actas y la facturación lleguen tarde al cliente.",
];

export default function WorkPlanPage() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <Stack gap={12}>
          <Title order={1} fw={700}>
            Planeación integral de obra
          </Title>
          <Text c="dimmed" size="lg">
            Estandariza la planeación operativa, controla la logística de herramientas y asegura que los
            entregables administrativos (actas, informes y facturación) salgan a tiempo.
          </Text>
        </Stack>

        <Alert
          variant="light"
          color="yellow"
          radius="lg"
          icon={<AlertCircle size={18} />}
          title="Fallas recurrentes diagnosticadas"
        >
          <List spacing="xs" size="sm">
            {failureDrivers.map((driver) => (
              <List.Item key={driver}>{driver}</List.Item>
            ))}
          </List>
        </Alert>

        <Tabs defaultValue="planeacion" radius="xl" variant="pills" keepMounted={false}>
          <Tabs.List style={{ flexWrap: "wrap" }}>
            <Tabs.Tab
              value="planeacion"
              leftSection={<ClipboardList size={rem(16)} />}
            >
              Formato estándar
            </Tabs.Tab>
            <Tabs.Tab
              value="personalizado"
              leftSection={<Wand2 size={rem(16)} />}
            >
              Creador personalizado
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="planeacion" pt="xl">
            <WorkPlanForm />
          </Tabs.Panel>

          <Tabs.Panel value="personalizado" pt="xl">
            <CustomFormatBuilder />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </PageContainer>
  );
}
