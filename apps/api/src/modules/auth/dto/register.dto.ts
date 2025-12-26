import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Regex para password: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export const RegisterSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),

  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(
      PASSWORD_REGEX,
      'La contraseña debe contener al menos 1 mayúscula, 1 minúscula y 1 número'
    ),

  name: z.string()
    .min(2, 'El nombre debe tener mínimo 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  role: z.enum(['admin', 'supervisor', 'tecnico']).optional(),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido')
    .optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// Para Swagger
export class RegisterDtoSwagger implements RegisterDto {
  @ApiProperty({ example: 'usuario@cermont.com' })
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número'
  })
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name!: string;

  @ApiProperty({ enum: ['admin', 'supervisor', 'tecnico'], required: false })
  role?: 'admin' | 'supervisor' | 'tecnico';

  @ApiProperty({ example: '+573001234567', required: false })
  phone?: string;
}
