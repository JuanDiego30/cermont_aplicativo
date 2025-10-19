"use client";
import OrdersList from '@/components/orders/OrdersList';
import Link from 'next/link';

export default function PaginaOrdenes() {
  return (
    <main className="contenedor">
      <h1 className="titulo">Órdenes de trabajo</h1>
      <div style={{ margin: '1rem 0' }}>
        <Link href="/ordenes/nueva">Crear nueva orden</Link>
      </div>
  <OrdersList />
    </main>
  );
}
