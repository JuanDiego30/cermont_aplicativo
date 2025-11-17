import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
import { UserModel } from './User.js';

type TestOrderCreateData = {
  clientName: string;
  description: string;
  location?: string;
  state?: string;
  priority?: string;
  responsibleId?: string;
  createdBy?: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  estimatedHours?: number;
  archived?: boolean;
  orderNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const ensureTestUser = async (preferredId?: string) => {
  if (preferredId) {
    const found = await prisma.user.findUnique({ where: { id: preferredId } });
    if (found) return found;
  }

  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser;

  return UserModel.create({});
};

export const OrderModel = {
  async create(data: TestOrderCreateData) {
    const user = await ensureTestUser(data.responsibleId ?? data.createdBy);
    const now = new Date();
    const orderPayload: Prisma.OrderUncheckedCreateInput = {
      orderNumber: data.orderNumber ?? ('TEST-' + randomUUID()),
      clientName: data.clientName,
      description: data.description,
      location: data.location ?? '',
      state: data.state ?? 'SOLICITUD',
      priority: data.priority ?? 'NORMAL',
      responsibleId: data.responsibleId ?? user.id,
      createdBy: data.createdBy ?? user.id,
      clientEmail: data.clientEmail ?? null,
      clientPhone: data.clientPhone ?? null,
      estimatedHours: data.estimatedHours ?? 0,
      archived: data.archived ?? false,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    };

    return prisma.order.create({ data: orderPayload });
  },
  deleteMany: (args?: Prisma.OrderDeleteManyArgs) => prisma.order.deleteMany(args),
};
