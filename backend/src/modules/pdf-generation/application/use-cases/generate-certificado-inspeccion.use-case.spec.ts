import { GenerateCertificadoInspeccionUseCase } from './generate-certificado-inspeccion.use-case';
import { PdfBuildService } from '../services/pdf-build.service';

describe('GenerateCertificadoInspeccionUseCase', () => {
  const pdfGenerator = {
    generateFromHtml: jest.fn(),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const storage = {
    getCached: jest.fn(),
    save: jest.fn(),
    getPublicUrl: jest.fn(),
  };

  const queue = {
    enqueue: jest.fn(fn => fn()),
  };

  const pdfBuild = new PdfBuildService(pdfGenerator as any, storage as any, queue as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sirve desde cache cuando está habilitado y existe', async () => {
    const useCase = new GenerateCertificadoInspeccionUseCase(prisma as any, pdfBuild);

    prisma.user.findUnique.mockResolvedValue({
      name: 'Inspector',
      email: 'inspector@acme.com',
    });
    storage.getCached.mockResolvedValue(Buffer.from('PDF_CACHED'));
    storage.getPublicUrl.mockImplementation(
      (filename: string) => `http://localhost:3000/api/pdf/${filename}`
    );

    const result = await useCase.execute({
      tipo: 'INSPECCION_LINEA_VIDA',
      elementoId: '00000000-0000-0000-0000-000000000000',
      inspectorId: '00000000-0000-0000-0000-000000000001',
      saveToStorage: true,
      enableCache: true,
    } as any);

    expect(queue.enqueue).not.toHaveBeenCalled();
    expect(pdfGenerator.generateFromHtml).not.toHaveBeenCalled();
    expect(storage.save).not.toHaveBeenCalled();
    expect(result.filename).toMatch(/^certificado-INSPECCION_LINEA_VIDA-[a-f0-9]{16}\.pdf$/);
    expect(result.buffer).toBe(Buffer.from('PDF_CACHED').toString('base64'));
  });

  it('genera y persiste cuando no está cacheado', async () => {
    const useCase = new GenerateCertificadoInspeccionUseCase(prisma as any, pdfBuild);

    prisma.user.findUnique.mockResolvedValue({
      name: 'Inspector',
      email: 'inspector@acme.com',
    });
    storage.getCached.mockResolvedValue(null);
    storage.getPublicUrl.mockImplementation(
      (filename: string) => `http://localhost:3000/api/pdf/${filename}`
    );
    pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_NEW'));

    const result = await useCase.execute({
      tipo: 'INSPECCION_LINEA_VIDA',
      elementoId: '00000000-0000-0000-0000-000000000000',
      inspectorId: '00000000-0000-0000-0000-000000000001',
      saveToStorage: true,
      enableCache: true,
    } as any);

    expect(queue.enqueue).toHaveBeenCalledTimes(1);
    expect(storage.save).toHaveBeenCalledTimes(1);
    expect(result.filename).toMatch(/^certificado-INSPECCION_LINEA_VIDA-[a-f0-9]{16}\.pdf$/);
    expect(result.buffer).toBe(Buffer.from('PDF_NEW').toString('base64'));
    expect(result.url).toMatch(/^http:\/\/localhost:3000\/api\/pdf\//);
  });

  it('genera sin persistir cuando saveToStorage es false', async () => {
    const useCase = new GenerateCertificadoInspeccionUseCase(prisma as any, pdfBuild);

    storage.getCached.mockResolvedValue(null);
    pdfGenerator.generateFromHtml.mockResolvedValue(Buffer.from('PDF_TEST'));

    const result = await useCase.execute({
      tipo: 'INSPECCION_LINEA_VIDA',
      elementoId: '00000000-0000-0000-0000-000000000000',
      saveToStorage: false,
    } as any);

    expect(queue.enqueue).toHaveBeenCalledTimes(1);
    expect(storage.save).not.toHaveBeenCalled();
    expect(result.mimeType).toBe('application/pdf');
    expect(result.filename).toMatch(/^certificado-CERT-[A-F0-9]{10}\.pdf$/);
  });
});
