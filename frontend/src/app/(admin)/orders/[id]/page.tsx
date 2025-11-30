"use client";

import { useOrder } from "@/features/orders";
import { useOrderReports, ActaEntregaButton, SESButton, ActivityReportButton } from "@/features/reports";
import { SignatureSection } from "@/features/signatures";
import { AribaIntegrationCard } from "@/features/ariba";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const { data: order, isLoading } = useOrder(orderId);
  const { 
    generateActivity, 
    generateActa, 
    generateSES,
    isGeneratingActivity,
    isGeneratingActa,
    isGeneratingSES,
  } = useOrderReports(orderId);

  const getStateColor = (state?: string) => {
    const colors: Record<string, string> = {
      SOLICITUD: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      VISITA: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      PO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      PLANEACION: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      EJECUCION: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400",
      INFORME: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      ACTA: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      SES: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      FACTURA: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      PAGO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return state ? colors[state] || colors.SOLICITUD : colors.SOLICITUD;
  };

  const getStateLabel = (state?: string) => {
    const labels: Record<string, string> = {
      SOLICITUD: "Solicitud",
      VISITA: "Visita",
      PO: "PO",
      PLANEACION: "Planeación",
      EJECUCION: "En Ejecución",
      INFORME: "Informe",
      ACTA: "Acta",
      SES: "SES",
      FACTURA: "Factura",
      PAGO: "Pago",
    };
    return state ? labels[state] || state : "Solicitud";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orden no encontrada
          </h1>
          <Link
            href="/orders"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver a Órdenes
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            La orden de trabajo que buscas no existe o fue eliminada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              OT-{order.orderNumber}
            </h1>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStateColor(order.state as string)}`}>
              {getStateLabel(order.state as string)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {order.description?.slice(0, 100)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver
          </Link>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
            Editar
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Descripción
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {order.description || "Sin descripción"}
            </p>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actividad
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Orden creada</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString("es-ES") : "Fecha no disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signatures Section */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <SignatureSection
              entityType="order"
              entityId={orderId}
              requiredSignatures={['technician', 'supervisor', 'client']}
              title="Firmas del Acta de Entrega"
              onAllSigned={() => {
                console.log('Todas las firmas completadas');
              }}
            />
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.clientName || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Cliente</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.clientEmail || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prioridad</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.priority || "Normal"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Horas Estimadas</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.estimatedHours ? `${order.estimatedHours}h` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ubicación
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                {order.location || "Sin ubicación especificada"}
              </p>
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                Cambiar Estado
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Agregar Evidencia
              </button>
            </div>
          </div>

          {/* PDF Reports Card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documentos PDF
            </h3>
            <div className="space-y-3">
              <ActivityReportButton 
                onDownload={generateActivity}
                isLoading={isGeneratingActivity}
                className="w-full justify-center"
              />
              <ActaEntregaButton 
                onDownload={generateActa}
                isLoading={isGeneratingActa}
                className="w-full justify-center"
              />
              <SESButton 
                onDownload={generateSES}
                isLoading={isGeneratingSES}
                className="w-full justify-center"
              />
            </div>
          </div>

          {/* SAP Ariba Integration Card */}
          <AribaIntegrationCard orderId={orderId} orderNumber={order.orderNumber || ''} />
        </div>
      </div>
    </div>
  );
}
