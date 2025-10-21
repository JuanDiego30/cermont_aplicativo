import PageContainer from "@/components/layout/PageContainer";
import { Title, Text, Stack } from "@mantine/core";

export default function PaginaReportes() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <Title order={1}>Reportes</Title>
        <Text>Generación y exportación de reportes (pendiente de implementar).</Text>
      </Stack>
    </PageContainer>
  );
}
