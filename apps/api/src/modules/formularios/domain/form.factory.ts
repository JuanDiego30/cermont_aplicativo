/**
 * @file form.factory.ts
 * @description Factory Pattern for creating different types of forms
 * @pattern Factory
 *
 * This factory creates form instances based on the type.
 * Allows easy extension with new form types without modifying existing code (OCP).
 */

// Base interface for all forms
export interface FormField {
    id: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'signature';
    label: string;
    required: boolean;
    options?: string[];
    validations?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface FormTemplate {
    id: string;
    tipo: string;
    nombre: string;
    descripcion?: string;
    campos: FormField[];
    version: number;
}

// Form Type Interface (Product)
export interface FormProduct {
    getTemplate(): FormTemplate;
    validate(data: Record<string, unknown>): { valid: boolean; errors: string[] };
}

// Concrete Products
export class CCTVForm implements FormProduct {
    private template: FormTemplate = {
        id: 'cctv-form',
        tipo: 'CCTV',
        nombre: 'Formulario de Instalación CCTV',
        campos: [
            { id: 'ubicacion', type: 'text', label: 'Ubicación', required: true },
            { id: 'num_camaras', type: 'number', label: 'Número de Cámaras', required: true },
            { id: 'tipo_dvr', type: 'select', label: 'Tipo de DVR', required: true, options: ['4CH', '8CH', '16CH', '32CH'] },
            { id: 'fecha_instalacion', type: 'date', label: 'Fecha de Instalación', required: true },
            { id: 'firma_cliente', type: 'signature', label: 'Firma del Cliente', required: true },
        ],
        version: 1,
    };

    getTemplate(): FormTemplate {
        return this.template;
    }

    validate(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        for (const campo of this.template.campos) {
            if (campo.required && !data[campo.id]) {
                errors.push(`El campo "${campo.label}" es requerido`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}

export class MantenimientoForm implements FormProduct {
    private template: FormTemplate = {
        id: 'mantenimiento-form',
        tipo: 'MANTENIMIENTO',
        nombre: 'Formulario de Mantenimiento Preventivo',
        campos: [
            { id: 'equipo', type: 'text', label: 'Equipo', required: true },
            { id: 'tipo_mantenimiento', type: 'select', label: 'Tipo', required: true, options: ['Preventivo', 'Correctivo', 'Predictivo'] },
            { id: 'checklist', type: 'checkbox', label: 'Checklist Completado', required: true },
            { id: 'observaciones', type: 'text', label: 'Observaciones', required: false },
            { id: 'evidencias', type: 'file', label: 'Evidencias Fotográficas', required: true },
        ],
        version: 1,
    };

    getTemplate(): FormTemplate {
        return this.template;
    }

    validate(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        for (const campo of this.template.campos) {
            if (campo.required && !data[campo.id]) {
                errors.push(`El campo "${campo.label}" es requerido`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}

export class InspeccionForm implements FormProduct {
    private template: FormTemplate = {
        id: 'inspeccion-form',
        tipo: 'INSPECCION',
        nombre: 'Formulario de Inspección de Seguridad',
        campos: [
            { id: 'area', type: 'text', label: 'Área Inspeccionada', required: true },
            { id: 'fecha', type: 'date', label: 'Fecha de Inspección', required: true },
            { id: 'cumple_normas', type: 'checkbox', label: 'Cumple Normas', required: true },
            { id: 'hallazgos', type: 'text', label: 'Hallazgos', required: false },
            { id: 'firma_inspector', type: 'signature', label: 'Firma del Inspector', required: true },
        ],
        version: 1,
    };

    getTemplate(): FormTemplate {
        return this.template;
    }

    validate(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        for (const campo of this.template.campos) {
            if (campo.required && !data[campo.id]) {
                errors.push(`El campo "${campo.label}" es requerido`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}

// Factory
export type FormType = 'CCTV' | 'MANTENIMIENTO' | 'INSPECCION';

export class FormFactory {
    private static creators = new Map<FormType, new () => FormProduct>();

    static {
        this.creators.set('CCTV', CCTVForm);
        this.creators.set('MANTENIMIENTO', MantenimientoForm);
        this.creators.set('INSPECCION', InspeccionForm);
    }

    /**
     * Create a form instance by type
     */
    static createForm(type: FormType): FormProduct {
        const FormClass = this.creators.get(type);
        if (!FormClass) {
            throw new Error(`Form type "${type}" is not supported`);
        }
        return new FormClass();
    }

    /**
     * Register a new form type at runtime (Open/Closed Principle)
     */
    static registerFormType(type: FormType, FormClass: new () => FormProduct): void {
        this.creators.set(type, FormClass);
    }

    /**
     * Get all available form types
     */
    static getAvailableTypes(): FormType[] {
        return Array.from(this.creators.keys());
    }
}
