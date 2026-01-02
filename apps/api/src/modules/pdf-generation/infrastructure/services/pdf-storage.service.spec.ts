import { PdfStorageService } from './pdf-storage.service';

describe('PdfStorageService', () => {
    const configService = {
        get: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        configService.get.mockImplementation((key: string) => {
            if (key === 'PDF_STORAGE_DIR') return './storage/pdfs';
            if (key === 'API_URL') return 'http://localhost:3000';
            return undefined;
        });
    });

    it('construye URL pública con /api/pdf', () => {
        const service = new PdfStorageService(configService as any);
        const url = service.getPublicUrl('file.pdf');
        expect(url).toBe('http://localhost:3000/api/pdf/file.pdf');
    });

    it('rechaza nombres con path traversal', () => {
        const service = new PdfStorageService(configService as any);
        expect(() => service.getPublicUrl('..\\evil.pdf')).toThrow();
        expect(() => service.getPublicUrl('../evil.pdf')).toThrow();
    });
});
