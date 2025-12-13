/**
 * @test KpiCalculatorService
 * 
 * Unit tests para el servicio de cálculo de KPIs.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { KpiCalculatorService } from '../services/kpi-calculator.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('KpiCalculatorService', () => {
    let service: KpiCalculatorService;

    const mockPrismaService = {
        order: {
            count: jest.fn(),
            findMany: jest.fn(),
            groupBy: jest.fn(),
        },
        user: {
            count: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KpiCalculatorService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<KpiCalculatorService>(KpiCalculatorService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getKpis', () => {
        beforeEach(() => {
            // Configurar mocks para todas las consultas
            mockPrismaService.order.count
                .mockResolvedValueOnce(100) // ordenes_totales
                .mockResolvedValueOnce(80)  // ordenes_completadas
                .mockResolvedValueOnce(15)  // ordenes_en_progreso
                .mockResolvedValueOnce(5);  // ordenes_en_planeacion

            mockPrismaService.order.findMany.mockResolvedValue([
                {
                    id: 'orden-1',
                    numero: 'OT-001',
                    fechaInicio: new Date('2024-12-01T08:00:00Z'),
                    fechaFin: new Date('2024-12-01T16:00:00Z'),
                    estado: 'completada',
                    presupuestoEstimado: 1000000,
                    impuestosAplicables: 0.19,
                    costos: [
                        { monto: 500000, tipo: 'mano_obra' },
                        { monto: 400000, tipo: 'materiales' },
                    ],
                    factura: { id: 'factura-1' },
                },
            ]);

            mockPrismaService.user.count.mockResolvedValue(10);
            mockPrismaService.user.findMany.mockResolvedValue([
                { id: 'tecnico-1', asignaciones: [{ id: 'orden-1' }] },
                { id: 'tecnico-2', asignaciones: [] },
            ]);

            mockPrismaService.order.groupBy.mockResolvedValue([
                { asignadoId: 'tecnico-1', _count: { id: 15 } },
            ]);

            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'tecnico-1',
                name: 'Juan Técnico',
            });
        });

        it('debería calcular KPIs completos', async () => {
            const result = await service.getKpis();

            expect(result).toBeDefined();
            expect(result.overview).toBeDefined();
            expect(result.costos).toBeDefined();
            expect(result.tecnicos).toBeDefined();
            expect(result.alertas).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });

        it('debería calcular tasa de cumplimiento correctamente', async () => {
            const result = await service.getKpis();

            // 80 completadas de 100 = 80%
            expect(result.overview.tasa_cumplimiento).toBe(80);
        });

        it('debería usar caché en llamadas consecutivas', async () => {
            // Primera llamada - calcula métricas
            await service.getKpis();
            const firstCallCount = mockPrismaService.order.count.mock.calls.length;

            // Segunda llamada - debería usar caché
            await service.getKpis();
            const secondCallCount = mockPrismaService.order.count.mock.calls.length;

            // No debería haber llamadas adicionales (caché activo)
            expect(secondCallCount).toBe(firstCallCount);
        });
    });

    describe('refreshKpis', () => {
        it('debería invalidar caché y recalcular', async () => {
            mockPrismaService.order.count.mockResolvedValue(50);
            mockPrismaService.order.findMany.mockResolvedValue([]);
            mockPrismaService.user.count.mockResolvedValue(5);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.order.groupBy.mockResolvedValue([]);

            // Primera llamada
            await service.getKpis();

            // Refresh - debería recalcular
            const result = await service.refreshKpis();

            expect(result).toBeDefined();
            // Verificar que se hicieron nuevas consultas
            expect(mockPrismaService.order.count).toHaveBeenCalled();
        });
    });

    describe('alertas', () => {
        it('debería detectar incumplimiento bajo', async () => {
            // Configurar baja tasa de cumplimiento
            mockPrismaService.order.count
                .mockResolvedValueOnce(100)  // total
                .mockResolvedValueOnce(50)   // completadas (50%)
                .mockResolvedValueOnce(40)   // en progreso
                .mockResolvedValueOnce(10);  // planeación

            mockPrismaService.order.findMany.mockResolvedValue([]);
            mockPrismaService.user.count.mockResolvedValue(5);
            mockPrismaService.user.findMany.mockResolvedValue([]);
            mockPrismaService.order.groupBy.mockResolvedValue([]);

            // Forzar refresh para evitar caché
            const result = await service.refreshKpis();

            const alertaIncumplimiento = result.alertas.find(
                (a) => a.tipo === 'INCUMPLIMIENTO',
            );

            expect(alertaIncumplimiento).toBeDefined();
            expect(alertaIncumplimiento?.severidad).toBe('ALTA');
        });
    });

    describe('getCostosDesglosados', () => {
        it('debería desglosar costos por tipo', async () => {
            mockPrismaService.order.findMany.mockResolvedValue([
                {
                    id: 'orden-1',
                    numero: 'OT-001',
                    cliente: 'ECOPETROL',
                    estado: 'completada',
                    presupuestoEstimado: 1000000,
                    costos: [
                        { monto: 400000, tipo: 'mano_obra' },
                        { monto: 300000, tipo: 'materiales' },
                        { monto: 150000, tipo: 'equipos' },
                        { monto: 100000, tipo: 'transporte' },
                        { monto: 50000, tipo: 'otros' },
                    ],
                },
            ]);

            const result = await service.getCostosDesglosados();

            expect(result).toHaveLength(1);
            expect(result[0].desglose.mano_obra).toBe(400000);
            expect(result[0].desglose.materiales).toBe(300000);
            expect(result[0].desglose.equipos).toBe(150000);
            expect(result[0].desglose.transporte).toBe(100000);
            expect(result[0].desglose.otros).toBe(50000);
            expect(result[0].costo_real).toBe(1000000);
        });
    });
});
