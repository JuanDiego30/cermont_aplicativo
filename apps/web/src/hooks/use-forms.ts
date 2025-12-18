/**
 * Hook para interactuar con la API de Formularios Dinámicos
 */
'use client';

import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface FormTemplate {
    id: string;
    nombre: string;
    tipo: string;
    categoria: string;
    version: string;
    activo: boolean;
    schema: {
        sections: Array<{
            id: string;
            title: string;
            description?: string;
            fields: Array<{
                id: string;
                label: string;
                type: string;
                required: boolean;
                options?: string[];
                placeholder?: string;
            }>;
        }>;
    };
    uiSchema?: Record<string, unknown>;
    descripcion?: string;
    tags?: string[];
    _count?: { instancias: number };
}

export interface FormInstance {
    id: string;
    templateId: string;
    ordenId?: string;
    data: Record<string, unknown>;
    estado: 'borrador' | 'completado' | 'validado';
    completadoPorId?: string;
    completadoEn?: string;
    template?: { nombre: string; tipo: string; categoria: string };
    orden?: { numero: string; cliente: string };
    completadoPor?: { name: string; email: string };
}

export function useForms() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }, []);

    // Templates
    const fetchTemplates = useCallback(async (filters?: { tipo?: string; categoria?: string; activo?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters?.tipo) params.append('tipo', filters.tipo);
            if (filters?.categoria) params.append('categoria', filters.categoria);
            if (filters?.activo !== undefined) params.append('activo', String(filters.activo));

            const response = await fetch(`${API_URL}/forms/templates?${params}`, {
                headers: getHeaders(),
            });

            if (!response.ok) throw new Error('Error fetching templates');
            return await response.json() as FormTemplate[];
        } catch (err) {
            setError((err as Error).message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const fetchTemplateById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/forms/templates/${id}`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Template not found');
            return await response.json() as FormTemplate;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const createTemplate = useCallback(async (data: Partial<FormTemplate>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/forms/templates`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error creating template');
            return await response.json() as FormTemplate;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const parseFile = useCallback(async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/forms/templates/parse`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error('Error parsing file');
            return await response.json() as FormTemplate;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Instances
    const submitForm = useCallback(async (data: {
        templateId: string;
        ordenId?: string;
        data: Record<string, unknown>;
        estado?: 'borrador' | 'completado';
    }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/forms/submit`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error submitting form');
            return await response.json() as FormInstance;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const fetchInstances = useCallback(async (filters?: { templateId?: string; ordenId?: string; estado?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters?.templateId) params.append('templateId', filters.templateId);
            if (filters?.ordenId) params.append('ordenId', filters.ordenId);
            if (filters?.estado) params.append('estado', filters.estado);

            const response = await fetch(`${API_URL}/forms/instances?${params}`, {
                headers: getHeaders(),
            });

            if (!response.ok) throw new Error('Error fetching instances');
            return await response.json() as FormInstance[];
        } catch (err) {
            setError((err as Error).message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    const fetchInstanceById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/forms/instances/${id}`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Instance not found');
            return await response.json() as FormInstance;
        } catch (err) {
            setError((err as Error).message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    return {
        loading,
        error,
        // Templates
        fetchTemplates,
        fetchTemplateById,
        createTemplate,
        parseFile,
        // Instances
        submitForm,
        fetchInstances,
        fetchInstanceById,
    };
}
