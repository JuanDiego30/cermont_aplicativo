import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginFormData = z.infer<typeof loginSchema>;
//# sourceMappingURL=login-schema.d.ts.map