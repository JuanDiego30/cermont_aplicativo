import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './AuthContext';
import { loginSchema, type LoginFormData } from './login-schema';
import { parseApiError } from '@/lib/utils/error-handler';

export function useLoginForm() {
  const [globalError, setGlobalError] = useState('');
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validar al salir del campo
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError('');
    try {
      await login(data.email, data.password);
      // Redirect automático en AuthContext
    } catch (error) {
      const errorMessage = parseApiError(error);
      setGlobalError(errorMessage);

      // Si el error es específico de un campo, mostrarlo ahí
      if (errorMessage.toLowerCase().includes('email')) {
        form.setError('email', { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes('contraseña')) {
        form.setError('password', { message: errorMessage });
      }
    }
  };

  return {
    form,
    globalError,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}
