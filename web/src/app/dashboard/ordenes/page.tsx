// 📁 web/src/app/dashboard/ordenes/page.tsx

'use client';

import { OrdenesTable } from './_components/ordenes-table';
import { CreateOrdenDialog } from './_components/create-orden-dialog';
import { Button } from '@/components/ui/Button';

export default function OrdenesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-gray-600">Gestiona todas las órdenes de tu empresa</p>
        </div>
        <CreateOrdenDialog />
      </div>

      <OrdenesTable />
    </div>
  );
}
