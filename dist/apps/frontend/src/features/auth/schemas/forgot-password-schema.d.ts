import { z } from 'zod';
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
//# sourceMappingURL=forgot-password-schema.d.ts.map