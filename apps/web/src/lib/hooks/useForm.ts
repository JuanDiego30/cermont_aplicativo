/**
 * @hook useForm
 * @description Reusable form state management hook
 * Eliminates duplicate form logic across 6+ modules
 */
'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T> {
    initialValues: T;
    validate?: (values: T) => FormErrors<T>;
    onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
    values: T;
    errors: FormErrors<T>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    reset: () => void;
    setValues: (values: Partial<T>) => void;
}

export function useForm<T extends Record<string, any>>({
    initialValues,
    validate,
    onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<FormErrors<T>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setValuesState(prev => ({ ...prev, [name]: finalValue }));

        // Clear error when user starts typing
        if (errors[name as keyof T]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const handleBlur = useCallback((
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        // Validate on blur if validate function provided
        if (validate) {
            const validationErrors = validate(values);
            if (validationErrors[name as keyof T]) {
                setErrors(prev => ({ ...prev, [name]: validationErrors[name as keyof T] }));
            }
        }
    }, [values, validate]);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        // Validate all fields on submit
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);

            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        if (onSubmit) {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validate, onSubmit]);

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValuesState(prev => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const reset = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState(prev => ({ ...prev, ...newValues }));
    }, []);

    const isValid = Object.keys(errors).length === 0;

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        reset,
        setValues,
    };
}
