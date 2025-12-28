import { z } from 'zod';

// ===========================
// DTO: Habilitar/Deshabilitar 2FA
// ===========================
export const Enable2FADtoSchema = z.object({
    enable: z.boolean()
});

export type Enable2FADto = z.infer<typeof Enable2FADtoSchema>;

// ===========================
// DTO: Solicitar Código 2FA
// ===========================
export const Request2FACodeDtoSchema = z.object({
    email: z.string().email('Email inválido')
});

export type Request2FACodeDto = z.infer<typeof Request2FACodeDtoSchema>;

// ===========================
// DTO: Verificar Código 2FA
// ===========================
export const Verify2FACodeDtoSchema = z.object({
    email: z.string().email('Email inválido'),
    code: z.string()
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^\d+$/, 'El código debe contener solo números')
});

export type Verify2FACodeDto = z.infer<typeof Verify2FACodeDtoSchema>;

// ===========================
// DTO: Login con 2FA
// ===========================
export const LoginWith2FADtoSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    code: z.string()
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^\d+$/, 'El código debe contener solo números'),
    rememberMe: z.boolean().optional()
});

export type LoginWith2FADto = z.infer<typeof LoginWith2FADtoSchema>;
