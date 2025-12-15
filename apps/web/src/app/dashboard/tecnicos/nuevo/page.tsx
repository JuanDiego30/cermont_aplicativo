'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tecnicosApi } from '@/features/tecnicos/api/tecnicos.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ESPECIALIDADES = [
    { value: 'general', label: 'General' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'electricidad', label: 'Electricidad' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'refrigeracion', label: 'Refrigeración' },
    { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
    { value: 'soldadura', label: 'Soldadura' },
    { value: 'alturas', label: 'Trabajo en Alturas' },
];

const UBICACIONES = [
    { value: 'arauca', label: 'Arauca' },
    { value: 'bogota', label: 'Bogotá' },
    { value: 'cano_limon', label: 'Caño Limón' },
    { value: 'otro', label: 'Otro' },
];

export default function NuevoTecnicoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        cargo: 'Técnico de Campo' as const,
        especialidad: 'general',
        ubicacion: 'arauca',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError(null);
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return false;
        }
        if (!formData.email.trim()) {
            setError('El email es requerido');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('El email no es válido');
            return false;
        }
        if (!formData.telefono.trim()) {
            setError('El teléfono es requerido');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            await tecnicosApi.create({
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                telefono: formData.telefono.trim(),
                cargo: formData.cargo,
                especialidad: formData.especialidad,
                ubicacion: formData.ubicacion,
            });

            router.push('/dashboard/tecnicos');
        } catch (err: unknown) {
            console.error('Error creating technician:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error al crear el técnico';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header con navegación */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/tecnicos">
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Nuevo Técnico
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                        Registra un nuevo técnico en el sistema Cermont
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Información del Técnico</CardTitle>
                    <CardDescription>
                        Completa todos los campos requeridos (*)
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={20} />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-300">Error</h3>
                                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Nombre Completo */}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre Completo *
                            </label>
                            <Input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Juan Diego Pérez"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email *
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="juan.perez@cermont.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Teléfono *
                            </label>
                            <Input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                placeholder="+57 313 8752441"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                                className="w-full"
                            />
                        </div>

                        {/* Especialidad */}
                        <div>
                            <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Especialidad *
                            </label>
                            <Select 
                                id="especialidad"
                                value={formData.especialidad} 
                                onChange={(e) => handleSelectChange('especialidad', e.target.value)}
                                options={ESPECIALIDADES}
                            />
                        </div>

                        {/* Ubicación */}
                        <div>
                            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ubicación Base *
                            </label>
                            <Select 
                                id="ubicacion"
                                value={formData.ubicacion} 
                                onChange={(e) => handleSelectChange('ubicacion', e.target.value)}
                                options={UBICACIONES}
                            />
                        </div>

                        {/* Botones - Responsive para móvil */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Crear Técnico'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
