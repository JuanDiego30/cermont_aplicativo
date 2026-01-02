import { NotFoundException } from '@nestjs/common';
import { GetPdfCachedUseCase } from './get-pdf-cached.use-case';

describe('GetPdfCachedUseCase', () => {
    const storage = {
        getCached: jest.fn(),
        getPublicUrl: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retorna el PDF cuando existe en cache', async () => {
        const useCase = new GetPdfCachedUseCase(storage as any);

        storage.getCached.mockResolvedValue(Buffer.from('PDF_DATA'));
        storage.getPublicUrl.mockImplementation((filename: string) => `http://localhost:3000/api/pdf/${filename}`);

        const result = await useCase.execute('file.pdf');

        expect(result.filename).toBe('file.pdf');
        expect(result.buffer).toBe(Buffer.from('PDF_DATA').toString('base64'));
        expect(result.url).toBe('http://localhost:3000/api/pdf/file.pdf');
    });

    it('lanza NotFoundException cuando no existe en cache', async () => {
        const useCase = new GetPdfCachedUseCase(storage as any);

        storage.getCached.mockResolvedValue(null);

        await expect(useCase.execute('missing.pdf')).rejects.toBeInstanceOf(NotFoundException);
    });
});
