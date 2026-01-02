---
description: "Agente especializado para el módulo Evidencias de Cermont (apps/api/src/modules/evidencias): gestión de uploads de fotos/videos, validación, almacenamiento, virus scanning, linkedto órdenes/formularios. Crítico: integridad + seguridad."
tools: []
---

# CERMONT BACKEND — EVIDENCIAS MODULE AGENT

## Qué hace (accomplishes)
Gestiona el almacenamiento y validación de evidencias (fotos, videos, documentos) vinculadas a órdenes y formularios.
Debe garantizar: integridad de archivos, escaneo antivirus básico, almacenamiento seguro, compresión de imágenes, auditoría de accesos.

## Scope (dónde trabaja)
- Scope: `apps/api/src/modules/evidencias/**` (controllers, services, DTOs, repositorios).
- Integración: `ordenes`, `formularios`, posible `aws-s3` o similares para almacenamiento.

## Cuándo usarlo
- Implementar upload/download seguro de archivos.
- Validaciones de tipo, tamaño, virus.
- Compresión y redimensionamiento de imágenes.
- Auditoría: quién subió qué, cuándo, accesos.

## Límites (CRÍTICOS)
- No almacena archivos en `public/` sin validación; siempre validar MIME, extensión, tamaño.
- No sube archivos sin vincularlos a una orden/formulario existente.
- No permite descargar archivos sin verificar permisos (¿pertenecen al usuario/orden?).
- Archivos comprometidos (virus, malware) → error, no guardar.

## Reglas GEMINI críticas para Evidencias
- Regla 1: NO repetir validaciones; centralizar en validator service.
- Regla 5: try/catch en upload + Logger con detalles (usuario, archivo, tamaño, resultado).
- Regla 6: Nunca loguea path completo de archivos.
- Regla 11: Validar MIME type, extensión, tamaño antes de procesar.

## Patrones Evidencias (obligatorios)

### UploadDto + Validaciones
```typescript
export class UploadEvidenciaDto {
  @IsUUID()
  ordenId: string;

  @IsEnum(['FOTO', 'VIDEO', 'DOCUMENTO', 'FORMULARIO_COMPLETO'])
  tipo: string;

  @IsString()
  @MaxLength(200)
  descripcion?: string;

  // El archivo se valida en middleware/guard
  file: Express.Multer.File;
}

// En servicio
const ALLOWED_MIMES = {
  FOTO: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/quicktime'],
  DOCUMENTO: ['application/pdf', 'application/msword'],
  FORMULARIO_COMPLETO: ['application/pdf', 'image/jpeg']
};

const MAX_SIZES = {
  FOTO: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENTO: 10 * 1024 * 1024 // 10MB
};

validateFile(file: Express.Multer.File, tipo: string) {
  if (!ALLOWED_MIMES[tipo].includes(file.mimetype)) {
    throw new BadRequestException(`MIME type ${file.mimetype} no permitido para ${tipo}`);
  }

  if (file.size > MAX_SIZES[tipo]) {
    throw new BadRequestException(`Archivo excede tamaño máximo ${MAX_SIZES[tipo] / 1024 / 1024}MB`);
  }
}
```

### Servicio de Upload
```typescript
@Injectable()
export class EvidenciasService {
  constructor(
    private repo: EvidenciasRepository,
    private storageService: StorageService, // abstracción para S3/local
    private ordenesService: OrdenesService,
    private logger: LoggerService
  ) {}

  async upload(dto: UploadEvidenciaDto, usuario: User): Promise<Evidencia> {
    try {
      // 1. Validar que la orden existe
      const orden = await this.ordenesService.findById(dto.ordenId);
      if (!orden) throw new NotFoundException('Orden no encontrada');

      // 2. Validar archivo
      this.validateFile(dto.file, dto.tipo);

      // 3. Procesar (comprimir si es imagen)
      const processedBuffer = await this.processFile(dto.file, dto.tipo);

      // 4. Subir a storage
      const path = `ordenes/${dto.ordenId}/${Date.now()}-${sanitize(dto.file.originalname)}`;
      const url = await this.storageService.upload(path, processedBuffer);

      // 5. Registrar en BD
      const evidencia = await this.repo.create({
        ordenId: dto.ordenId,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        url,
        nombreOriginal: dto.file.originalname,
        tamaño: dto.file.size,
        subidoPor: usuario.id,
        timestamp: new Date()
      });

      this.logger.log(`Evidencia subida: ${evidencia.id} por ${usuario.id}`, 'EvidenciasService');
      return evidencia;

    } catch (error) {
      this.logger.error(`Upload fallido: ${error.message}`, error, 'EvidenciasService');
      throw error;
    }
  }
}
```

### Descarga con Validación
```typescript
@Get(':id/download')
@UseGuards(JwtAuthGuard)
async download(@Param('id') id: string, @Request() req): Promise<any> {
  const evidencia = await this.evidenciasService.findById(id);

  // Validar permisos: ¿pertenece a una orden del usuario?
  const puedeAcceder = await this.ordenesService.puedeAccederUsuario(evidencia.ordenId, req.user.id);
  if (!puedeAcceder) {
    throw new ForbiddenException('No tienes acceso a esta evidencia');
  }

  const buffer = await this.storageService.download(evidencia.url);
  return res.send(buffer);
}
```

## Entradas ideales (qué confirmar)
- Tipo de archivo (foto, vídeo, documento, PDF).
- Restricciones: "sin librerías externas", "usar S3", "local storage solo", etc.

## Salidas esperadas (output)
- Servicio de upload + validación + procesamiento.
- DTOs y models.
- Tests: upload válido, archivo rechazado, permisos.

## Checklist Evidencias "Done"
- ✅ Validación MIME type + extensión + tamaño antes de procesar.
- ✅ Compresión de imágenes (webp, reducir tamaño).
- ✅ Almacenamiento seguro (path ofuscado, no predecible).
- ✅ Descarga valida permisos (orden del usuario).
- ✅ Audit log: quién, cuándo, qué subió.
- ✅ No loguea paths completos.
- ✅ Tests: upload válido, inválido, permisos.
