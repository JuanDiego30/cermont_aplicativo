/// <reference types="jest" />
import { SyncRepository } from '../infrastructure/persistence/sync.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('SyncRepository', () => {
  let repo: SyncRepository;

  const mockPrisma = {
    pendingSync: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SyncRepository(mockPrisma);
  });

  it('savePending: si ya está synced, devuelve sin mutar', async () => {
    mockPrisma.pendingSync.findUnique = jest.fn().mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      deviceId: 'd1',
      entityType: 'ejecucion',
      entityId: 'e1',
      action: 'update',
      data: { a: 1 },
      localId: 'l1',
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      status: 'synced',
      error: null,
    });

    const result = await repo.savePending('u1', {
      entityType: 'ejecucion',
      entityId: 'e1',
      action: 'update',
      data: { a: 2 },
      localId: 'l1',
      timestamp: new Date().toISOString(),
      deviceId: 'd1',
    });

    expect(result.status).toBe('synced');
    expect(mockPrisma.pendingSync.upsert).not.toHaveBeenCalled();
  });

  it('savePending: usa upsert con clave compuesta', async () => {
    mockPrisma.pendingSync.findUnique = jest.fn().mockResolvedValue(null);
    mockPrisma.pendingSync.upsert = jest.fn().mockResolvedValue({
      id: 'p2',
      userId: 'u1',
      deviceId: 'd1',
      entityType: 'checklist',
      entityId: 'c1',
      action: 'update',
      data: { completada: true },
      localId: 'l2',
      timestamp: new Date('2025-01-01T00:00:00.000Z'),
      status: 'pending',
      error: null,
    });

    const result = await repo.savePending('u1', {
      entityType: 'checklist',
      entityId: 'c1',
      action: 'update',
      data: { completada: true },
      localId: 'l2',
      timestamp: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      deviceId: 'd1',
    });

    expect(mockPrisma.pendingSync.upsert).toHaveBeenCalledTimes(1);
    const call = (mockPrisma.pendingSync.upsert as jest.Mock).mock.calls[0][0];
    expect(call.where.pendingSync_user_device_local).toEqual({
      userId: 'u1',
      deviceId: 'd1',
      localId: 'l2',
    });
    expect(result.deviceId).toBe('d1');
    expect(result.localId).toBe('l2');
  });

  it('getPendingByUser: incluye status conflict', async () => {
    mockPrisma.pendingSync.findMany = jest.fn().mockResolvedValue([
      {
        id: 'p3',
        userId: 'u1',
        deviceId: 'd1',
        entityType: 'ejecucion',
        entityId: 'e1',
        action: 'update',
        data: { a: 1 },
        localId: 'l3',
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        status: 'conflict',
        error: 'Conflict',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await repo.getPendingByUser('u1');
    expect(result[0].status).toBe('conflict');
  });

  it('tryMarkAsProcessing: retorna true si adquiere lock', async () => {
    mockPrisma.pendingSync.updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const ok = await repo.tryMarkAsProcessing('p1');
    expect(ok).toBe(true);
    expect(mockPrisma.pendingSync.updateMany).toHaveBeenCalledTimes(1);
  });

  it('tryMarkAsProcessing: retorna false si no actualiza', async () => {
    mockPrisma.pendingSync.updateMany = jest.fn().mockResolvedValue({ count: 0 });
    const ok = await repo.tryMarkAsProcessing('p1');
    expect(ok).toBe(false);
  });
});
