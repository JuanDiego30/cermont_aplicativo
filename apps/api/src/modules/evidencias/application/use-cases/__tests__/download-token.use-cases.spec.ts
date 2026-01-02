import { GenerateEvidenciaDownloadTokenUseCase } from '../generate-evidencia-download-token.use-case';
import { DownloadEvidenciaByTokenUseCase } from '../download-evidencia-by-token.use-case';

describe('Evidencias download token use-cases', () => {
  it('genera token y url con expiración 1h', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ ordenId: 'orden-1', uploadedBy: 'u1' }),
    } as any;
    const ordenRepo = {
      findById: jest.fn().mockResolvedValue({ creadorId: 'u1', asignadoId: null }),
    } as any;
    const jwtService = { sign: jest.fn(() => 'tkn') } as any;
    const config = { get: jest.fn((_k: string, def: string) => def) } as any;

    const uc = new GenerateEvidenciaDownloadTokenUseCase(
      repo,
      ordenRepo,
      jwtService,
      config,
    );

    const result = await uc.execute({
      id: 'e1',
      requestedBy: 'u1',
      requesterRole: 'tecnico',
    });

    expect(result.token).toBe('tkn');
    expect(result.expiresInSeconds).toBe(3600);
    expect(result.url).toContain('/evidencias/download/tkn');
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('descarga por token usando DownloadEvidenciaUseCase', async () => {
    const jwtService = {
      verify: jest.fn().mockReturnValue({
        typ: 'evidencia_download',
        evidenciaId: 'e1',
        requestedBy: 'u1',
        role: 'admin',
      }),
    } as any;

    const downloadUseCase = {
      execute: jest.fn().mockResolvedValue({
        buffer: Buffer.from('x'),
        filename: 'a.pdf',
        mimeType: 'application/pdf',
      }),
    } as any;

    const uc = new DownloadEvidenciaByTokenUseCase(jwtService, downloadUseCase);

    const result = await uc.execute({ token: 'tkn' });

    expect(result.filename).toBe('a.pdf');
    expect(downloadUseCase.execute).toHaveBeenCalledWith({
      id: 'e1',
      requestedBy: 'u1',
      requesterRole: 'admin',
    });
  });
});
