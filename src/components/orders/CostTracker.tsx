"use client";
import React, { useState, useEffect, useCallback } from 'react';
import type { CostosOrden, ItemCosto, TipoCosto } from '@/lib/types/operations';
import { Badge } from '@/components/ui';

interface CostTrackerProps {
  ordenId: string;
  readonly?: boolean;
}

const TIPOS_COSTO: { value: TipoCosto; label: string }[] = [
  { value: 'mano_obra', label: 'Mano de Obra' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'subcontrato', label: 'Subcontrato' },
  { value: 'viaticos', label: 'Viáticos' },
  { value: 'otro', label: 'Otro' },
];

export default function CostTracker({ ordenId, readonly = false }: CostTrackerProps) {
  const [costos, setCostos] = useState<CostosOrden | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'estimado' | 'real'>('estimado');
  const [nuevoItem, setNuevoItem] = useState<Partial<ItemCosto>>({
    descripcion: '',
    tipo: 'materiales',
    cantidad: 1,
    costo_unitario: 0,
  });

  const loadCostos = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/costos/orden/${ordenId}`);
    if (res.ok) {
      const json = await res.json();
      setCostos(json.data || null);
    } else {
      // Crear registro de costos vacío
      const res2 = await fetch('/costos/orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden_id: ordenId }),
      });
      if (res2.ok) {
        const json2 = await res2.json();
        setCostos(json2.data);
      }
    }
    setLoading(false);
  }, [ordenId]);

  useEffect(() => {
    void loadCostos();
  }, [loadCostos]);

  function calcularSubtotal(items: ItemCosto[]) {
    return items.reduce((sum, i) => sum + i.costo_total, 0);
  }

  function calcularIVA(items: ItemCosto[]) {
    return items.reduce((sum, i) => sum + (i.iva || 0), 0);
  }

  async function handleAgregarItem(tipo: 'estimado' | 'real') {
    if (!costos || !nuevoItem.descripcion || !nuevoItem.costo_unitario) return;
    const id = `item-${Date.now()}`;
    const item: ItemCosto = {
      id,
      descripcion: nuevoItem.descripcion!,
      tipo: nuevoItem.tipo as TipoCosto,
      cantidad: nuevoItem.cantidad || 1,
      costo_unitario: nuevoItem.costo_unitario || 0,
      costo_total: (nuevoItem.cantidad || 1) * (nuevoItem.costo_unitario || 0),
      iva: ((nuevoItem.cantidad || 1) * (nuevoItem.costo_unitario || 0)) * 0.19,
      notas: '',
    };

    const updated = { ...costos };
    updated[tipo].items.push(item);
    updated[tipo].subtotal = calcularSubtotal(updated[tipo].items);
    updated[tipo].iva_total = calcularIVA(updated[tipo].items);
    updated[tipo].total = updated[tipo].subtotal + updated[tipo].iva_total;

    updated.diferencia = updated.real.total - updated.estimado.total;
    updated.porcentaje_variacion = updated.estimado.total > 0 
      ? (updated.diferencia / updated.estimado.total) * 100 
      : 0;

    const res = await fetch(`/costos/orden/${ordenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const json = await res.json();
      setCostos(json.data);
      setNuevoItem({ descripcion: '', tipo: 'materiales', cantidad: 1, costo_unitario: 0 });
    }
  }

  async function handleEliminarItem(tipo: 'estimado' | 'real', itemId: string) {
    if (!costos) return;
    const updated = { ...costos };
    updated[tipo].items = updated[tipo].items.filter(i => i.id !== itemId);
    updated[tipo].subtotal = calcularSubtotal(updated[tipo].items);
    updated[tipo].iva_total = calcularIVA(updated[tipo].items);
    updated[tipo].total = updated[tipo].subtotal + updated[tipo].iva_total;

    updated.diferencia = updated.real.total - updated.estimado.total;
    updated.porcentaje_variacion = updated.estimado.total > 0 
      ? (updated.diferencia / updated.estimado.total) * 100 
      : 0;

    const res = await fetch(`/costos/orden/${ordenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const json = await res.json();
      setCostos(json.data);
    }
  }

  if (loading) return <div className="p-4 text-center text-gray-600">Cargando costos...</div>;
  if (!costos) return null;

  const variacionBadge = costos.porcentaje_variacion > 10 
    ? 'red' 
    : costos.porcentaje_variacion < -5 
    ? 'green' 
    : 'yellow';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Seguimiento de Costos</h3>
        {costos.real.total > 0 && (
          <Badge variant={variacionBadge}>
            Variación: {costos.porcentaje_variacion > 0 ? '+' : ''}{costos.porcentaje_variacion.toFixed(1)}%
          </Badge>
        )}
      </div>

      {/* Comparativa Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">Estimado (Propuesta)</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            ${costos.estimado.total.toLocaleString('es-CO')}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">Real (Ejecutado)</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            ${costos.real.total.toLocaleString('es-CO')}
          </div>
        </div>
        <div className={`border rounded-lg p-4 ${
          costos.diferencia > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className={`text-sm font-medium ${costos.diferencia > 0 ? 'text-red-700' : 'text-green-700'}`}>
            Diferencia
          </div>
          <div className={`text-2xl font-bold mt-1 ${costos.diferencia > 0 ? 'text-red-900' : 'text-green-900'}`}>
            {costos.diferencia > 0 ? '+' : ''}${costos.diferencia.toLocaleString('es-CO')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            tab === 'estimado'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setTab('estimado')}
        >
          Costos Estimados
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            tab === 'real'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setTab('real')}
        >
          Costos Reales
        </button>
      </div>

      {/* Formulario Agregar Item */}
      {!readonly && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Agregar Item de Costo</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Descripción"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={nuevoItem.descripcion}
              onChange={e => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={nuevoItem.tipo}
              onChange={e => setNuevoItem({ ...nuevoItem, tipo: e.target.value as TipoCosto })}
            >
              {TIPOS_COSTO.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Cantidad"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={nuevoItem.cantidad}
              onChange={e => setNuevoItem({ ...nuevoItem, cantidad: parseFloat(e.target.value) || 1 })}
            />
            <input
              type="number"
              placeholder="Costo Unitario"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={nuevoItem.costo_unitario}
              onChange={e => setNuevoItem({ ...nuevoItem, costo_unitario: parseFloat(e.target.value) || 0 })}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => handleAgregarItem(tab)}
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Items */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">C. Unit.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              {!readonly && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {costos[tab].items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.descripcion}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {item.tipo.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.cantidad}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${item.costo_unitario.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  ${item.costo_total.toLocaleString('es-CO')}
                </td>
                {!readonly && (
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleEliminarItem(tab, item.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                ${costos[tab].subtotal.toLocaleString('es-CO')}
              </td>
              {!readonly && <td></td>}
            </tr>
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">IVA (19%):</td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                ${costos[tab].iva_total.toLocaleString('es-CO')}
              </td>
              {!readonly && <td></td>}
            </tr>
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">TOTAL:</td>
              <td className="px-4 py-3 text-lg font-bold text-blue-900 text-right">
                ${costos[tab].total.toLocaleString('es-CO')}
              </td>
              {!readonly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
