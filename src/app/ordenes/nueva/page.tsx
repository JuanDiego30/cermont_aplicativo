"use client";
import OrderForm from '@/components/orders/OrderForm';

export default function PaginaNuevaOrden() {
  return (
    <main className="contenedor">
      <h1 className="titulo">Registrar nueva orden</h1>
      <div className="formulario">
  <OrderForm />
      </div>
    </main>
  );
}
