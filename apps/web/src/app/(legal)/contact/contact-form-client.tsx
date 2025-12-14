'use client';

import { useState, useTransition } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const CATEGORIES = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'soporte', label: 'Soporte Técnico' },
  { value: 'ventas', label: 'Consulta de Ventas' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'sugerencia', label: 'Sugerencia o Feedback' },
  { value: 'otro', label: 'Otro' },
] as const;

/**
 * Formulario de contacto (Client Component)
 * Maneja validación y envío del formulario
 */
export default function ContactFormClient() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    startTransition(async () => {
      try {
        // Simular envío del formulario
        // En producción, reemplazar con llamada API real
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // TODO: Integrar con endpoint real
        // await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });

        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
        });
      } catch {
        setSubmitStatus('error');
      }
    });
  };

  if (submitStatus === 'success') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          ¡Mensaje enviado!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Gracias por contactarnos. Te responderemos en un plazo de 24-48 horas.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="px-6 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error global */}
      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.
          </p>
        </div>
      )}

      {/* Nombre y Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isPending}
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.name 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 dark:border-gray-600'
              }
            `}
            placeholder="Tu nombre"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isPending}
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 dark:border-gray-600'
              }
            `}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label 
          htmlFor="category" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Categoría
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={isPending}
          className="
            w-full px-4 py-3 rounded-lg border transition-colors
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            border-gray-200 dark:border-gray-600
            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Asunto */}
      <div>
        <label 
          htmlFor="subject" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Asunto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.subject 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 dark:border-gray-600'
            }
          `}
          placeholder="¿Sobre qué deseas consultarnos?"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
        )}
      </div>

      {/* Mensaje */}
      <div>
        <label 
          htmlFor="message" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors resize-none
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.message 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 dark:border-gray-600'
            }
          `}
          placeholder="Describe tu consulta en detalle..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.message.length} / 1000 caracteres
        </p>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isPending}
        className="
          w-full flex items-center justify-center gap-2 
          px-6 py-3 rounded-lg font-medium
          bg-brand-600 hover:bg-brand-700
          text-white
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Enviar mensaje
          </>
        )}
      </button>

      {/* Nota de privacidad */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Al enviar este formulario, aceptas nuestra{' '}
        <a href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">
          Política de Privacidad
        </a>
        .
      </p>
    </form>
  );
}
