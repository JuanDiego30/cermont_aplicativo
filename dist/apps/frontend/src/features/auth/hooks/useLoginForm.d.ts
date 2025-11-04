import { type LoginFormData } from '../schemas/login-schema';
export declare function useLoginForm(): {
    form: import("react-hook-form").UseFormReturn<{
        email: string;
        password: string;
    }, any, {
        email: string;
        password: string;
    }>;
    globalError: string;
    onSubmit: (data: LoginFormData) => Promise<void>;
    isSubmitting: boolean;
};
//# sourceMappingURL=useLoginForm.d.ts.map