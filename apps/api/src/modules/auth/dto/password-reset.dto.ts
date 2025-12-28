import { z } from 'zod';

// ===========================
// DTO: Solicitar Reset de Contraseña
// ===========================
export const ForgotPasswordDtoSchema = z.object({
    email: z.string().email('Email inválido')
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

// ===========================
// DTO: Resetear Contraseña
// ===========================
export const ResetPasswordDtoSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        )
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

// ===========================
// DTO: Validar Token
// ===========================
export const ValidateResetTokenDtoSchema = z.object({
    token: z.string().min(1, 'Token requerido')
});

export type ValidateResetTokenDto = z.infer<typeof ValidateResetTokenDtoSchema>;
