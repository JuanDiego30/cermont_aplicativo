import { type ForgotPasswordFormData } from '../schemas/forgot-password-schema';
export declare function useForgotPassword(): {
    form: import("react-hook-form").UseFormReturn<{
        email: string;
    }, any, {
        email: string;
    }>;
    globalError: string;
    success: boolean;
    onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
    isSubmitting: boolean;
};
//# sourceMappingURL=useForgotPassword.d.ts.map