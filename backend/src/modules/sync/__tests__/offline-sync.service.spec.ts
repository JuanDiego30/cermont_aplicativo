/**
 * @test OfflineSyncService
 *
 * Unit tests para el servicio de sincronización offline.
 */
/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OfflineSyncService } from '../services/offline-sync.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOfflinePayload } from '../interfaces/sync-state.interface';

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ejecucion: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    checklistItemEjecucion: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    syncLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfflineSyncService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<OfflineSyncService>(OfflineSyncService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildOfflineChecklist', () => {
    it('debería construir payload offline correctamente', async () => {
      const mockEjecucion = {
        id: 'ejecucion-123',
        orden: {
          id: 'orden-123',
          numero: 'OT-2024-001',
        },
        checklists: [
          {
            id: 'checklist-1',
            items: [
              {
                id: 'item-1',
                nombre: 'Verificar arnés',
                estado: 'pendiente',
                completado: false,
                completadoEn: null,
                observaciones: null,
                createdAt: new Date(),
              },
              {
                id: 'item-2',
                nombre: 'Inspeccionar casco',
                estado: 'completado',
                completado: true,
                completadoEn: new Date(),
                observaciones: 'En buen estado',
                createdAt: new Date(),
              },
            ],
          },
        ],
      };

      mockPrismaService.ejecucion.findUnique.mockResolvedValue(mockEjecucion);

      const result = await service.buildOfflineChecklist('ejecucion-123');

      expect(result).toBeDefined();
      expect(result.ejecucionId).toBe('ejecucion-123');
      expect(result.ordenId).toBe('orden-123');
      expect(result.numeroOrden).toBe('OT-2024-001');
      expect(result.items).toHaveLength(2);
      expect(result.schemaVersion).toBe(1);
    });

    it('debería lanzar error si ejecución no existe', async () => {
      mockPrismaService.ejecucion.findUnique.mockResolvedValue(null);

      await expect(service.buildOfflineChecklist('no-existe')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateOfflineIntegrity', () => {
    const validPayload: IOfflinePayload = {
      ejecucionId: 'ejecucion-123',
      ordenId: 'orden-123',
      numeroOrden: 'OT-2024-001',
      items: [
        {
          id: 'item-1',
          nombre: 'Item 1',
          estado: 'completado',
          checklistId: 'checklist-1',
          orden: 0,
        },
        {
          id: 'item-2',
          nombre: 'Item 2',
          estado: 'pendiente',
          checklistId: 'checklist-1',
          orden: 1,
        },
      ],
      timestamp: new Date(),
      deviceId: 'device-123',
      schemaVersion: 1,
    };

    it('debería validar payload correcto', async () => {
      mockPrismaService.checklistItemEjecucion.findMany.mockResolvedValue([
        { id: 'item-1' },
        { id: 'item-2' },
      ]);

      const result = await service.validateOfflineIntegrity(validPayload);

      expect(result).toBe(true);
    });

    it('debería detectar items duplicados', async () => {
      const payloadConDuplicados: IOfflinePayload = {
        ...validPayload,
        items: [
          { ...validPayload.items[0] },
          { ...validPayload.items[0] }, // Duplicado
        ],
      };

      await expect(service.validateOfflineIntegrity(payloadConDuplicados)).rejects.toThrow(
        'Payload contiene items duplicados'
      );
    });

    it('debería detectar estados inválidos', async () => {
      const payloadConEstadoInvalido: IOfflinePayload = {
        ...validPayload,
        items: [
          {
            ...validPayload.items[0],
            estado: 'invalido' as any,
          },
        ],
      };

      await expect(service.validateOfflineIntegrity(payloadConEstadoInvalido)).rejects.toThrow(
        'Estado inválido'
      );
    });

    it('debería detectar items que no existen en BD', async () => {
      mockPrismaService.checklistItemEjecucion.findMany.mockResolvedValue([
        { id: 'item-1' }, // Solo uno de los dos
      ]);

      await expect(service.validateOfflineIntegrity(validPayload)).rejects.toThrow(
        'Items no encontrados en BD'
      );
    });
  });

  describe('syncWhenOnline', () => {
    const mockPayload: IOfflinePayload = {
      ejecucionId: 'ejecucion-123',
      ordenId: 'orden-123',
      numeroOrden: 'OT-2024-001',
      items: [
        {
          id: 'item-1',
          nombre: 'Item 1',
          estado: 'completado',
          checklistId: 'checklist-1',
          orden: 0,
        },
      ],
      timestamp: new Date(),
      deviceId: 'device-123',
      schemaVersion: 1,
    };

    it('debería sincronizar exitosamente', async () => {
      mockPrismaService.checklistItemEjecucion.findMany.mockResolvedValue([{ id: 'item-1' }]);

      mockPrismaService.$transaction.mockImplementation(async callback => {
        return callback({
          checklistItemEjecucion: {
            update: jest.fn().mockResolvedValue({}),
          },
          ejecucion: {
            update: jest.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.syncWhenOnline(mockPayload, 'user-123');

      expect(result.success).toBe(true);
      expect(result.tipo).toBe('EJECUCION');
    });
  });
});
