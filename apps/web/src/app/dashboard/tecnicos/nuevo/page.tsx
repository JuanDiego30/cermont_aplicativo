'use client';

/**
 * ARCHIVO: page.tsx (/dashboard/tecnicos/nuevo)
 * FUNCION: Formulario para crear nuevo técnico
 * IMPLEMENTACION: Usa componentes UI existentes y tecnicosApi
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tecnicosApi } from '@/features/tecnicos/api/tecnicos.api';
import type { TecnicoCargo } from '@/features/tecnicos/api/tecnicos.types';
import { Card } from '@/components/ui/Card';
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

const CARGOS = [
    { value: 'Técnico Senior', label: 'Técnico Senior' },
    { value: 'Técnico de Campo', label: 'Técnico de Campo' },
    { value: 'Supervisor HES', label: 'Supervisor HES' },
    { value: 'Aprendiz', label: 'Aprendiz' },
    { value: 'Coordinador', label: 'Coordinador' },
];

const UBICACIONES = [
    { value: 'Arauca', label: 'Arauca' },
    { value: 'Bogotá', label: 'Bogotá' },
    { value: 'Caño Limón', label: 'Caño Limón' },
    { value: 'Otro', label: 'Otro' },
];

export default function NuevoTecnicoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        especialidad: 'general',
        cargo: 'Técnico de Campo' as TecnicoCargo,
        ubicacion: 'Arauca',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Ingresa un email válido');
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
                especialidad: formData.especialidad,
                cargo: formData.cargo,
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
        <div className="space-y-6 p-4 md:p-6 max-w-2xl">
            {/* Header con navegación */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/tecnicos">
                    <Button variant="outline" className="p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Nuevo Técnico
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        Registra un nuevo técnico en el sistema
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={20} />
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
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
                        />
                    </div>

                    {/* Cargo */}
                    <div>
                        <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cargo *
                        </label>
                        <Select
                            id="cargo"
                            name="cargo"
                            value={formData.cargo}
                            onChange={handleSelectChange}
                            options={CARGOS}
                        />
                    </div>

                    {/* Especialidad */}
                    <div>
                        <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Especialidad *
                        </label>
                        <Select
                            id="especialidad"
                            name="especialidad"
                            value={formData.especialidad}
                            onChange={handleSelectChange}
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
                            name="ubicacion"
                            value={formData.ubicacion}
                            onChange={handleSelectChange}
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
            </Card>
        </div>
    );
}
