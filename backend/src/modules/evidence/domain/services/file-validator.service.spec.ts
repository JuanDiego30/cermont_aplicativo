import { FileValidatorService } from './file-validator.service';

describe('FileValidatorService', () => {
  const service = new FileValidatorService();

  it('valida un PNG correcto', async () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const result = await service.validateFile({
      mimetype: 'image/png',
      originalname: 'foto.png',
      size: 1024,
      buffer: pngHeader,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.mimeType.getValue()).toBe('image/png');
    expect(result.fileType.toSpanish()).toBe('FOTO');
  });

  it('rechaza cuando el contenido no coincide con el MIME declarado', async () => {
    const pdfHeader = Buffer.from('%PDF-1.4\n');

    const result = await service.validateFile({
      mimetype: 'image/png',
      originalname: 'foto.png',
      size: 1024,
      buffer: pdfHeader,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('does not match declared MIME');
  });

  it('rechaza extensiones peligrosas', async () => {
    const result = await service.validateFile({
      mimetype: 'application/pdf',
      originalname: 'malware.exe',
      size: 1024,
      buffer: Buffer.from('%PDF-1.4\n'),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('Dangerous file extension');
  });

  it('no lanza excepción en tamaños fuera de límite (retorna error)', async () => {
    const result = await service.validateFile({
      mimetype: 'image/png',
      originalname: 'foto.png',
      size: 51 * 1024 * 1024, // 51MB (sobre el límite de 50MB)
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toContain('exceeds limit');
  });
});
