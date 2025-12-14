// Decorador para definir roles requeridos en rutas o controladores
// Uso: @Roles('admin', 'supervisor')

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
