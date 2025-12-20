/**
 * @file page.tsx
 * @description Página de Formularios Dinámicos
 */

'use client';

import React, { useState } from 'react';
import { useFormTemplates, useDeleteFormTemplate } from '@/features/forms';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Plus, Upload, Search } from 'lucide-react';
import Link from 'next/link';

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: templates, isLoading } = useFormTemplates();
  const deleteTemplate = useDeleteFormTemplate();

  const filteredTemplates = templates?.data?.filter((t: any) =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Formularios Dinámicos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Crea y gestiona formularios dinámicos desde templates
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/forms/nueva/template">
            <Button>
              <Plus className="w-4 h-4" />
              Nuevo Template
            </Button>
          </Link>
          <Link href="/dashboard/forms/parse">
            <Button variant="secondary">
              <Upload className="w-4 h-4" />
              Importar desde PDF/Excel
            </Button>
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template: any) => (
            <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {template.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {template.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900/20 dark:text-blue-400">
                      {template.tipo}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded dark:bg-gray-800 dark:text-gray-400">
                      {template.categoria}
                    </span>
                    {template.activo ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded dark:bg-green-900/20 dark:text-green-400">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded dark:bg-gray-800 dark:text-gray-400">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/forms/templates/${template.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm('¿Estás seguro de desactivar este template?')) {
                      // Trigger with arg for SWR wrapper
                      deleteTemplate.trigger(template.id);
                    }
                  }}
                  disabled={deleteTemplate.isMutating}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No hay templates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crea tu primer template de formulario dinámico
          </p>
          <Link href="/dashboard/forms/nueva/template">
            <Button>
              <Plus className="w-4 h-4" />
              Crear Template
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
