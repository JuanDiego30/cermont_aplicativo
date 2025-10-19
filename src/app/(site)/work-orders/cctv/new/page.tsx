import { redirect } from 'next/navigation';

export const metadata = { title: 'Nueva OT · Mantenimiento CCTV' };

export default function NewCctvWorkOrderPage() {
  redirect('/ordenes/cctv/nueva');
}

