// Validaciones para usuarios
import * as z from 'zod';

export const esquemaUsuario = z.object({
  nombre: z.string().min(3, 'El nombre es obligatorio'),
  correo: z.string().email('Correo inválido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
