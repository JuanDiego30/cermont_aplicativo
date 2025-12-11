"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
    CheckCircle2,
    Circle,
    Camera,
    Pencil,
    Save,
    Loader2
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface ChecklistItem {
    id: string;
    orden: number;
    descripcion: string;
    obligatorio: boolean;
    tipo: string;
    completado: boolean;
    valor?: string;
    fotoUrl?: string;
    observaciones?: string;
}

interface ChecklistTemplate {
    id: string;
    nombre: string;
    descripcion?: string;
    tipoTrabajo: string;
    items: {
        id: string;
        orden: number;
        descripcion: string;
        obligatorio: boolean;
        tipo: string;
    }[];
}

// ============================================
// API
// ============================================

const fetchTemplates = async (tipo?: string) => {
    const params: Record<string, string> = {};
    if (tipo) params.tipo = tipo;

    const response = await apiClient.get<any>("/checklists/templates", params);
    return response.data as ChecklistTemplate[];
};

const ejecutarChecklist = async (data: {
    ordenId: string;
    templateId?: string;
    items: ChecklistItem[];
    firmaDigital?: string;
    observacionesGenerales?: string;
}) => {
    const response = await apiClient.post<any>("/checklists/ejecutar", data);
    return response.data;
};

// ============================================
// COMPONENT
// ============================================

interface ChecklistFormProps {
    ordenId: string;
    tipoTrabajo?: string;
    onComplete?: () => void;
}

export function ChecklistForm({ ordenId, tipoTrabajo, onComplete }: ChecklistFormProps) {
    const queryClient = useQueryClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [observaciones, setObservaciones] = useState("");
    const [isSigning, setIsSigning] = useState(false);
    const [signingStarted, setSigningStarted] = useState(false);

    const { data: templates = [], isLoading: loadingTemplates } = useQuery({
        queryKey: ["checklist-templates", tipoTrabajo],
        queryFn: () => fetchTemplates(tipoTrabajo),
    });

    const submitMutation = useMutation({
        mutationFn: ejecutarChecklist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["checklists-orden", ordenId] });
            onComplete?.();
        },
    });

    const handleSelectTemplate = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        setItems(
            template.items.map((item) => ({
                ...item,
                completado: false,
                valor: "",
                fotoUrl: "",
                observaciones: "",
            }))
        );
    };

    const toggleItem = (itemId: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, completado: !item.completado } : item
            )
        );
    };

    const updateItemValue = (itemId: string, field: keyof ChecklistItem, value: string) => {
        setItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
        );
    };

    const capturePhoto = async (itemId: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("video");
            video.srcObject = stream;
            await video.play();

            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(video, 0, 0);

            stream.getTracks().forEach((track) => track.stop());

            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            updateItemValue(itemId, "fotoUrl", dataUrl);
        } catch {
            alert("No se pudo acceder a la cámara");
        }
    };

    // Signature handling
    const startSigning = () => {
        setIsSigning(true);
        setSigningStarted(false);
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setSigningStarted(true);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!signingStarted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = "#1e40af";
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const handleCanvasMouseUp = () => {
        setSigningStarted(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getSignatureData = () => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        return canvas.toDataURL("image/png");
    };

    const handleSubmit = () => {
        const itemsObligatoriosIncompletos = items.filter(
            (item) => item.obligatorio && !item.completado
        );

        if (itemsObligatoriosIncompletos.length > 0) {
            alert(`Faltan ${itemsObligatoriosIncompletos.length} items obligatorios por completar`);
            return;
        }

        submitMutation.mutate({
            ordenId,
            templateId: selectedTemplate?.id,
            items,
            firmaDigital: getSignatureData(),
            observacionesGenerales: observaciones,
        });
    };

    const completados = items.filter((i) => i.completado).length;
    const progreso = items.length > 0 ? Math.round((completados / items.length) * 100) : 0;

    if (loadingTemplates) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Template Selection */}
            {!selectedTemplate ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Seleccionar Checklist
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleSelectTemplate(template)}
                                className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {template.nombre}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">{template.descripcion}</p>
                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {template.items.length} items
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Progress Header */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedTemplate.nombre}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {completados} de {items.length} completados
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    setItems([]);
                                }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Cambiar checklist
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progreso}%` }}
                            />
                        </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                        {items.map((item, index) => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className={`mt-0.5 flex-shrink-0 ${item.completado ? "text-green-500" : "text-gray-400"
                                            }`}
                                    >
                                        {item.completado ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : (
                                            <Circle className="w-6 h-6" />
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">
                                                {index + 1}.
                                            </span>
                                            <span
                                                className={`${item.completado
                                                    ? "text-gray-500 line-through"
                                                    : "text-gray-900 dark:text-white"
                                                    }`}
                                            >
                                                {item.descripcion}
                                            </span>
                                            {item.obligatorio && (
                                                <span className="text-xs text-red-500 font-medium">*</span>
                                            )}
                                        </div>

                                        {/* Type-specific inputs */}
                                        {item.tipo === "medicion" && (
                                            <input
                                                type="text"
                                                placeholder="Valor medido"
                                                value={item.valor || ""}
                                                onChange={(e) => updateItemValue(item.id, "valor", e.target.value)}
                                                className="mt-2 w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                            />
                                        )}

                                        {item.tipo === "texto" && (
                                            <textarea
                                                placeholder="Escribir observación"
                                                value={item.valor || ""}
                                                onChange={(e) => updateItemValue(item.id, "valor", e.target.value)}
                                                className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none"
                                                rows={2}
                                            />
                                        )}

                                        {item.tipo === "foto" && (
                                            <div className="mt-2">
                                                {item.fotoUrl ? (
                                                    <div className="relative w-32 h-24">
                                                        <img
                                                            src={item.fotoUrl}
                                                            alt="Captura"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => updateItemValue(item.id, "fotoUrl", "")}
                                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => capturePhoto(item.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <Camera className="w-4 h-4" />
                                                        Tomar foto
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Observaciones */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Observaciones Generales
                        </h4>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Agregar observaciones del trabajo realizado..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Digital Signature */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Firma Digital
                        </h4>
                        {!isSigning ? (
                            <button
                                onClick={startSigning}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Agregar firma
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={150}
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white cursor-crosshair"
                                    onMouseDown={handleCanvasMouseDown}
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUp}
                                    onMouseLeave={handleCanvasMouseUp}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearSignature}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={() => setIsSigning(false)}
                                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {submitMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Guardar Checklist
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
