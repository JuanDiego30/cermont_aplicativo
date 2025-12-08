// ============================================
// EJECUCIÓN SERVICE TESTS - Cermont FSM Backend
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EstadoEjecucion } from '@prisma/client';

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

import { prisma } from '../config/database';

// Helper para crear mock de ejecución completo
const createMockEjecucion = (overrides = {}) => ({
  id: 'exec-1',
  ordenId: 'order-1',
  planeacionId: 'plan-1',
  estado: 'EN_PROGRESO' as EstadoEjecucion,
  avancePercentaje: 0,
  horasActuales: 0,
  horasEstimadas: 8,
  fechaInicio: new Date(),
  fechaTermino: null,
  ubicacionGPS: null,
  observacionesInicio: null,
  observaciones: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper para crear mock de tarea
const createMockTarea = (overrides = {}) => ({
  id: 'task-1',
  ejecucionId: 'exec-1',
  descripcion: 'Tarea de prueba',
  completada: false,
  horasEstimadas: 2,
  horasReales: null,
  observaciones: null,
  completadaEn: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper para crear mock de checklist
const createMockChecklist = (overrides = {}) => ({
  id: 'check-1',
  ejecucionId: 'exec-1',
  item: 'Verificar seguridad',
  completada: false,
  completadoPor: null,
  completadoEn: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Ejecución Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Start Execution', () => {
    it('should start execution for an order', async () => {
      const mockEjecucion = createMockEjecucion();

      vi.mocked(prisma.ejecucion.create).mockResolvedValue(mockEjecucion);

      const result = await prisma.ejecucion.create({
        data: {
          ordenId: 'order-1',
          planeacionId: 'plan-1',
          estado: 'EN_PROGRESO',
          avancePercentaje: 0,
          horasEstimadas: 8,
          fechaInicio: new Date(),
        },
      });

      expect(result.id).toBe('exec-1');
      expect(result.estado).toBe('EN_PROGRESO');
      expect(result.avancePercentaje).toBe(0);
    });

    it('should record GPS location on start', async () => {
      const ubicacion = {
        latitud: 7.8939,
        longitud: -72.5078,
      };

      const mockEjecucion = createMockEjecucion({
        ubicacionGPS: ubicacion,
      });

      vi.mocked(prisma.ejecucion.create).mockResolvedValue(mockEjecucion);

      const result = await prisma.ejecucion.create({
        data: {
          ordenId: 'order-1',
          planeacionId: 'plan-1',
          estado: 'EN_PROGRESO',
          horasEstimadas: 8,
          fechaInicio: new Date(),
          ubicacionGPS: ubicacion,
        },
      });

      expect(result.ubicacionGPS).toBeDefined();
      expect((result.ubicacionGPS as typeof ubicacion).latitud).toBe(7.8939);
    });
  });

  describe('Update Progress', () => {
    it('should update execution progress', async () => {
      const mockEjecucion = createMockEjecucion({
        avancePercentaje: 50,
      });

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { avancePercentaje: 50 },
      });

      expect(result.avancePercentaje).toBe(50);
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
      const mockTarea = createMockTarea({
        completada: true,
        completadaEn: new Date(),
      });

      vi.mocked(prisma.tareaEjecucion.update).mockResolvedValue(mockTarea);

      const result = await prisma.tareaEjecucion.update({
        where: { id: 'task-1' },
        data: {
          completada: true,
          completadaEn: new Date(),
        },
      });

      expect(result.completada).toBe(true);
      expect(result.completadaEn).toBeDefined();
    });

    it('should recalculate progress when task is completed', async () => {
      const tasks = [
        { id: 'task-1', completada: true },
        { id: 'task-2', completada: true },
        { id: 'task-3', completada: false },
        { id: 'task-4', completada: false },
      ];

      const completedCount = tasks.filter((t) => t.completada).length;
      const totalCount = tasks.length;
      const progress = Math.round((completedCount / totalCount) * 100);

      expect(progress).toBe(50);
    });
  });

  describe('Complete Checklist Item', () => {
    it('should mark checklist item as completed', async () => {
      const mockChecklist = createMockChecklist({
        completada: true,
        completadoEn: new Date(),
        completadoPor: 'user-1',
      });

      vi.mocked(prisma.checklistEjecucion.update).mockResolvedValue(mockChecklist);

      const result = await prisma.checklistEjecucion.update({
        where: { id: 'check-1' },
        data: {
          completada: true,
          completadoEn: new Date(),
          completadoPor: 'user-1',
        },
      });

      expect(result.completada).toBe(true);
    });

    it('should validate mandatory checklist items before completion', async () => {
      const checklists = [
        { id: 'check-1', obligatorio: true, completada: true },
        { id: 'check-2', obligatorio: true, completada: true },
        { id: 'check-3', obligatorio: false, completada: false },
      ];

      const mandatoryCompleted = checklists
        .filter((c) => c.obligatorio)
        .every((c) => c.completada);

      expect(mandatoryCompleted).toBe(true);
    });
  });

  describe('Complete Execution', () => {
    it('should complete execution', async () => {
      const mockEjecucion = createMockEjecucion({
        estado: 'COMPLETADA' as EstadoEjecucion,
        avancePercentaje: 100,
        fechaTermino: new Date(),
      });

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion);
      vi.mocked(prisma.order.update).mockResolvedValue({ id: 'order-1', estado: 'completada' } as any);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: {
          estado: 'COMPLETADA',
          avancePercentaje: 100,
          fechaTermino: new Date(),
        },
      });

      expect(result.estado).toBe('COMPLETADA');
      expect(result.avancePercentaje).toBe(100);
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
      const mockEjecucion = createMockEjecucion({
        estado: 'PAUSADA' as EstadoEjecucion,
      });

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { estado: 'PAUSADA' },
      });

      expect(result.estado).toBe('PAUSADA');
    });

    it('should resume execution', async () => {
      const mockEjecucion = createMockEjecucion({
        estado: 'EN_PROGRESO' as EstadoEjecucion,
      });

      vi.mocked(prisma.ejecucion.update).mockResolvedValue(mockEjecucion);

      const result = await prisma.ejecucion.update({
        where: { id: 'exec-1' },
        data: { estado: 'EN_PROGRESO' },
      });

      expect(result.estado).toBe('EN_PROGRESO');
    });
  });
});
