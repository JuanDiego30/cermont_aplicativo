import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../schemas/forgot-password-schema';
import { parseApiError } from '@/lib/utils/error-handler';
import { authService } from '@/services/auth.service';
export function useForgotPassword() {
    const [globalError, setGlobalError] = useState('');
    const [success, setSuccess] = useState(false);
    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onBlur',
    });
    const onSubmit = async (data) => {
        setGlobalError('');
        try {
            await authService.forgotPassword(data.email);
            setSuccess(true);
        }
        catch (error) {
            const message = parseApiError(error);
            setGlobalError(message);
            if (message.toLowerCase().includes('email')) {
                form.setError('email', { message });
            }
        }
    };
    return {
        form,
        globalError,
        success,
        onSubmit,
        isSubmitting: form.formState.isSubmitting,
    };
}
//# sourceMappingURL=useForgotPassword.js.map