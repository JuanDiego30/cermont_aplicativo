import type { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma.js';
import { randomUUID } from 'crypto';

// UserRole como tipo string ya que Prisma no genera enum
type UserRole = 'ADMIN' | 'COORDINADOR' | 'TECHNICIAN' | 'CLIENTE';

/**
 * Props para crear usuarios de prueba de forma flexible
 */
type TestUserCreateProps = {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole; // Usar Enum de Prisma
  avatar?: string | null;
  active?: boolean;
  
  // Campos de seguridad (adaptar según schema.prisma real)
  mfaEnabled?: boolean;
  loginAttempts?: number;
  lockedUntil?: Date | null;
  
  // Campos profesionales (adaptar según schema.prisma real)
  phoneNumber?: string | null;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
};

const defaultTestUserProps = {
  email: 'test@cermont.com',
  password: 'Test123!',
  name: 'Test User',
  role: 'TECHNICIAN' as UserRole, // Default seguro
  active: true,
  mfaEnabled: false,
  loginAttempts: 0,
};

export const UserModel = {
  /**
   * Crea un usuario con password hasheado (bcrypt 12 rounds)
   */
  async create(data: TestUserCreateProps = {}) {
    const plainPassword = data.password ?? defaultTestUserProps.password;
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    const now = new Date();

    // Construcción del payload compatible con Prisma UserUncheckedCreateInput
    // Nota: Ajusta los campos según tu schema.prisma actual si cambiaste a JSON columns
    const payload: Prisma.UserUncheckedCreateInput = {
      id: data.id ?? randomUUID(),
      email: data.email ?? `test-${randomUUID()}@example.com`,
      password: hashedPassword,
      name: data.name ?? defaultTestUserProps.name,
      role: data.role ?? defaultTestUserProps.role,
      active: data.active ?? defaultTestUserProps.active,
      
      // Campos opcionales
      avatar: data.avatar ?? null,
      mfaEnabled: data.mfaEnabled ?? false,
      loginAttempts: data.loginAttempts ?? 0,
      lockedUntil: data.lockedUntil ?? null,
      
      // Campos requeridos de seguridad
      lastPasswordChange: now,
      passwordExpiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 días
      
      // Timestamps
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
      
      // Otros campos requeridos por tu schema que puedan tener defaults
      // ...
    };

    return prisma.user.create({ data: payload });
  },

  /**
   * Limpieza TOTAL de la base de datos para entornos de test.
   * ADVERTENCIA: Borra datos en cascada manualmente para evitar errores de FK.
   */
  async dbCleanup() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: Intentando borrar BD en producción via UserModel.dbCleanup()');
    }

    // Orden inverso a las dependencias para evitar FK constraints
    // 1. Logs y Tokens (Hojas)
    await prisma.auditLog.deleteMany();
    await prisma.tokenBlacklist.deleteMany();
    await prisma.refreshToken.deleteMany();
    
    // 2. Evidencias (Dependen de Orden)
    await prisma.evidence.deleteMany();
    
    // 3. WorkPlans (Dependen de Orden)
    // Primero ítems internos si existen tablas separadas
    await prisma.workPlan.deleteMany();
    
    // 4. Kits (Independientes o referenciados)
    await prisma.kit.deleteMany();
    
    // 5. Órdenes (Núcleo)
    await prisma.order.deleteMany();
    
    // 6. Usuarios (Raíz)
    await prisma.user.deleteMany();
  },
};

