// 📁 api/src/modules/ordenes/ordenes.service.test.ts
// Vibe Coding - Unit Tests for OrdenesService with State Machine

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdenesService } from './ordenes.service';
import { NotFoundError, ValidationError } from '../../shared/errors/index';

// Mock repository
vi.mock('./ordenes.repository', () => ({
    ordenesRepository: {
        findMany: vi.fn(),
        findById: vi.fn(),
        findByNumero: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getStats: vi.fn(),
    },
}));

// Mock database for order number generation
vi.mock('../../config/database', () => ({
    prisma: {
        order: {
            findFirst: vi.fn(),
        },
    },
}));

// Mock logger
vi.mock('../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    }),
}));

import { ordenesRepository } from './ordenes.repository';
import { prisma } from '../../config/database';

describe('OrdenesService', () => {
    let service: OrdenesService;

    beforeEach(() => {
        service = new OrdenesService();
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create orden with auto-generated number', async () => {
            const createData = {
                descripcion: 'Instalación de escalera metálica',
                cliente: 'Tech Corp',
                prioridad: 'alta' as const,
            };

            // Mock last order for number generation
            (prisma.order.findFirst as any).mockResolvedValue({ numero: 'ORD-00005' });

            // Mock repository create
            const createdOrder = {
                id: 'order-123',
                numero: 'ORD-00006',
                ...createData,
                estado: 'planeacion',
                creadorId: 'user-1',
            };
            (ordenesRepository.create as any).mockResolvedValue(createdOrder);
            (ordenesRepository.findById as any).mockResolvedValue(createdOrder);

            const result = await service.create(createData, 'user-1');

            expect(result.id).toBe('order-123');
            expect(result.numero).toBe('ORD-00006');
            expect(ordenesRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    numero: 'ORD-00006',
                    descripcion: createData.descripcion,
                    cliente: createData.cliente,
                })
            );
        });

        it('should start number from ORD-00001 if no orders exist', async () => {
            (prisma.order.findFirst as any).mockResolvedValue(null);
            (ordenesRepository.create as any).mockResolvedValue({ id: '1', numero: 'ORD-00001' });
            (ordenesRepository.findById as any).mockResolvedValue({ id: '1', numero: 'ORD-00001' });

            await service.create({ descripcion: 'Test orden', cliente: 'Client' }, 'user-1');

            expect(ordenesRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ numero: 'ORD-00001' })
            );
        });
    });

    describe('findById', () => {
        it('should return orden by id', async () => {
            const mockOrden = { id: '1', numero: 'ORD-001', cliente: 'Test' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);

            const result = await service.findById('1');

            expect(result).toEqual(mockOrden);
        });

        it('should throw NotFoundError if orden does not exist', async () => {
            (ordenesRepository.findById as any).mockResolvedValue(null);

            await expect(service.findById('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('changeStatus - State Machine', () => {
        it('should allow planeacion → ejecucion', async () => {
            const mockOrden = { id: '1', estado: 'planeacion', fechaInicio: null };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);
            (ordenesRepository.update as any).mockResolvedValue({});

            const updatedOrden = { ...mockOrden, estado: 'ejecucion', fechaInicio: new Date() };
            (ordenesRepository.findById as any)
                .mockResolvedValueOnce(mockOrden)
                .mockResolvedValueOnce(updatedOrden);

            const result = await service.changeStatus('1', 'ejecucion');

            expect(ordenesRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
                estado: 'ejecucion',
                fechaInicio: expect.any(Date),
            }));
        });

        it('should allow ejecucion → completada', async () => {
            const mockOrden = { id: '1', estado: 'ejecucion' };
            (ordenesRepository.findById as any)
                .mockResolvedValueOnce(mockOrden)
                .mockResolvedValueOnce({ ...mockOrden, estado: 'completada' });
            (ordenesRepository.update as any).mockResolvedValue({});

            await service.changeStatus('1', 'completada');

            expect(ordenesRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
                estado: 'completada',
                fechaFin: expect.any(Date),
            }));
        });

        it('should allow ejecucion → pausada', async () => {
            const mockOrden = { id: '1', estado: 'ejecucion' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);
            (ordenesRepository.update as any).mockResolvedValue({});

            await service.changeStatus('1', 'pausada');

            expect(ordenesRepository.update).toHaveBeenCalledWith('1', { estado: 'pausada' });
        });

        it('should reject invalid transition: planeacion → completada', async () => {
            const mockOrden = { id: '1', estado: 'planeacion' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);

            await expect(service.changeStatus('1', 'completada')).rejects.toThrow(ValidationError);
            await expect(service.changeStatus('1', 'completada')).rejects.toThrow(
                /Transición de estado no permitida/
            );
        });

        it('should reject invalid transition: completada → ejecucion', async () => {
            const mockOrden = { id: '1', estado: 'completada' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);

            await expect(service.changeStatus('1', 'ejecucion')).rejects.toThrow(ValidationError);
        });

        it('should allow cancelada → planeacion (reopen)', async () => {
            const mockOrden = { id: '1', estado: 'cancelada' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);
            (ordenesRepository.update as any).mockResolvedValue({});

            await service.changeStatus('1', 'planeacion');

            expect(ordenesRepository.update).toHaveBeenCalledWith('1', { estado: 'planeacion' });
        });
    });

    describe('update', () => {
        it('should update orden fields', async () => {
            const mockOrden = { id: '1', estado: 'planeacion', cliente: 'Old' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);
            (ordenesRepository.update as any).mockResolvedValue({});

            await service.update('1', { cliente: 'New Client' });

            expect(ordenesRepository.update).toHaveBeenCalledWith('1', { cliente: 'New Client' });
        });

        it('should validate state transition when updating estado', async () => {
            const mockOrden = { id: '1', estado: 'planeacion' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);

            await expect(service.update('1', { estado: 'completada' })).rejects.toThrow(ValidationError);
        });
    });

    describe('delete', () => {
        it('should delete existing orden', async () => {
            const mockOrden = { id: '1', numero: 'ORD-001' };
            (ordenesRepository.findById as any).mockResolvedValue(mockOrden);
            (ordenesRepository.delete as any).mockResolvedValue(undefined);

            const result = await service.delete('1');

            expect(result.message).toBe('Orden eliminada exitosamente');
            expect(ordenesRepository.delete).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundError when deleting non-existent orden', async () => {
            (ordenesRepository.findById as any).mockResolvedValue(null);

            await expect(service.delete('999')).rejects.toThrow(NotFoundError);
        });
    });
});
