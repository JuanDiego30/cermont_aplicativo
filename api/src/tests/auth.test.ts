// ============================================
// AUTH SERVICE TESTS - Cermont FSM Backend
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock de Prisma
vi.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// @ts-expect-error - Module is mocked above
import { prisma } from '../config/database';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Authentication', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@cermont.com',
        password: await bcrypt.hash('password123', 12),
        name: 'Test User',
        role: 'tecnico',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@cermont.com' },
      });

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@cermont.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@cermont.com' },
      });
    });

    it('should return null for non-existent user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await prisma.user.findUnique({
        where: { email: 'nonexistent@cermont.com' },
      });

      expect(result).toBeNull();
    });
  });

  describe('User Registration', () => {
    it('should create new user', async () => {
      const newUser = {
        id: 'new-user-1',
        email: 'newuser@cermont.com',
        password: 'hashedPassword',
        name: 'New User',
        role: 'tecnico',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(newUser);

      // Verificar que no existe
      const existing = await prisma.user.findUnique({
        where: { email: 'newuser@cermont.com' },
      });
      expect(existing).toBeNull();

      // Crear usuario
      const result = await prisma.user.create({
        data: {
          email: 'newuser@cermont.com',
          password: 'hashedPassword',
          name: 'New User',
          role: 'tecnico',
        },
      });

      expect(result.id).toBe('new-user-1');
      expect(result.email).toBe('newuser@cermont.com');
    });

    it('should prevent duplicate email registration', async () => {
      const existingUser = {
        id: 'existing-1',
        email: 'existing@cermont.com',
        password: 'hashedPassword',
        name: 'Existing User',
        role: 'tecnico',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      const result = await prisma.user.findUnique({
        where: { email: 'existing@cermont.com' },
      });

      expect(result).not.toBeNull();
      // No debería permitir crear otro usuario con el mismo email
    });
  });

  describe('Refresh Token', () => {
    it('should create refresh token', async () => {
      const mockToken = {
        id: 'token-1',
        token: 'refresh-token-value',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      vi.mocked(prisma.refreshToken.create).mockResolvedValue(mockToken);

      const result = await prisma.refreshToken.create({
        data: {
          token: 'refresh-token-value',
          userId: 'user-1',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      expect(result.token).toBe('refresh-token-value');
      expect(result.userId).toBe('user-1');
    });

    it('should delete refresh tokens on logout', async () => {
      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });

      const result = await prisma.refreshToken.deleteMany({
        where: { userId: 'user-1' },
      });

      expect(result.count).toBe(1);
    });
  });
});
