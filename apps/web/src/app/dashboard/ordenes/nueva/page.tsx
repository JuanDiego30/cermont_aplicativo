"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useCreateOrden } from "@/features/ordenes/hooks/use-ordenes";

// Importing UI components with correct capitalization
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default function NewOrderPage() {
    const router = useRouter();
    const { mutateAsync: createOrden } = useCreateOrden();
    const [loading, setLoading] = useState(false);

    // Form State matching UI logic
    const [formData, setFormData] = useState({
        numero: "",
        titulo: "",
        clienteId: "",
        ubicacion: "",
        tecnicoId: "",
        tipo: "preventivo",
        prioridad: "media",
        descripcion: "",
        montoEstimado: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const now = new Date();
            // Map form data to CreateOrdenDTO
            await createOrden({
                numero: formData.numero,
                clienteId: formData.clienteId,
                // Combining fields into description or ensuring backend handles them
                descripcion: `${formData.titulo} - ${formData.descripcion}`,
                tipoServicio: formData.tipo,
                montoEstimado: Number(formData.montoEstimado),
                fechaEstimadaInicio: now.toISOString(),
                fechaEstimadaFin: new Date(now.getTime() + 3600000).toISOString(), // +1 hour
                responsableId: formData.tecnicoId,
                // Note: 'ubicacion' and 'prioridad' are not in standard DTO but used in UI. 
                // If needed, they should be added to DTO or put in description.
            });
            router.push("/dashboard/ordenes");
        } catch (error) {
            console.error("Error creating order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Orden de Trabajo</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Complete la información para crear una nueva orden</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Input
                                label="Número de Orden"
                                id="numero"
                                placeholder="ORD-2025-XXX"
                                value={formData.numero}
                                onChange={(e) => handleChange("numero", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Título"
                                id="titulo"
                                placeholder="Ej. Mantenimiento Preventivo"
                                value={formData.titulo}
                                onChange={(e) => handleChange("titulo", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Cliente (ID)"
                                id="cliente"
                                placeholder="ID del Cliente"
                                value={formData.clienteId}
                                onChange={(e) => handleChange("clienteId", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Ubicación"
                                id="ubicacion"
                                placeholder="Ciudad / Sede"
                                value={formData.ubicacion}
                                onChange={(e) => handleChange("ubicacion", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Técnico Asignado (ID)"
                                id="tecnico"
                                placeholder="ID del Técnico"
                                value={formData.tecnicoId}
                                onChange={(e) => handleChange("tecnicoId", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                label="Monto Estimado"
                                id="monto"
                                type="number"
                                placeholder="0.00"
                                value={formData.montoEstimado}
                                onChange={(e) => handleChange("montoEstimado", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                                Prioridad
                            </label>
                            <Select
                                value={formData.prioridad}
                                onChange={(e) => handleChange("prioridad", e.target.value)}
                                options={[
                                    { value: "baja", label: "Baja" },
                                    { value: "media", label: "Media" },
                                    { value: "alta", label: "Alta" },
                                    { value: "urgente", label: "Urgente" }
                                ]}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                                Tipo Servicio
                            </label>
                            <Select
                                value={formData.tipo}
                                onChange={(e) => handleChange("tipo", e.target.value)}
                                options={[
                                    { value: "preventivo", label: "Preventivo" },
                                    { value: "correctivo", label: "Correctivo" },
                                    { value: "instalacion", label: "Instalación" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                            Descripción Detallada
                        </label>
                        <Textarea
                            id="descripcion"
                            placeholder="Describa el trabajo a realizar..."
                            className="resize-none h-32"
                            value={formData.descripcion}
                            onChange={(e) => handleChange("descripcion", e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Guardando..." : "Crear Orden"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
