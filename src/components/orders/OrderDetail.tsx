"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ordersAPI, evidenceAPI, failuresAPI, type Falla } from '@/lib/api';
import type { OrdenTrabajo, HistorialOrden } from '@/lib/types/database';
import type { EvidenceRecord } from '@/lib/api/evidence';
import ChecklistManager from './ChecklistManager';
import CostTracker from './CostTracker';
import { ROUTES } from '@/lib/constants';

type Tab = 'general' | 'fallas' | 'checklist' | 'costos' | 'evidencias' | 'historial' | 'tecnico';

const OrderDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  // Estados
  const [order, setOrder] = useState<OrdenTrabajo | null>(null);
  const [evidencias, setEvidencias] = useState<EvidenceRecord[]>([]);
  const [historial, setHistorial] = useState<HistorialOrden[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallas, setFallas] = useState<Falla[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos
  useEffect(() => {
    if (params?.id) {
      loadOrderData(params.id);
    }
  }, [params?.id]);

  const loadOrderData = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Cargar orden
      const orderResponse = await ordersAPI.get(id);
      if (orderResponse.error) {
        setError(orderResponse.error);
        return;
      }
      // Cargar fallas asociadas
      const fallasRes = await failuresAPI.listByOrder(id);
      if (!fallasRes.error && fallasRes.data) {
        setFallas(fallasRes.data ?? []);
      }
      if (orderResponse.data) {
        setOrder(orderResponse.data);
        setHistorial(orderResponse.data.historial ?? []);
      }

      // Cargar evidencias
      const evidenciasResponse = await evidenceAPI.list(id);
      if (!evidenciasResponse.error && evidenciasResponse.data) {
        setEvidencias(evidenciasResponse.data);
      }
    } catch (err) {
      setError('Error al cargar datos de la orden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: OrdenTrabajo['estado']) => {
    if (!order) return;
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;

    setIsUpdating(true);
    const response = await ordersAPI.changeStatus(order.id, newStatus);
    
    if (response.error) {
      alert(`Error: ${response.error}`);
    } else if (response.data) {
      setOrder(response.data);
      setHistorial(response.data.historial ?? []);
      alert('Estado actualizado exitosamente');
      loadOrderData(order.id);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) return;

    setIsDeleting(true);
    const response = await ordersAPI.delete(order.id);
    
    if (response.error) {
      alert(`Error: ${response.error}`);
      setIsDeleting(false);
    } else {
      alert('Orden eliminada exitosamente');
  router.push(ROUTES.WORK_ORDERS);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;

  if (!order) return;

  const response = await evidenceAPI.remove(order.id, evidenceId);
    
    if (response.error) {
      alert(`Error: ${response.error}`);
    } else {
      setEvidencias(evidencias.filter(e => e.id !== evidenceId));
      alert('Evidencia eliminada');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-4">{error}</p>
        <button
          onClick={() => router.push(ROUTES.WORK_ORDERS)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Volver a Órdenes
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Orden no encontrada</p>
      </div>
    );
  }

  const estadoColors: Record<OrdenTrabajo['estado'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    asignada: 'bg-blue-100 text-blue-800 border-blue-300',
    en_progreso: 'bg-purple-100 text-purple-800 border-purple-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300',
    aprobada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const prioridadColors: Record<OrdenTrabajo['prioridad'], string> = {
    baja: 'bg-gray-100 text-gray-800 border-gray-300',
    normal: 'bg-blue-100 text-blue-800 border-blue-300',
    alta: 'bg-orange-100 text-orange-800 border-orange-300',
    urgente: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.WORK_ORDERS)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold">{order.numero_orden}</h1>
              <p className="text-sm text-gray-600 mt-1">{order.titulo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${estadoColors[order.estado]}`}>
              {order.estado}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${prioridadColors[order.prioridad]}`}>
              {order.prioridad}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={order.estado}
            onChange={(e) => handleChangeStatus(e.target.value as OrdenTrabajo['estado'])}
            disabled={isUpdating}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="pendiente">Pendiente</option>
            <option value="asignada">Asignada</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="aprobada">Aprobada</option>
          </select>

          <button
            onClick={() => router.push(ROUTES.WORK_ORDER_EDIT(order.id))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Editar
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Imprimir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'general', label: 'Información General' },
              { key: 'fallas', label: `Fallas (${fallas.length})` },
              { key: 'checklist', label: 'Checklist' },
              { key: 'costos', label: 'Costos' },
              { key: 'evidencias', label: `Evidencias (${evidencias.length})` },
              { key: 'historial', label: `Historial (${historial.length})` },
              { key: 'tecnico', label: 'Técnico Asignado' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Orden</label>
                  <p>{order.numero_orden}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Orden</label>
                  <p>{order.tipo_orden}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <p>{order.cliente?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Equipo</label>
                  <p>{order.equipo ? `${order.equipo?.marca || ''} ${order.equipo?.modelo || ''}`.trim() || 'N/A' : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Creación</label>
                  <p>{new Date(order.fecha_creacion ?? order.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Programada</label>
                  <p>{order.fecha_programada ? new Date(order.fecha_programada).toLocaleDateString('es-ES') : 'No programada'}</p>
                </div>
                {order.ubicacion && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Ubicación</label>
                    <p>{order.ubicacion}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <p className="whitespace-pre-wrap">{order.descripcion}</p>
                </div>
                {order.observaciones && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                    <p className="whitespace-pre-wrap">{order.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fallas' && (
            <div>
              {fallas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay fallas asociadas a esta orden.</div>
              ) : (
                <ul className="space-y-4">
                  {fallas.map((f) => (
                    <li key={f.id} className="border-l-4 pl-4 border-blue-400 bg-blue-50 rounded-md py-2">
                      <div className="font-semibold">[{f.codigo}] {f.nombre}</div>
                      <div className="text-xs text-gray-600">{f.severidad.toUpperCase()} • {f.tipo_equipo}</div>
                      {f.descripcion && <div className="text-xs text-gray-500 mt-1">{f.descripcion}</div>}
                      {f.causas_probables && <div className="text-xs text-gray-400 mt-1">Causas: {f.causas_probables}</div>}
                      {f.acciones_sugeridas && <div className="text-xs text-gray-400 mt-1">Acciones: {f.acciones_sugeridas}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'checklist' && order.tipo_equipo && (
            <ChecklistManager 
              ordenId={order.id} 
              tipoEquipo={order.tipo_equipo} 
              tipoOrden={order.tipo_orden}
              readonly={false}
            />
          )}

          {activeTab === 'costos' && (
            <CostTracker 
              ordenId={order.id}
              readonly={false}
            />
          )}

          {activeTab === 'evidencias' && (
            <div>
              {evidencias.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay evidencias</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {evidencias.map((evidencia) => (
                    <div key={evidencia.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {(() => {
                          const url = evidencia.url?.toLowerCase() || '';
                          const isImage = url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.includes('image');
                          return isImage ? (
                            <Image
                              src={evidencia.url}
                              alt={(evidencia.meta_json?.originalName as string | undefined) || 'Evidencia'}
                              className="w-full h-full object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                            />
                          ) : (
                            <video src={evidencia.url} controls className="w-full h-full" />
                          );
                        })()}
                      </div>
                      {typeof evidencia.meta_json?.originalName === 'string' && (
                        <p className="mt-2 text-sm truncate">{evidencia.meta_json.originalName}</p>
                      )}
                      <button
                        onClick={() => handleDeleteEvidence(evidencia.id)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historial' && (
            <div>
              {historial.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Sin historial</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {historial.map((entry) => (
                    <li key={entry.id} className="border-l-2 border-blue-500 pl-4">
                      <p className="text-sm">
                        {entry.accion} <span className="font-medium">{entry.usuario?.nombre ?? 'Usuario desconocido'}</span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString('es-ES')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'tecnico' && (
            <div>
              {order.tecnico_asignado ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Técnico Asignado</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium">Nombre</label>
                      <p>{order.tecnico_asignado.nombre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <p>{order.tecnico_asignado.email}</p>
                    </div>
                    {order.tecnico_asignado.telefono && (
                      <div>
                        <label className="block text-sm font-medium">Teléfono</label>
                        <p>{order.tecnico_asignado.telefono}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Sin técnico asignado</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Asignar Técnico
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
