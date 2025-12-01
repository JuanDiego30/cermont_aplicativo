'use client';

/**
 * Page: Equipment
 * Página principal de gestión de equipos certificados
 * 
 * @file frontend/src/app/(admin)/equipment/page.tsx
 */

import { useState } from 'react';
import { EquipmentList, CertificationAlerts } from '@/features/equipment';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

export default function EquipmentPage() {
  const [, setSelectedId] = useState<string | null>(null);

  const handleView = (id: string) => {
    setSelectedId(id);
    // TODO: Navigate to detail page or open modal
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    // TODO: Navigate to edit page or open modal
  };

  const handleAdd = () => {
    // TODO: Navigate to create page or open modal
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Equipos Certificados" />

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Content */}
        <div className="xl:col-span-2">
          <EquipmentList
            onView={handleView}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CertificationAlerts maxItems={5} />
        </div>
      </div>
    </div>
  );
}
