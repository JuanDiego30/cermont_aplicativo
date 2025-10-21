import PageContainer from "@/components/layout/PageContainer";
import { Title, Text, Stack } from "@mantine/core";

export default function PaginaUsuarios() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <Title order={1}>Usuarios</Title>
        <Text>Gestión de usuarios (pendiente de implementar).</Text>
      </Stack>
    </PageContainer>
  );
}
