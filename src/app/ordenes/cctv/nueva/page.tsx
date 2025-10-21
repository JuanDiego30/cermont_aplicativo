// app/ordenes/cctv/nueva/page.tsx
import { CctvForm } from '@/components/forms';
import PageContainer from '@/components/layout/PageContainer';
import { Stack, Title, Text } from '@mantine/core';

export const metadata = { title: 'Nueva OT · Mantenimiento CCTV' };

export default function NuevaOrdenCctv() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Informe Mantenimiento Preventivo CCTV</Title>
          <Text c="dimmed">
            Diligencia la información según el formato corporativo.
          </Text>
        </Stack>
        <CctvForm />
      </Stack>
    </PageContainer>
  );
}
