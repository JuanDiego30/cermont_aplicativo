import { GenerateReporteOrdenUseCase } from './generate-reporte-orden.use-case';

describe('GenerateReporteOrdenUseCase', () => {
    const pdfGenerator = {
        generateFromHtml: jest.fn(),
    };

    const prisma = {
        order: {
            findUnique: jest.fn(),
        },
    };

    const storage = {
        exists: jest.fn(),
        get: jest.fn(),
        getCached: jest.fn(),
        save: jest.fn(),
        getPublicUrl: jest.fn(),
    };

    const queue = {
        enqueue: jest.fn((fn) => fn()),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sirve desde cache cuando está habilitado y existe', async () => {
        const useCase = new GenerateReporteOrdenUseCase(
            pdfGenerator as any,
            prisma as any,
            storage as any,
            queue as any,
        );

        prisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            numero: 'OT-001',
            descripcion: 'desc',
            cliente: 'ACME',
            estado: 'pendiente',
            subEstado: 'solicitud_recibida',
            prioridad: 'media',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02'),
        });

        storage.getCached.mockResolvedValue(Buffer.from('PDF_CACHED'));
        storage.getPublicUrl.mockImplementation((filename: string) => `http://localhost:3000/api/pdf/${filename}`);

        const result = await useCase.execute({
            ordenId: '00000000-0000-0000-0000-000000000000',
            incluirCliente: true,
            incluirTecnico: false,
            incluirLineasVida: false,
            incluirEquipos: false,
            incluirEvidencias: false,
            incluirHistorial: false,
            saveToStorage: true,
            enableCache: true,
        } as any);

        expect(pdfGenerator.generateFromHtml).not.toHaveBeenCalled();
        expect(storage.save).not.toHaveBeenCalled();
        expect(result.filename).toMatch(/^reporte-orden-OT-001-[a-f0-9]{16}\.pdf$/);
        expect(result.buffer).toBe(Buffer.from('PDF_CACHED').toString('base64'));
    });

    it('genera y persiste cuando no está cacheado', async () => {
        const useCase = new GenerateReporteOrdenUseCase(
            pdfGenerator as any,
            prisma as any,
            storage as any,
            queue as any,
        );

        prisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            numero: 'OT-001',
            descripcion: 'desc',
            cliente: 'ACME',
            estado: 'pendiente',
            subEstado: 'solicitud_recibida',
            prioridad: 'media',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02'),
        });

        storage.getCached.mockResolvedValue(null);
        storage.getPublicUrl.mockImplementation((filename: string) => `http://localhost:3000/api/pdf/${filename}`);
        pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_NEW'));

        const result = await useCase.execute({
            ordenId: '00000000-0000-0000-0000-000000000000',
            saveToStorage: true,
            enableCache: true,
        } as any);

        expect(queue.enqueue).toHaveBeenCalledTimes(1);
        expect(storage.save).toHaveBeenCalledTimes(1);
        expect(result.filename).toMatch(/^reporte-orden-OT-001-[a-f0-9]{16}\.pdf$/);
        expect(result.buffer).toBe(Buffer.from('PDF_NEW').toString('base64'));
    });

    it('genera sin persistir cuando saveToStorage es false', async () => {
        const useCase = new GenerateReporteOrdenUseCase(
            pdfGenerator as any,
            prisma as any,
            storage as any,
            queue as any,
        );

        prisma.order.findUnique.mockResolvedValue({
            id: 'order-1',
            numero: 'OT-001',
            descripcion: 'desc',
            cliente: 'ACME',
            estado: 'pendiente',
            subEstado: 'solicitud_recibida',
            prioridad: 'media',
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02'),
        });

        pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_TEST'));

        const result = await useCase.execute({
            ordenId: '00000000-0000-0000-0000-000000000000',
            saveToStorage: false,
        } as any);

        expect(queue.enqueue).toHaveBeenCalledTimes(1);
        expect(storage.save).not.toHaveBeenCalled();
        expect(result.mimeType).toBe('application/pdf');
    });
});
