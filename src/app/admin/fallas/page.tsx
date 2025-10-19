"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { failuresAPI, type Falla, type TipoEquipo, type Severidad } from '@/lib/api/failures';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

const FallasAdminPage: React.FC = () => {
  const [fallas, setFallas] = useState<Falla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFalla, setEditingFalla] = useState<Falla | null>(null);
  
  // Filtros
  const [filterTipo, setFilterTipo] = useState<TipoEquipo | ''>('');
  const [filterSeveridad, setFilterSeveridad] = useState<Severidad | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo_equipo: 'CCTV' as TipoEquipo,
    severidad: 'media' as Severidad,
    descripcion: '',
    causas_probables: '',
    acciones_sugeridas: '',
  });

  const loadFallas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await failuresAPI.list({
      limit: 100,
      tipo_equipo: filterTipo || undefined,
      severidad: filterSeveridad || undefined,
      search: searchTerm || undefined,
    });
    
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setFallas(res.data.data || []);
    }
    setLoading(false);
  }, [filterTipo, filterSeveridad, searchTerm]);

  useEffect(() => {
    loadFallas();
  }, [loadFallas]);

  const handleOpenModal = (falla?: Falla) => {
    if (falla) {
      setEditingFalla(falla);
      setFormData({
        codigo: falla.codigo,
        nombre: falla.nombre,
        tipo_equipo: falla.tipo_equipo,
        severidad: falla.severidad,
        descripcion: falla.descripcion || '',
        causas_probables: falla.causas_probables || '',
        acciones_sugeridas: falla.acciones_sugeridas || '',
      });
    } else {
      setEditingFalla(null);
      setFormData({
        codigo: '',
        nombre: '',
        tipo_equipo: 'CCTV',
        severidad: 'media',
        descripcion: '',
        causas_probables: '',
        acciones_sugeridas: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFalla(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = editingFalla
      ? await failuresAPI.update(editingFalla.id, formData)
      : await failuresAPI.create(formData);

    if (res.error) {
      setError(res.error);
      return;
    }

    handleCloseModal();
    loadFallas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta falla?')) return;
    
    const res = await failuresAPI.remove(id);
    if (res.error) {
      setError(res.error);
    } else {
      loadFallas();
    }
  };

  const getSeveridadColor = (severidad: string) => {
    const colors: Record<string, string> = {
      baja: 'bg-gray-100 text-gray-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-red-100 text-red-800',
    };
    return colors[severidad] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Fallas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las fallas comunes de equipos para estandarizar reportes y análisis
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nueva Falla
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            placeholder="Código o nombre de falla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Tipo de Equipo"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value as TipoEquipo | '')}
            options={[
              { value: '', label: 'Todos' },
              { value: 'CCTV', label: 'CCTV' },
              { value: 'Radio Enlace', label: 'Radio Enlace' },
              { value: 'Torre', label: 'Torre' },
              { value: 'Otro', label: 'Otro' },
            ]}
          />
          <Select
            label="Severidad"
            value={filterSeveridad}
            onChange={(e) => setFilterSeveridad(e.target.value as Severidad | '')}
            options={[
              { value: '', label: 'Todas' },
              { value: 'baja', label: 'Baja' },
              { value: 'media', label: 'Media' },
              { value: 'alta', label: 'Alta' },
            ]}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando fallas...</span>
        </div>
      ) : fallas.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay fallas registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fallas.map((falla) => (
                <tr key={falla.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{falla.codigo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{falla.nombre}</div>
                    {falla.descripcion && (
                      <div className="text-xs text-gray-500 mt-1">{falla.descripcion}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{falla.tipo_equipo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeveridadColor(falla.severidad)}`}>
                      {falla.severidad.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      falla.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {falla.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(falla)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(falla.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingFalla ? 'Editar Falla' : 'Nueva Falla'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Código"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="CCTV-001"
                    required
                  />
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Cámara sin señal"
                    required
                  />
                  <Select
                    label="Tipo de Equipo"
                    value={formData.tipo_equipo}
                    onChange={(e) => setFormData({ ...formData, tipo_equipo: e.target.value as TipoEquipo })}
                    required
                    options={[
                      { value: 'CCTV', label: 'CCTV' },
                      { value: 'Radio Enlace', label: 'Radio Enlace' },
                      { value: 'Torre', label: 'Torre' },
                      { value: 'Otro', label: 'Otro' },
                    ]}
                  />
                  <Select
                    label="Severidad"
                    value={formData.severidad}
                    onChange={(e) => setFormData({ ...formData, severidad: e.target.value as Severidad })}
                    required
                    options={[
                      { value: 'baja', label: 'Baja' },
                      { value: 'media', label: 'Media' },
                      { value: 'alta', label: 'Alta' },
                    ]}
                  />
                </div>

                <Textarea
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Describe brevemente la falla..."
                />

                <Textarea
                  label="Causas Probables"
                  value={formData.causas_probables}
                  onChange={(e) => setFormData({ ...formData, causas_probables: e.target.value })}
                  rows={2}
                  placeholder="¿Qué puede causar esta falla?"
                />

                <Textarea
                  label="Acciones Sugeridas"
                  value={formData.acciones_sugeridas}
                  onChange={(e) => setFormData({ ...formData, acciones_sugeridas: e.target.value })}
                  rows={2}
                  placeholder="¿Qué hacer cuando ocurre?"
                />

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="light" type="button" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    {editingFalla ? 'Actualizar' : 'Crear'} Falla
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FallasAdminPage;
