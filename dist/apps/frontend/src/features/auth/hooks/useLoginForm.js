import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../components/AuthContext';
import { loginSchema } from '../schemas/login-schema';
import { parseApiError } from '@/lib/utils/error-handler';
export function useLoginForm() {
    const [globalError, setGlobalError] = useState('');
    const { login } = useAuth();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });
    const onSubmit = async (data) => {
        setGlobalError('');
        try {
            await login(data.email, data.password);
        }
        catch (error) {
            const errorMessage = parseApiError(error);
            setGlobalError(errorMessage);
            if (errorMessage.toLowerCase().includes('email')) {
                form.setError('email', { message: errorMessage });
            }
            else if (errorMessage.toLowerCase().includes('contraseña')) {
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
//# sourceMappingURL=useLoginForm.js.map