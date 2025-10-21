"use client";
import OrderForm from '@/components/orders/OrderForm';
import PageContainer from '@/components/layout/PageContainer';
import { Stack, Title } from '@mantine/core';

export default function PaginaNuevaOrden() {
  return (
    <PageContainer>
      <Stack gap="xl">
        <Title order={1}>Registrar nueva orden</Title>
        <OrderForm />
      </Stack>
    </PageContainer>
  );
}
