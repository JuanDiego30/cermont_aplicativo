'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChecklist, useCompleteChecklist } from '@/lib/hooks/useChecklists';

type ChecklistExecutorProps = {
  checklistId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

export function ChecklistExecutor({ checklistId, isOpen, onClose, onComplete }: ChecklistExecutorProps) {
  const { data: checklist, isLoading } = useChecklist(checklistId);
  const completeMutation = useCompleteChecklist();

  const handleCompleteChecklist = async () => {
    try {
      await completeMutation.mutateAsync({
        checklistId,
        location: await getCurrentLocation(),
      });
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error al completar checklist:', error);
    }
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | undefined> => {
    if (!navigator.geolocation) return undefined;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(undefined),
        { timeout: 10000 }
      );
    });
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Cargando Checklist...">
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
        </div>
      </Modal>
    );
  }

  if (!checklist) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error">
        <div className="text-center py-8">
          <p className="text-red-600">No se pudo cargar el checklist</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Checklist: ${checklist.templateName}`} size="lg">
      <div className="space-y-6">
        {/* Estado del Checklist */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Estado del Checklist</h3>
              <p className="text-sm text-neutral-600">
                Orden: {checklist.orderCode} | Estado: {checklist.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">
                {checklist.answers.length} respuestas guardadas
              </p>
            </div>
          </div>
        </Card>

        {/* Informaci�n */}
        <Card>
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900">
              Checklist en Desarrollo
            </h4>
            <p className="text-sm text-neutral-600">
              ?? Este componente est� simplificado para funcionar con la estructura actual de datos.
              La navegaci�n completa por preguntas se implementar� cuando el backend incluya
              el template completo en las respuestas del checklist.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Funcionalidades Implementadas:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>� ? Carga de checklist existente</li>
                <li>� ? Visualizaci�n de estado y respuestas</li>
                <li>� ? Geolocalizaci�n autom�tica</li>
                <li>� ? Completar checklist</li>
                <li>� ? Navegaci�n por preguntas (pendiente)</li>
                <li>� ? Captura de fotos (pendiente)</li>
                <li>� ? Firma digital (pendiente)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
              {checklist.status !== 'COMPLETED' && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCompleteChecklist}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? 'Completando...' : 'Marcar como Completado'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

