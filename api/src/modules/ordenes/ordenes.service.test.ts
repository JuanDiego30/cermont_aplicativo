// 📁 api/src/modules/ordenes/ordenes.service.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdenesService } from './ordenes.service';
import { AppError } from '../../shared/errors/index';

// Mock del repository (if it existed) or just mock Prisma if Service uses Prisma directly.
// The service imports prisma directly: import { prisma } from '../../config/database.js';
// So we should mock prisma, not OrdenesRepository (which I don't see in the Service code I viewed).
// Service uses `prisma.order.findMany`, etc.
// So I need to mock `../../config/database.js`.

vi.mock('../../config/database', () => ({
    prisma: {
        order: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        $executeRawUnsafe: vi.fn(),
    },
}));

vi.mock('../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }),
}));

import { prisma } from '../../config/database';

describe('OrdenesService', () => {
    let service: OrdenesService;

    beforeEach(() => {
        service = new OrdenesService();
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create orden successfully', async () => {
            const createData = {
                descripcion: 'Test order',
                cliente: 'Test Client',
                prioridad: 'media' as const,
                fechaFinEstimada: new Date(Date.now() + 86400000).toISOString(),
            };

            (prisma.order.findFirst as any).mockResolvedValue({ numero: 'ORD-00000' });
            (prisma.order.create as any).mockResolvedValue({
                id: '1',
                numero: 'ORD-00001',
                ...createData,
                estado: 'planeacion',
                creadorId: 'user-1',
            });

            const result = await service.create(createData, 'user-1');

            expect(result.id).toBe('1');
            expect(result.numero).toBe('ORD-00001');
            expect(prisma.order.create).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should get orden by id', async () => {
            const mockOrden = { id: '1', numero: 'ORD-001' };
            (prisma.order.findUnique as any).mockResolvedValue(mockOrden);

            const result = await service.findById('1');

            expect(result.id).toBe('1');
            expect(prisma.order.findUnique).toHaveBeenCalled();
        });

        it('should throw AppError if orden not exists', async () => {
            (prisma.order.findUnique as any).mockResolvedValue(null);

            await expect(service.findById('999')).rejects.toThrow(AppError);
        });
    });

    describe('update', () => {
        it('should update orden successfully', async () => {
            const mockOrden = { id: '1', numero: 'ORD-001', cliente: 'Old Client' };
            const updated = { ...mockOrden, cliente: 'New Client' };

            (prisma.order.findUnique as any).mockResolvedValue(mockOrden);
            (prisma.order.update as any).mockResolvedValue(updated);

            const result = await service.update('1', { cliente: 'New Client' });

            expect(result.cliente).toBe('New Client');
        });
    });

    describe('changeStatus', () => {
        it('should update orden estado', async () => {
            const mockOrden = { id: '1', estado: 'planeacion' };
            const updated = { ...mockOrden, estado: 'completada' };

            (prisma.order.update as any).mockResolvedValue(updated);

            const result = await service.changeStatus('1', 'completada');

            expect(result.estado).toBe('completada');
        });
    });
});
