// app/orders/[id]/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/lib/hooks/useOrders';
import { useEvidences } from '@/lib/hooks/useEvidences';

// Components
import { EvidenceList } from '@/components/evidences/EvidenceList';
import { EvidenceUpload } from '@/components/evidences/EvidenceUpload';

// Universal Components
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { TabNavigation } from '@/components/patterns/TabNavigation';
import { DataCard } from '@/components/patterns/DataCard';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Icons
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Building2,
  MapPin,
  Calendar,
  Flag,
  Hash,
  MessageSquare,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type TabKey = 'details' | 'evidences';

type OrderDetailPageProps = {
  params: { id: string };
};

// ============================================================================
// CONSTANTS
// ============================================================================
const TABS = [
  { key: 'details' as TabKey, label: 'Detalles', icon: FileText },
  { key: 'evidences' as TabKey, label: 'Evidencias', icon: ImageIcon },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // ------------------------------------
  // Hooks & State
  // ------------------------------------
  const router = useRouter();
  const { data: order, isLoading } = useOrder(params.id);
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const { evidencesQuery, uploadMutation, approveMutation } = useEvidences(params.id);

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const handleUploadEvidence = async ({
    file,
    stage,
    type,
  }: {
    file: File;
    stage: string;
    type: string;
  }) => {
    await uploadMutation.mutateAsync({ file, stage, type });
  };

  const handleApproveEvidence = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // ------------------------------------
  // Loading State
  // ------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <LoadingState message="Cargando orden..." subMessage="Obteniendo detalles" />
      </div>
    );
  }

  // ------------------------------------
  // Error State (Not Found)
  // ------------------------------------
  if (!order) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <ErrorState
          title="Orden no encontrada"
          message="La orden solicitada no existe o no tienes permisos para verla"
          action={{
            label: 'Volver',
            onClick: () => router.back(),
          }}
        />
      </div>
    );
  }

  // ------------------------------------
  // Order Fields Config
  // ------------------------------------
  const orderFields = [
    {
      label: 'Cliente',
      value: order.cliente,
      icon: Building2,
      bgColor: 'bg-primary-50 dark:bg-primary-950',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Código',
      value: order.codigo,
      icon: Hash,
      bgColor: 'bg-secondary-50 dark:bg-secondary-950',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
    },
    {
      label: 'Ubicación',
      value: order.ubicacion || 'N/A',
      icon: MapPin,
      bgColor: 'bg-info-50 dark:bg-info-950',
      iconColor: 'text-info-600 dark:text-info-400',
    },
    {
      label: 'Fecha de Creación',
      value: new Date(order.fechaCreacion).toLocaleString('es-ES'),
      icon: Calendar,
      bgColor: 'bg-warning-50 dark:bg-warning-950',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
  ];

  // ------------------------------------
  // Main Content
  // ------------------------------------
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================
          SECTION: Header
      ========================================== */}
      <div className="rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  Detalle de Orden
                </h1>
                <p className="mt-1 font-mono text-sm text-neutral-600 dark:text-neutral-400">
                  ID: {order.id}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge state={order.state} />
              <div className="flex items-center gap-2 rounded-lg border-2 border-warning-200 bg-warning-50 px-3 py-1 text-sm font-bold text-warning-700 dark:border-warning-900 dark:bg-warning-950 dark:text-warning-400">
                <Flag className="h-4 w-4" />
                {order.prioridad}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentarios
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
              Editar Orden
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================
          SECTION: Tabs
      ========================================== */}
      <div className="rounded-3xl border-2 border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <TabNavigation tabs={TABS} activeTab={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />

        <div className="p-8">
          {/* Tab: Details */}
          {activeTab === 'details' && (
            <div className="animate-slide-up space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {orderFields.map((field) => (
                  <DataCard key={field.label} {...field} />
                ))}
              </div>

              <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800">
                <label className="mb-3 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  Descripción
                </label>
                <p className="leading-relaxed text-neutral-900 dark:text-neutral-50">
                  {order.descripcion || 'Sin descripción proporcionada'}
                </p>
              </div>
            </div>
          )}

          {/* Tab: Evidences */}
          {activeTab === 'evidences' && (
            <div className="animate-slide-up space-y-8">
              <div>
                <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  Evidencias de la orden
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Sube fotografías y documentos relacionados a esta orden, organizados por etapa
                </p>
              </div>

              <EvidenceUpload
                isUploading={uploadMutation.isPending}
                onUpload={handleUploadEvidence}
              />

              <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800">
                {evidencesQuery.isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <LoadingState message="Cargando evidencias..." />
                  </div>
                )}

                {evidencesQuery.isError && (
                  <ErrorState
                    title="Error al cargar evidencias"
                    message="No se pudieron cargar las evidencias"
                  />
                )}

                {evidencesQuery.data && (
                  <EvidenceList
                    evidences={evidencesQuery.data}
                    isApprovingId={
                      approveMutation.isPending
                        ? (approveMutation.variables as string | undefined) ?? null
                        : null
                    }
                    onApprove={handleApproveEvidence}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




