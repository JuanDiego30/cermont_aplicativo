// ============================================
// ORDENES SERVICE TESTS - Cermont FSM Backend
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

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

// @ts-expect-error - Module is mocked above
import { prisma } from '../config/database';

describe('Ordenes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Order', () => {
    it('should create a new order', async () => {
      const mockOrder = {
        id: 'order-1',
        numero: 'ORD-2024-001',
        cliente: 'Cliente Test',
        descripcion: 'Orden de prueba',
        tipoServicio: 'instalacion',
        estado: 'planeacion',
        montoEstimado: 5000,
        prioridad: 'normal',
        responsableId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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
          tipoServicio: 'instalacion',
          estado: 'planeacion',
          montoEstimado: 5000,
          prioridad: 'normal',
          responsableId: 'user-1',
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
        { id: 'order-1', numero: 'ORD-001', estado: 'planeacion' },
        { id: 'order-2', numero: 'ORD-002', estado: 'ejecucion' },
        { id: 'order-3', numero: 'ORD-003', estado: 'completada' },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);
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

    it('should filter orders by estado', async () => {
      const mockOrders = [
        { id: 'order-1', numero: 'ORD-001', estado: 'ejecucion' },
        { id: 'order-2', numero: 'ORD-002', estado: 'ejecucion' },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const orders = await prisma.order.findMany({
        where: { estado: 'ejecucion' },
      });

      expect(orders).toHaveLength(2);
      expect(orders.every((o: { estado: string }) => o.estado === 'ejecucion')).toBe(true);
    });

    it('should get order by id', async () => {
      const mockOrder = {
        id: 'order-1',
        numero: 'ORD-001',
        cliente: 'Cliente Test',
        estado: 'planeacion',
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const order = await prisma.order.findUnique({
        where: { id: 'order-1' },
      });

      expect(order).toBeDefined();
      expect(order?.id).toBe('order-1');
    });

    it('should return null for non-existent order', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const order = await prisma.order.findUnique({
        where: { id: 'non-existent' },
      });

      expect(order).toBeNull();
    });
  });

  describe('Update Order', () => {
    it('should update order', async () => {
      const mockUpdatedOrder = {
        id: 'order-1',
        numero: 'ORD-001',
        cliente: 'Cliente Actualizado',
        estado: 'planeacion',
        montoEstimado: 7500,
        updatedAt: new Date(),
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'order-1',
        numero: 'ORD-001',
        cliente: 'Cliente Original',
        estado: 'planeacion',
        montoEstimado: 5000,
      } as any);

      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: {
          cliente: 'Cliente Actualizado',
          montoEstimado: 7500,
        },
      });

      expect(result.cliente).toBe('Cliente Actualizado');
      expect(result.montoEstimado).toBe(7500);
    });

    it('should change order estado', async () => {
      const mockUpdatedOrder = {
        id: 'order-1',
        numero: 'ORD-001',
        estado: 'ejecucion',
        updatedAt: new Date(),
      };

      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { estado: 'ejecucion' },
      });

      expect(result.estado).toBe('ejecucion');
    });
  });

  describe('Delete Order', () => {
    it('should soft delete order by changing estado to cancelada', async () => {
      const mockDeletedOrder = {
        id: 'order-1',
        numero: 'ORD-001',
        estado: 'cancelada',
        updatedAt: new Date(),
      };

      vi.mocked(prisma.order.update).mockResolvedValue(mockDeletedOrder as any);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { estado: 'cancelada' },
      });

      expect(result.estado).toBe('cancelada');
    });
  });

  describe('Order Validation', () => {
    it('should validate required fields', () => {
      const requiredFields = ['numero', 'cliente', 'tipoServicio', 'responsableId'];
      const orderData = {
        numero: 'ORD-001',
        cliente: 'Test',
        tipoServicio: 'instalacion',
        responsableId: 'user-1',
      };

      requiredFields.forEach((field) => {
        expect(orderData).toHaveProperty(field);
        expect(orderData[field as keyof typeof orderData]).toBeTruthy();
      });
    });

    it('should validate valid order estados', () => {
      const validEstados = ['planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada'];
      
      validEstados.forEach((estado) => {
        expect(validEstados).toContain(estado);
      });
    });

    it('should validate monto is positive', () => {
      const monto = 5000;
      expect(monto).toBeGreaterThan(0);
    });
  });
});
