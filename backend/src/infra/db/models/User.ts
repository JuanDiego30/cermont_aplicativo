import type { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';

type TestUserCreateProps = {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  avatar?: string | null;
  createdBy?: string | null;
  active?: boolean;
  mfaEnabled?: boolean;
  loginAttempts?: number;
  passwordHistory?: string;
  lastPasswordChange?: Date;
  passwordExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const defaultTestUserProps = {
  email: 'test@cermont.com',
  password: 'Test123!',
  name: 'Test User',
  role: 'test',
  avatar: null,
  active: true,
  mfaEnabled: false,
  loginAttempts: 0,
  passwordHistory: '[]',
};

const buildTestUserPayload = (overrides: TestUserCreateProps = {}): Prisma.UserUncheckedCreateInput => {
  const now = new Date();
  return {
    email: overrides.email ?? defaultTestUserProps.email,
    password: overrides.password ?? defaultTestUserProps.password,
    name: overrides.name ?? defaultTestUserProps.name,
    role: overrides.role ?? defaultTestUserProps.role,
    avatar: overrides.avatar ?? defaultTestUserProps.avatar,
    createdBy: overrides.createdBy ?? null,
    active: overrides.active ?? defaultTestUserProps.active,
    mfaEnabled: overrides.mfaEnabled ?? defaultTestUserProps.mfaEnabled,
    loginAttempts: overrides.loginAttempts ?? defaultTestUserProps.loginAttempts,
    passwordHistory: overrides.passwordHistory ?? defaultTestUserProps.passwordHistory,
    lastPasswordChange: overrides.lastPasswordChange ?? now,
    passwordExpiresAt: overrides.passwordExpiresAt ?? now,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
};

export const UserModel = {
  async create(data: TestUserCreateProps = {}) {
    const hashedPassword = await bcrypt.hash(data.password ?? defaultTestUserProps.password, 12);
    const payload = buildTestUserPayload({ ...data, password: hashedPassword });
    return prisma.user.create({ data: payload });
  },
  async deleteMany(args: Prisma.UserDeleteManyArgs = {}) {
    await prisma.refreshToken.deleteMany();
    await prisma.tokenBlacklist.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.kit.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.workPlan.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany(args);
  },
};
