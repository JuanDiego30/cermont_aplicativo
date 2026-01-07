/**
 * @test OrdenesController
 * @description Unit tests for OrdenesController
 * @layer Infrastructure
 */
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesController } from './ordenes.controller';
import {
    ListOrdenesUseCase,
    GetOrdenByIdUseCase,
    FindOrdenUseCase,
    CreateOrdenUseCase,
    UpdateOrdenUseCase,
    ChangeOrdenEstadoUseCase,
    AsignarTecnicoOrdenUseCase,
    GetHistorialEstadosUseCase,
    DeleteOrdenUseCase,
} from '../../application/use-cases';
import { OrderStateService } from '../../application/services/order-state.service';

describe('OrdenesController', () => {
    let controller: OrdenesController;

    // Mock implementations
    const mockCreateOrden = { execute: jest.fn() };
    const mockUpdateOrden = { execute: jest.fn() };
    const mockFindOrden = { execute: jest.fn() };
    const mockGetOrdenById = { execute: jest.fn() };
    const mockListOrdenes = { execute: jest.fn() };
    const mockChangeOrdenEstado = { execute: jest.fn() };
    const mockAsignarTecnico = { execute: jest.fn() };
    const mockGetHistorial = { execute: jest.fn() };
    const mockDeleteOrden = { execute: jest.fn() };
    const mockOrderStateService = {
        getStateInfo: jest.fn(),
        getStateHistory: jest.fn()
    };

    const mockUser = {
        userId: 'user-123',
        email: 'test@test.com',
        role: 'admin',
        jti: 'jti-123',
        iat: Date.now(),
        exp: Date.now() + 3600000,
    };

    const mockOrdenResponse = {
        id: 'orden-123',
        numero: 'ORD-2026-001',
        descripcion: 'Test orden',
        cliente: 'Cliente Test',
        estado: 'pendiente',
        prioridad: 'media',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdenesController],
            providers: [
                { provide: CreateOrdenUseCase, useValue: mockCreateOrden },
                { provide: UpdateOrdenUseCase, useValue: mockUpdateOrden },
                { provide: FindOrdenUseCase, useValue: mockFindOrden },
                { provide: GetOrdenByIdUseCase, useValue: mockGetOrdenById },
                { provide: ListOrdenesUseCase, useValue: mockListOrdenes },
                { provide: ChangeOrdenEstadoUseCase, useValue: mockChangeOrdenEstado },
                { provide: AsignarTecnicoOrdenUseCase, useValue: mockAsignarTecnico },
                { provide: GetHistorialEstadosUseCase, useValue: mockGetHistorial },
                { provide: DeleteOrdenUseCase, useValue: mockDeleteOrden },
                { provide: OrderStateService, useValue: mockOrderStateService },
            ],
        }).compile();

        controller = module.get<OrdenesController>(OrdenesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new orden', async () => {
            const dto = {
                descripcion: 'Nueva orden de mantenimiento',
                cliente: 'Cliente ABC',
            };

            const expectedResult = {
                message: 'Orden creada exitosamente',
                data: mockOrdenResponse,
            };

            mockCreateOrden.execute.mockResolvedValue(expectedResult);

            const result = await controller.create(dto as any, mockUser as any);

            expect(mockCreateOrden.execute).toHaveBeenCalledWith(dto, mockUser.userId);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findAll', () => {
        it('should return paginated list of ordenes', async () => {
            const query = { page: 1, limit: 10 };
            const mockListResult = {
                data: [mockOrdenResponse],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            };

            mockListOrdenes.execute.mockResolvedValue(mockListResult);

            const result = await controller.findAll(query as any);

            expect(mockListOrdenes.execute).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('findOne', () => {
        it('should return a single orden by id', async () => {
            mockGetOrdenById.execute.mockResolvedValue(mockOrdenResponse);

            const result = await controller.findOne('orden-123');

            expect(mockGetOrdenById.execute).toHaveBeenCalledWith('orden-123');
            expect(result).toEqual(mockOrdenResponse);
        });
    });

    describe('update', () => {
        it('should update an orden', async () => {
            const dto = { descripcion: 'Descripción actualizada' };
            const expectedResult = {
                message: 'Orden actualizada',
                data: { ...mockOrdenResponse, ...dto },
            };

            mockUpdateOrden.execute.mockResolvedValue(expectedResult);

            const result = await controller.update('orden-123', dto as any);

            expect(mockUpdateOrden.execute).toHaveBeenCalledWith('orden-123', dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('remove', () => {
        it('should delete an orden', async () => {
            mockDeleteOrden.execute.mockResolvedValue(undefined);

            await controller.remove('orden-123');

            expect(mockDeleteOrden.execute).toHaveBeenCalledWith('orden-123');
        });
    });
});
