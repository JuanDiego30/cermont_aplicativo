import { GeneratePdfUseCase } from './generate-pdf.use-case';

describe('GeneratePdfUseCase', () => {
    const pdfGenerator = {
        generateFromHtml: jest.fn(),
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

    it('sirve desde cache cuando saveToStorage+enableCache y existe archivo', async () => {
        const useCase = new GeneratePdfUseCase(pdfGenerator as any, storage as any, queue as any);

        storage.getCached.mockResolvedValue(Buffer.from('PDF_CACHED'));
        storage.getPublicUrl.mockReturnValue('http://localhost:3000/api/pdf/custom-pdf-aaaa.pdf');

        const result = await useCase.execute({
            html: '<html><body>ok</body></html>',
            saveToStorage: true,
            enableCache: true,
        } as any);

        expect(pdfGenerator.generateFromHtml).not.toHaveBeenCalled();
        expect(storage.save).not.toHaveBeenCalled();
        expect(storage.getCached).toHaveBeenCalledTimes(1);
        expect(result.mimeType).toBe('application/pdf');
        expect(result.buffer).toBe(Buffer.from('PDF_CACHED').toString('base64'));
        expect(result.url).toContain('/api/pdf/');
    });

    it('genera y guarda cuando cache está habilitado pero no existe', async () => {
        const useCase = new GeneratePdfUseCase(pdfGenerator as any, storage as any, queue as any);

        storage.getCached.mockResolvedValue(null);
        storage.getPublicUrl.mockImplementation((filename: string) => `http://localhost:3000/api/pdf/${filename}`);
        pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_NEW'));

        const result = await useCase.execute({
            html: '<html><body>ok</body></html>',
            saveToStorage: true,
            enableCache: true,
        } as any);

        expect(queue.enqueue).toHaveBeenCalledTimes(1);
        expect(storage.save).toHaveBeenCalledTimes(1);
        expect(result.filename).toMatch(/^custom-pdf-[a-f0-9]{16}\.pdf$/);
        expect(result.url).toBe(`http://localhost:3000/api/pdf/${result.filename}`);
    });

    it('genera sin cache cuando enableCache es false', async () => {
        const useCase = new GeneratePdfUseCase(pdfGenerator as any, storage as any, queue as any);

        pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_NOCACHE'));

        const result = await useCase.execute({
            html: '<html><body>test</body></html>',
            saveToStorage: false,
            enableCache: false,
        } as any);

        expect(storage.getCached).not.toHaveBeenCalled();
        expect(storage.save).not.toHaveBeenCalled();
        expect(result.mimeType).toBe('application/pdf');
    });
});
