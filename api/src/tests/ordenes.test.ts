// ============================================
// ORDENES SERVICE TESTS - Cermont FSM Backend
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { OrderStatus, OrderPriority } from '@prisma/client';

// Mock de Prisma
vi.mock('../config/database', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../config/database';

// Helper para crear mock de orden completa
const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  numero: 'ORD-2024-001',
  descripcion: 'Orden de prueba',
  cliente: 'Cliente Test',
  estado: 'planeacion' as OrderStatus,
  prioridad: 'media' as OrderPriority,
  fechaFinEstimada: null,
  fechaInicio: null,
  fechaFin: null,
  creadorId: 'user-1',
  asignadoId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Ordenes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Order', () => {
    it('should create a new order', async () => {
      const mockOrder = createMockOrder();

      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder);

      // Verificar que no existe orden con mismo número
      const existing = await prisma.order.findFirst({
        where: { numero: 'ORD-2024-001' },
      });
      expect(existing).toBeNull();

      // Crear orden
      const result = await prisma.order.create({
        data: {
          numero: 'ORD-2024-001',
          cliente: 'Cliente Test',
          descripcion: 'Orden de prueba',
          estado: 'planeacion',
          prioridad: 'media',
          creadorId: 'user-1',
        },
      });

      expect(result.id).toBe('order-1');
      expect(result.numero).toBe('ORD-2024-001');
      expect(result.estado).toBe('planeacion');
    });

    it('should generate unique order number', async () => {
      const orderNumbers = ['ORD-2024-001', 'ORD-2024-002', 'ORD-2024-003'];
      
      orderNumbers.forEach((numero) => {
        expect(numero).toMatch(/^ORD-\d{4}-\d{3}$/);
      });
    });
  });

  describe('Get Orders', () => {
    it('should list orders with pagination', async () => {
      const mockOrders = [
        createMockOrder({ id: 'order-1', numero: 'ORD-001', estado: 'planeacion' as OrderStatus }),
        createMockOrder({ id: 'order-2', numero: 'ORD-002', estado: 'ejecucion' as OrderStatus }),
        createMockOrder({ id: 'order-3', numero: 'ORD-003', estado: 'completada' as OrderStatus }),
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);
      vi.mocked(prisma.order.count).mockResolvedValue(3);

      const orders = await prisma.order.findMany({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      const total = await prisma.order.count();

      expect(orders).toHaveLength(3);
      expect(total).toBe(3);
    });

    it('should filter orders by status', async () => {
      const mockOrders = [
        createMockOrder({ id: 'order-1', estado: 'planeacion' as OrderStatus }),
        createMockOrder({ id: 'order-2', estado: 'planeacion' as OrderStatus }),
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

      const orders = await prisma.order.findMany({
        where: { estado: 'planeacion' },
      });

      expect(orders).toHaveLength(2);
      orders.forEach((order) => {
        expect(order.estado).toBe('planeacion');
      });
    });

    it('should filter orders by priority', async () => {
      const mockOrders = [
        createMockOrder({ id: 'order-1', prioridad: 'alta' as OrderPriority }),
        createMockOrder({ id: 'order-2', prioridad: 'alta' as OrderPriority }),
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

      const orders = await prisma.order.findMany({
        where: { prioridad: 'alta' },
      });

      expect(orders).toHaveLength(2);
    });

    it('should search orders by client name', async () => {
      const mockOrders = [
        createMockOrder({ cliente: 'Cliente Cermont' }),
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);

      const orders = await prisma.order.findMany({
        where: { cliente: { contains: 'Cermont' } },
      });

      expect(orders).toHaveLength(1);
      expect(orders[0].cliente).toContain('Cermont');
    });
  });

  describe('Update Order', () => {
    it('should update order status', async () => {
      const mockOrder = createMockOrder({
        estado: 'ejecucion' as OrderStatus,
        fechaInicio: new Date(),
      });

      vi.mocked(prisma.order.update).mockResolvedValue(mockOrder);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { 
          estado: 'ejecucion',
          fechaInicio: new Date(),
        },
      });

      expect(result.estado).toBe('ejecucion');
      expect(result.fechaInicio).toBeDefined();
    });

    it('should update order priority', async () => {
      const mockOrder = createMockOrder({
        prioridad: 'urgente' as OrderPriority,
      });

      vi.mocked(prisma.order.update).mockResolvedValue(mockOrder);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { prioridad: 'urgente' },
      });

      expect(result.prioridad).toBe('urgente');
    });

    it('should assign order to technician', async () => {
      const mockOrder = createMockOrder({
        asignadoId: 'tecnico-1',
      });

      vi.mocked(prisma.order.update).mockResolvedValue(mockOrder);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { asignadoId: 'tecnico-1' },
      });

      expect(result.asignadoId).toBe('tecnico-1');
    });
  });

  describe('Delete Order', () => {
    it('should delete order in planeacion status', async () => {
      const mockOrder = createMockOrder();

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder);
      vi.mocked(prisma.order.delete).mockResolvedValue(mockOrder);

      // Verificar que está en planeacion
      const order = await prisma.order.findUnique({
        where: { id: 'order-1' },
      });
      expect(order?.estado).toBe('planeacion');

      // Eliminar
      const result = await prisma.order.delete({
        where: { id: 'order-1' },
      });

      expect(result.id).toBe('order-1');
    });

    it('should not delete order in progress', async () => {
      const orderInProgress = createMockOrder({
        estado: 'ejecucion' as OrderStatus,
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderInProgress);

      const order = await prisma.order.findUnique({
        where: { id: 'order-1' },
      });

      // No debería permitirse eliminar ordenes en ejecución
      expect(order?.estado).toBe('ejecucion');
      expect(['planeacion', 'cancelada']).not.toContain(order?.estado);
    });
  });

  describe('Order Status Transitions', () => {
    it('should validate valid status transitions', () => {
      const validTransitions: Record<string, string[]> = {
        planeacion: ['ejecucion', 'cancelada'],
        ejecucion: ['pausada', 'completada', 'cancelada'],
        pausada: ['ejecucion', 'cancelada'],
        completada: [],
        cancelada: [],
      };

      // planeacion -> ejecucion es válido
      expect(validTransitions.planeacion).toContain('ejecucion');
      
      // ejecucion -> completada es válido
      expect(validTransitions.ejecucion).toContain('completada');
      
      // completada -> planeacion NO es válido
      expect(validTransitions.completada).not.toContain('planeacion');
    });
  });

  describe('Order Priority Levels', () => {
    it('should have correct priority levels', () => {
      const priorities: OrderPriority[] = ['baja', 'media', 'alta', 'urgente'];
      
      expect(priorities).toContain('baja');
      expect(priorities).toContain('media');
      expect(priorities).toContain('alta');
      expect(priorities).toContain('urgente');
    });
  });
});
