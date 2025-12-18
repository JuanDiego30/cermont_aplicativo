/**
 * ARCHIVO: offline/page.tsx
 * FUNCION: Página offline para PWA (Server Component wrapper)
 */
import { Metadata } from 'next';
import OfflineClient from './client';

export const metadata: Metadata = {
  title: 'Sin conexión',
  description: 'No hay conexión a internet',
};

export default function OfflinePage() {
  return <OfflineClient />;
}
