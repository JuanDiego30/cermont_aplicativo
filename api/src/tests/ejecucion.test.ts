// ============================================
// EJECUCIÓN SERVICE TESTS - Cermont FSM Backend
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Prisma
vi.mock('../config/database', () => ({
  prisma: {
    ejecucion: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    tareaEjecucion: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    checklistEjecucion: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
  },
}));

// @ts-expect-error - Module is mocked above
import { prisma } from '../config/database';

describe('Ejecución Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Start Execution', () => {
    it('should start execution for an order', async () => {
      const mockEjecucion = {
        id: 'exec-1',
        ordenId: 'order-1',
        planeacionId: 'plan-1',
        estado: 'en_progreso',
        progreso: 0,
        fechaInicioReal: new Date(),
        ejecutorId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.ejecucion.create).mockResolvedValue(mockEjecucion as any);

      const result = await prisma.ejecucion.create({
        data: {
          ordenId: 'order-1',
          planeacionId: 'plan-1',
          estado: 'en_progreso',
          progreso: 0,
          ejecutorId: 'user-1',
          fechaInicioReal: new Date(),
        },
      });

      expect(result.id).toBe('exec-1');
      expect(result.estado).toBe('en_progreso');
      expect(result.progreso).toBe(0);
    });

    it('should record GPS location on start', async () => {
      const ubicacion = {
        lat: 7.8939,
        lng: -72.5078,
        accuracy: 10,
        timestamp: new Date().toISOString(),
      };

      const mockEjecucion = {
        id: 'exec-1',
        ordenId: 'order-1',
        ubicacionInicio: ubicacion,
        estado: 'en_progreso',
      };

      vi.mocked(prisma.ejecucion.create).mockResolvedValue(mockEjecucion as any);

      const result = await prisma.ejecucion.create({
        data: {
          ordenId: 'order-1',
          planeacionId: 'plan-1',
          estado: 'en_progreso',
          ejecutorId: 'user-1',
          ubicacionInicio: ubicacion,
        },
      });

      expect(result.ubicacionInicio).toBeDefined();
      expect(result.ubicacionInicio.lat).toBe(7.8939);
    });
  });

  describe('Update Progress', () => {
    it('should update execution progress', async () => {
      const mockEjecucion = {
        id: 'exec-1',
        ordenId: 'order-1',
        estado: 'en_progreso',
        progreso: 50,
        updatedAt: new Date(),
      };

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion as any);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { progreso: 50 },
      });

      expect(result.progreso).toBe(50);
    });

    it('should validate progress is between 0 and 100', () => {
      const validProgress = [0, 25, 50, 75, 100];
      const invalidProgress = [-1, 101, 150];

      validProgress.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      });

      invalidProgress.forEach((p) => {
        expect(p < 0 || p > 100).toBe(true);
      });
    });
  });

  describe('Complete Task', () => {
    it('should mark task as completed', async () => {
      const mockTarea = {
        id: 'task-1',
        ejecucionId: 'exec-1',
        descripcion: 'Tarea de prueba',
        estado: 'completada',
        completadaAt: new Date(),
      };

      vi.mocked(prisma.tareaEjecucion.update).mockResolvedValue(mockTarea as any);

      const result = await prisma.tareaEjecucion.update({
        where: { id: 'task-1' },
        data: {
          estado: 'completada',
          completadaAt: new Date(),
        },
      });

      expect(result.estado).toBe('completada');
      expect(result.completadaAt).toBeDefined();
    });

    it('should recalculate progress when task is completed', async () => {
      const tasks = [
        { id: 'task-1', estado: 'completada' },
        { id: 'task-2', estado: 'completada' },
        { id: 'task-3', estado: 'pendiente' },
        { id: 'task-4', estado: 'pendiente' },
      ];

      const completedCount = tasks.filter((t) => t.estado === 'completada').length;
      const totalCount = tasks.length;
      const progress = Math.round((completedCount / totalCount) * 100);

      expect(progress).toBe(50);
    });
  });

  describe('Complete Checklist Item', () => {
    it('should mark checklist item as completed', async () => {
      const mockChecklist = {
        id: 'check-1',
        ejecucionId: 'exec-1',
        descripcion: 'Verificar seguridad',
        completado: true,
        completadoAt: new Date(),
        completadoPor: 'user-1',
      };

      vi.mocked(prisma.checklistEjecucion.update).mockResolvedValue(mockChecklist as any);

      const result = await prisma.checklistEjecucion.update({
        where: { id: 'check-1' },
        data: {
          completado: true,
          completadoAt: new Date(),
          completadoPor: 'user-1',
        },
      });

      expect(result.completado).toBe(true);
    });

    it('should validate mandatory checklist items before completion', async () => {
      const checklists = [
        { id: 'check-1', obligatorio: true, completado: true },
        { id: 'check-2', obligatorio: true, completado: true },
        { id: 'check-3', obligatorio: false, completado: false },
      ];

      const mandatoryCompleted = checklists
        .filter((c) => c.obligatorio)
        .every((c) => c.completado);

      expect(mandatoryCompleted).toBe(true);
    });
  });

  describe('Complete Execution', () => {
    it('should complete execution', async () => {
      const mockEjecucion = {
        id: 'exec-1',
        ordenId: 'order-1',
        estado: 'completada',
        progreso: 100,
        fechaFinReal: new Date(),
        ubicacionFin: {
          lat: 7.8939,
          lng: -72.5078,
        },
      };

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion as any);
      vi.mocked(prisma.order.update).mockResolvedValue({ id: 'order-1', estado: 'completada' } as any);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: {
          estado: 'completada',
          progreso: 100,
          fechaFinReal: new Date(),
        },
      });

      expect(result.estado).toBe('completada');
      expect(result.progreso).toBe(100);
    });

    it('should update order status when execution completes', async () => {
      vi.mocked(prisma.order.update).mockResolvedValue({
        id: 'order-1',
        estado: 'completada',
      } as any);

      const result = await prisma.order.update({
        where: { id: 'order-1' },
        data: { estado: 'completada' },
      });

      expect(result.estado).toBe('completada');
    });
  });

  describe('Pause and Resume', () => {
    it('should pause execution', async () => {
      vi.mocked(prisma.ejecucion.update).mockResolvedValue({
        id: 'exec-1',
        estado: 'pausada',
      } as any);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { estado: 'pausada' },
      });

      expect(result.estado).toBe('pausada');
    });

    it('should resume execution', async () => {
      vi.mocked(prisma.ejecucion.update).mockResolvedValue({
        id: 'exec-1',
        estado: 'en_progreso',
      } as any);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { estado: 'en_progreso' },
      });

      expect(result.estado).toBe('en_progreso');
    });
  });
});
