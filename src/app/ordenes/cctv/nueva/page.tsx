// app/ordenes/cctv/nueva/page.tsx
import { CctvForm } from '@/components/forms';

export const metadata = { title: 'Nueva OT · Mantenimiento CCTV' };

export default function NuevaOrdenCctv() {
  return (
    <main className="container" style={{ padding: '24px 0' }}>
      <h1 style={{ marginBottom: 8 }}>Informe Mantenimiento Preventivo CCTV</h1>
      <p style={{ marginBottom: 18, color: 'var(--muted)' }}>
        Diligencia la información según el formato corporativo.
      </p>
      <CctvForm />
    </main>
  );
}
