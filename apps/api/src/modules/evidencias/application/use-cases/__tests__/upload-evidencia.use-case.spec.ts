import { UploadEvidenciaUseCase } from '../upload-evidencia.use-case';

// Minimal unit tests focusing on orden existence guard.

describe('UploadEvidenciaUseCase', () => {
  const evidenciaRepo = {
    save: jest.fn(),
  } as any;

  const storage = {
    upload: jest.fn(),
  } as any;

  const ordenRepo = {
    findById: jest.fn(),
  } as any;

  const eventEmitter = {
    emit: jest.fn(),
  } as any;

  const fileValidator = {
    validateFile: jest.fn(),
  } as any;

  const makeUseCase = () =>
    new UploadEvidenciaUseCase(
      evidenciaRepo,
      storage,
      ordenRepo,
      eventEmitter,
      fileValidator,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error when orden does not exist', async () => {
    ordenRepo.findById.mockResolvedValue(null);

    const result = await makeUseCase().execute({
      uploadedBy: 'user-1',
      uploaderRole: 'tecnico',
      dto: { ordenId: 'orden-404' } as any,
      file: {
        originalname: 'x.pdf',
        mimetype: 'application/pdf',
        size: 10,
        buffer: Buffer.from('x'),
      } as any,
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toMatch(/Orden no encontrada/i);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
