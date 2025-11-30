"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkPlan, useApproveWorkPlan, useRejectWorkPlan } from "@/features/workplans";
import { CostSummaryCard, CostBreakdownTable, ApprovalDialog } from "@/features/workplans";
import { useState, useCallback } from "react";
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, FileText, DollarSign, Users, Wrench } from "lucide-react";

export default function WorkPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workPlanId = params.id as string;
  
  const { data: workPlan, isLoading, refetch } = useWorkPlan(workPlanId);
  const approveMutation = useApproveWorkPlan();
  const rejectMutation = useRejectWorkPlan();
  const [activeTab, setActiveTab] = useState<"overview" | "costs" | "resources">("overview");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const handleCostUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleApprove = async (comments?: string) => {
    await approveMutation.mutateAsync({ id: workPlanId, data: { comments } });
    refetch();
  };

  const handleReject = async (reason: string) => {
    await rejectMutation.mutateAsync({ id: workPlanId, data: { reason } });
    refetch();
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return status ? colors[status.toUpperCase()] || colors.DRAFT : colors.DRAFT;
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Borrador",
      ACTIVE: "Activo",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado",
      APPROVED: "Aprobado",
      PENDING: "Pendiente",
    };
    return status ? labels[status.toUpperCase()] || status : "Borrador";
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "No definida";
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!workPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plan de Trabajo no encontrado
          </h1>
          <Link
            href="/workplans"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Resumen", icon: FileText },
    { id: "costs", label: "Costos", icon: DollarSign },
    { id: "resources", label: "Recursos", icon: Wrench },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workPlan.title || `Plan de Trabajo #${workPlanId.slice(0, 8)}`}
            </h1>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(workPlan.status)}`}>
              {getStatusLabel(workPlan.status)}
            </span>
          </div>
          {workPlan.orderCode && (
            <p className="text-gray-600 dark:text-gray-400">
              Orden: <Link href={`/orders/${workPlan.orderId}`} className="text-brand-600 hover:underline">
                OT-{workPlan.orderCode}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {workPlan.status?.toUpperCase() === "DRAFT" && (
            <>
              <button
                onClick={() => setShowApprovalDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </button>
              <button
                onClick={() => router.push(`/workplans/${workPlanId}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Presupuesto Estimado</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(workPlan.estimatedBudget?.total)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fecha Inicio</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDate(workPlan.plannedStartDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fecha Fin</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDate(workPlan.plannedEndDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Materiales</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {workPlan.materials?.length || 0} items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Description */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Descripción
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {workPlan.description || "Sin descripción definida"}
              </p>
            </div>

            {/* Safety Tasks */}
            {workPlan.safetyTasks && workPlan.safetyTasks.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tareas de Seguridad (AST)
                </h3>
                <div className="space-y-3">
                  {workPlan.safetyTasks.map((task, index) => (
                    <div key={task.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-medium text-brand-600 dark:text-brand-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{task.task}</p>
                        {task.hazards && task.hazards.length > 0 && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Peligros: {task.hazards.join(", ")}
                          </p>
                        )}
                        {task.controls && task.controls.length > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Controles: {task.controls.join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Responsable: {task.responsible}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Summary (Preview) */}
            <CostSummaryCard workPlanId={workPlanId} />
          </>
        )}

        {activeTab === "costs" && (
          <div className="space-y-6">
            <CostSummaryCard workPlanId={workPlanId} />
            <CostBreakdownTable workPlanId={workPlanId} onUpdate={handleCostUpdate} />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Materials */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Materiales
              </h3>
              {workPlan.materials && workPlan.materials.length > 0 ? (
                <div className="space-y-3">
                  {workPlan.materials.map((material, index) => (
                    <div key={material.id || index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {material.quantity} {material.unit}</p>
                      </div>
                      {material.estimatedCost !== undefined && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(material.estimatedCost)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hay materiales definidos</p>
              )}
            </div>

            {/* Tools */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Herramientas
              </h3>
              {workPlan.tools && workPlan.tools.length > 0 ? (
                <div className="space-y-3">
                  {workPlan.tools.map((tool, index) => (
                    <div key={tool.id || index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-medium text-gray-900 dark:text-white">{tool.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">x{tool.quantity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hay herramientas definidas</p>
              )}
            </div>

            {/* Equipment */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Equipos
              </h3>
              {workPlan.equipment && workPlan.equipment.length > 0 ? (
                <div className="space-y-3">
                  {workPlan.equipment.map((equip, index) => (
                    <div key={equip.id || index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-medium text-gray-900 dark:text-white">{equip.name}</p>
                      {equip.model && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Modelo: {equip.model}
                        </p>
                      )}
                      {equip.certification && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Certificación: {equip.certification}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hay equipos definidos</p>
              )}
            </div>

            {/* PPE */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                EPP (Equipo de Protección Personal)
              </h3>
              {workPlan.ppe && workPlan.ppe.length > 0 ? (
                <div className="space-y-3">
                  {workPlan.ppe.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.standard && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Norma: {item.standard}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">x{item.quantity}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hay EPP definido</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        title={`Aprobar Plan de Trabajo: ${workPlan?.title || workPlanId.slice(0, 8)}`}
        description="¿Deseas aprobar o rechazar este plan de trabajo? Si rechazas, debes proporcionar una razón."
      />
    </div>
  );
}
