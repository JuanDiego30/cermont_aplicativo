// Validaciones para autenticación
import * as z from 'zod';

export const esquemaLogin = z.object({
  correo: z.string().email('Correo inválido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
