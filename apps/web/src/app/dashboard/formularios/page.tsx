'use client';

import { availableSchemas } from '@/lib/form-schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Shield, Search } from 'lucide-react';
import Link from 'next/link';

export default function FormulariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formularios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Selecciona un formulario para iniciar el diligenciamiento
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableSchemas.map((schema) => (
          <Card key={schema.id} className="hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {schema.codigo}
              </CardTitle>
              {schema.categoria === 'seguridad' ? (
                <Shield className="h-4 w-4 text-orange-500" />
              ) : (
                <FileText className="h-4 w-4 text-blue-500" />
              )}
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 min-h-14">
                {schema.name}
              </h3>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded capitalize">
                  {schema.categoria}
                </span>
                <Link href={`/dashboard/formularios/nueva/${schema.id}`}>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
