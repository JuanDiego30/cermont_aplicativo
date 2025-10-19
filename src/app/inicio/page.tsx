import Link from 'next/link';

export default function PaginaInicio() {
  return (
    <main className="contenedor">
      <h1 className="titulo">Bienvenido a Cermont</h1>
      <p>Gestión de órdenes de trabajo, evidencias y reportes.</p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/autenticacion/login">Ir a iniciar sesión</Link>
      </div>
    </main>
  );
}
