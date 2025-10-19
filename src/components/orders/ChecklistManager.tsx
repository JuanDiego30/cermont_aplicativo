"use client";
import React, { useState, useEffect } from 'react';
import type { PlantillaChecklist, ChecklistOrden, ItemChecklist } from '@/lib/types/operations';
import { Badge } from '@/components/ui';

interface ChecklistManagerProps {
  ordenId: string;
  tipoEquipo: 'CCTV' | 'Radio Enlace' | 'Torre' | 'Otro';
  tipoOrden?: 'Mantenimiento Preventivo' | 'Mantenimiento Correctivo' | 'Instalación' | 'Diagnóstico';
  readonly?: boolean;
}

export default function ChecklistManager({ ordenId, tipoEquipo, tipoOrden, readonly = false }: ChecklistManagerProps) {
  const [plantillas, setPlantillas] = useState<PlantillaChecklist[]>([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>('');
  const [checklist, setChecklist] = useState<ChecklistOrden | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [ordenId, tipoEquipo]);

  async function loadData() {
    setLoading(true);
    // Cargar plantillas disponibles
    const resPl = await fetch(`/checklists/plantillas?tipo_equipo=${tipoEquipo}${tipoOrden ? `&tipo_orden=${tipoOrden}` : ''}`);
    if (resPl.ok) {
      const json = await resPl.json();
      setPlantillas(json.data?.data || []);
    }
    // Cargar checklist existente de la orden
    const resCh = await fetch(`/checklists/orden/${ordenId}`);
    if (resCh.ok) {
      const json = await resCh.json();
      setChecklist(json.data || null);
      if (json.data) setPlantillaSeleccionada(json.data.plantilla_id);
    }
    setLoading(false);
  }

  async function handleCrearChecklist() {
    if (!plantillaSeleccionada) return;
    const plantilla = plantillas.find(p => p.id === plantillaSeleccionada);
    if (!plantilla) return;

    const items_verificados = plantilla.items.map(item => ({
      item_id: item.id,
      verificado: false,
      cantidad_real: item.cantidad_sugerida,
      notas: '',
    }));

    const res = await fetch('/checklists/orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orden_id: ordenId,
        plantilla_id: plantillaSeleccionada,
        items_verificados,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setChecklist(json.data);
    }
  }

  async function handleToggleItem(itemId: string) {
    if (readonly || !checklist) return;
    const updated = {
      ...checklist,
      items_verificados: checklist.items_verificados.map(iv =>
        iv.item_id === itemId ? { ...iv, verificado: !iv.verificado } : iv
      ),
    };
    const verificados = updated.items_verificados.filter(iv => iv.verificado).length;
    updated.porcentaje_completado = Math.round((verificados / updated.items_verificados.length) * 100);
    updated.completado = updated.porcentaje_completado === 100;

    const res = await fetch(`/checklists/orden/${ordenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const json = await res.json();
      setChecklist(json.data);
    }
  }

  if (loading) return <div className="p-4 text-center text-gray-600">Cargando checklist...</div>;

  const plantilla = plantillas.find(p => p.id === plantillaSeleccionada);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Checklist de Herramientas y Equipos</h3>
        {checklist && (
          <Badge variant={checklist.completado ? 'green' : 'yellow'}>
            {checklist.porcentaje_completado}% Completado
          </Badge>
        )}
      </div>

      {!checklist && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-3">
            <strong>💡 Tip:</strong> Selecciona una plantilla de checklist para asegurar que llevas todas las herramientas necesarias.
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={plantillaSeleccionada}
                onChange={e => setPlantillaSeleccionada(e.target.value)}
                disabled={readonly}
              >
                <option value="">Seleccionar plantilla...</option>
                {plantillas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={handleCrearChecklist}
              disabled={!plantillaSeleccionada || readonly}
            >
              Crear Checklist
            </button>
          </div>
        </div>
      )}

      {checklist && plantilla && (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          {plantilla.items.map(item => {
            const verif = checklist.items_verificados.find(iv => iv.item_id === item.id);
            const isChecked = verif?.verificado || false;
            return (
              <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleItem(item.id)}
                  disabled={readonly}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.nombre}
                    </h4>
                    {item.obligatorio && <Badge variant="red">Obligatorio</Badge>}
                  </div>
                  {item.descripcion && <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="capitalize">{item.categoria.replace('_', ' ')}</span>
                    {item.cantidad_sugerida && (
                      <span>• {item.cantidad_sugerida} {item.unidad || 'unidad(es)'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checklist && plantilla && plantilla.notas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-900"><strong>Notas:</strong> {plantilla.notas}</p>
        </div>
      )}
    </div>
  );
}
