'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PlaneacionForm } from '@/components/forms/PlaneacionForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, FileText, Calendar, Users, ClipboardList } from 'lucide-react';

interface Planeacion {
  id: string;
  ordenId: string;
  orden?: {
    numero: string;
    cliente: string;
  };
  unidadNegocio: string;
  lugar: string;
  estado: string;
  fechaPlaneacion: string;
  totalPersonal: number;
}

export default function PlaneacionPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedOrdenId, setSelectedOrdenId] = useState<string | null>(null);
  const [planeaciones, setPlaneaciones] = useState<Planeacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaneaciones();
  }, []);

  const fetchPlaneaciones = async () => {
    try {
      const response = await apiClient.get<{ data: Planeacion[] } | Planeacion[]>('/planeacion');
      if (response) {
        const data = Array.isArray(response) ? response : (response.data || []);
        setPlaneaciones(data);
      }
    } catch (error) {
      console.error('Error fetching planeaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setSelectedOrdenId(null);
    await fetchPlaneaciones();
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'APROBADA':
        return <Badge className="bg-green-600 text-white">Aprobada</Badge>;
      case 'EN_REVISION':
        return <Badge className="bg-yellow-600 text-white">En Revisión</Badge>;
      case 'RECHAZADA':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            ← Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nueva Planeación de Obra
          </h1>
        </div>
        <PlaneacionForm
          ordenId={selectedOrdenId || ''}
          onSubmit={handleFormSubmit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Planeación de Obra
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona la planeación de materiales, herramientas y personal
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Planeación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Planeaciones</p>
                <p className="text-xl font-bold">{planeaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aprobadas</p>
                <p className="text-xl font-bold">
                  {planeaciones.filter((p) => p.estado === 'APROBADA').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En Revisión</p>
                <p className="text-xl font-bold">
                  {planeaciones.filter((p) => p.estado === 'EN_REVISION').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Personal Asignado</p>
                <p className="text-xl font-bold">
                  {planeaciones.reduce((sum, p) => sum + (p.totalPersonal || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planeaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Planeaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : planeaciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No hay planeaciones registradas</p>
              <p className="text-sm mb-4">
                Comienza creando una nueva planeación de obra
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Planeación
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Orden
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Unidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Lugar
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Personal
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planeaciones.map((planeacion) => (
                    <tr
                      key={planeacion.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {planeacion.orden?.numero || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {planeacion.orden?.cliente}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{planeacion.unidadNegocio}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{planeacion.lugar}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{planeacion.totalPersonal}</span>
                        <span className="text-gray-500 text-sm"> personas</span>
                      </td>
                      <td className="py-3 px-4">{getEstadoBadge(planeacion.estado)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(planeacion.fechaPlaneacion).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
