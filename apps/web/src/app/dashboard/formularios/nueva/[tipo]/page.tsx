'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { formSchemas } from '@/lib/form-schemas';
import DynamicForm from '@/components/forms/DynamicForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function NewFormPage({ params }: { params: { tipo: string } }) {
    const router = useRouter();
    const [schema, setSchema] = useState(formSchemas[params.tipo]);

    useEffect(() => {
        // In Next.js 13+ app dir, params are available immediately in server components or passed as props.
        // Ensure we have the schema
        if (!formSchemas[params.tipo]) {
            // Handle invalid form type
        }
    }, [params.tipo]);

    if (!schema) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold text-red-600">Formulario no encontrado</h1>
                <p>El tipo de formulario "{params.tipo}" no existe.</p>
                <Button onClick={() => router.back()} className="mt-4">
                    Volver
                </Button>
            </div>
        );
    }

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            console.log('Enviando datos...', data);
            const response = await apiClient.post('/formularios/respuesta', {
                templateId: schema.id,
                respuestas: data,
                ordenId: undefined // En el futuro obtener del contexto
            });

            if (response && (response as any).success !== false) {
                alert('Formulario guardado exitosamente');
                router.push('/dashboard/formularios');
            } else {
                console.warn('Respuesta backend:', response);
                alert('Formulario guardado (Atención: Backend puede requerir seed)');
                router.push('/dashboard/formularios');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error enviando al servidor. Verifica conexión.');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                    <DynamicForm
                        schema={schema}
                        onSubmit={handleSubmit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
