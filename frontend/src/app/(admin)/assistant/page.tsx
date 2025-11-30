import type { Metadata } from 'next';
import AssistantPageClient from './AssistantPageClient';

export const metadata: Metadata = {
  title: 'Asistente IA | CERMONT',
  description: 'Asistente virtual inteligente de CERMONT S.A.S. para consultas sobre órdenes, mantenimiento y operaciones',
};

export default function AssistantPage() {
  return <AssistantPageClient />;
}
