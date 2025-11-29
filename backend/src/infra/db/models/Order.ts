import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js'; // Asegúrate que prisma exporta la instancia como { prisma } o default
import { UserModel } from './User.js';

/**
 * Tipo simplificado para creación rápida en tests/seeds
 */
type TestOrderCreateData = {
  clientName: string;
  description: string;
  location?: string;
  state?: string; // Idealmente usar OrderState enum
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

/**
 * Helper para asegurar que exista un usuario para asignar la orden
 * (Útil en entornos de prueba o seeds)
 */
const ensureTestUser = async (preferredId?: string) => {
  if (preferredId) {
    const found = await prisma.user.findUnique({ where: { id: preferredId } });
    if (found) return found;
  }

  // Intentar encontrar cualquiera
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser;

  // Si no hay nadie, crear uno dummy
  return UserModel.create({
    email: `test-user-${randomUUID()}@example.com`,
    name: 'Test User Auto',
    role: 'TECHNICIAN',
  });
};

export const OrderModel = {
  /**
   * Wrapper para crear órdenes en tests/seeds con defaults inteligentes
   */
  async create(data: TestOrderCreateData) {
    // Asegurar integridad referencial básica
    const responsibleUser = await ensureTestUser(data.responsibleId);
    const creatorUser = await ensureTestUser(data.createdBy);

    const now = new Date();
    
    const orderPayload: Prisma.OrderUncheckedCreateInput = {
      // IDs obligatorios
      id: randomUUID(),
      orderNumber: data.orderNumber ?? `TEST-${randomUUID().substring(0, 8).toUpperCase()}`,
      
      // Campos de negocio
      clientName: data.clientName,
      description: data.description,
      location: data.location ?? 'Sin ubicación',
      state: data.state ?? 'SOLICITUD',
      priority: data.priority ?? 'MEDIA',
      
      // Relaciones
      responsibleId: data.responsibleId ?? responsibleUser.id,
      createdBy: data.createdBy ?? creatorUser.id,
      
      // Opcionales
      clientEmail: data.clientEmail ?? null,
      clientPhone: data.clientPhone ?? null,
      estimatedHours: data.estimatedHours ?? 0,
      archived: data.archived ?? false,
      
      // Timestamps
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    };

    return prisma.order.create({ data: orderPayload });
  },

  /**
   * Exponer deleteMany para limpieza en tests
   */
  deleteMany: (args?: Prisma.OrderDeleteManyArgs) => prisma.order.deleteMany(args),
  
  /**
   * Exponer findMany para aserciones
   */
  findMany: (args?: Prisma.OrderFindManyArgs) => prisma.order.findMany(args),
};

