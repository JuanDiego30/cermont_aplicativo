import { z } from 'zod';
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Ingresa un email válido')
        .toLowerCase(),
});
//# sourceMappingURL=forgot-password-schema.js.map