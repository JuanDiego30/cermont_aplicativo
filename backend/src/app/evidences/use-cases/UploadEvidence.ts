import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import { EvidenceStatus, EvidenceType } from '../../../domain/entities/Evidence.js';
import type { Evidence, EvidenceMetadata, GPSCoordinates } from '../../../domain/entities/Evidence.js';

/**
 * Error personalizado para operaciones de subida de evidencia
 * Incluye código de error y status HTTP para manejo consistente
 * @class EvidenceUploadError
 * @extends {Error}
 */
export class EvidenceUploadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'EvidenceUploadError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Parámetros para subir una evidencia
 * @interface UploadEvidenceInput
 */
export interface UploadEvidenceInput {
  /** ID de la orden a la que pertenece la evidencia */
  orderId: string;
  /** Etapa del trabajo (e.g., "EJECUCION", "CIERRE") */
  stage: string;
  /** Tipo de archivo (photo, video, document) */
  type: EvidenceType;
  /** Nombre del archivo original */
  fileName: string;
  /** Ruta donde se almacenó el archivo en el servidor */
  filePath: string;
  /** Tamaño del archivo en bytes */
  fileSize: number;
  /** MIME type del archivo (e.g., "image/jpeg", "video/mp4") */
  mimeType: string;
  /** ID del usuario que sube la evidencia */
  uploadedBy: string;
  /** Metadata opcional adicional */
  metadata?: EvidenceMetadata;
}

/**
 * Caso de uso: Subir una evidencia para una orden
 * Valida y crea un registro de evidencia asociado a una orden de trabajo
 * @class UploadEvidence
 * @since 1.0.0
 */
export class UploadEvidence {
  // Límites de tamaño
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly BYTES_PER_MB = 1024 * 1024;

  // Tipos MIME permitidos por categoría
  private static readonly ALLOWED_MIME_TYPES: Record<EvidenceType, readonly string[]> = {
    [EvidenceType.PHOTO]: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    [EvidenceType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
    [EvidenceType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    [EvidenceType.AUDIO]: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
    [EvidenceType.OTHER]: ['application/octet-stream'],
  };

  // Límites GPS
  private static readonly GPS_LIMITS = {
    LAT_MIN: -90,
    LAT_MAX: 90,
    LNG_MIN: -180,
    LNG_MAX: 180,
  } as const;

  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  /**
   * Ejecuta la subida de una evidencia
   * @param {UploadEvidenceInput} input - Datos de la evidencia a subir
   * @returns {Promise<Evidence>} Evidencia creada con status PENDING
   * @throws {EvidenceUploadError} Si hay errores de validación o creación
   */
  async execute(input: UploadEvidenceInput): Promise<Evidence> {
    try {
      await this.validateAndPrepareInput(input);

      const evidence = await this.createEvidence(input);

      console.info(
        `[UploadEvidence] 📤 Evidencia subida: ${evidence.id} por ${input.uploadedBy} (orden: ${input.orderId})`
      );

      return evidence;
    } catch (error) {
      if (error instanceof EvidenceUploadError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[UploadEvidence] Error inesperado:', errorMessage);

      throw new EvidenceUploadError(
        `Error interno al subir la evidencia: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  /**
   * Valida y prepara el input para la creación de evidencia
   * @private
   * @param {UploadEvidenceInput} input - Datos a validar
   */
  private async validateAndPrepareInput(input: UploadEvidenceInput): Promise<void> {
    this.validateRequiredFields(input);
    await this.validateOrder(input.orderId);
    this.validateFileSize(input.fileSize);
    
    const normalizedMimeType = input.mimeType.trim().toLowerCase();
    this.validateFileType(input.type, normalizedMimeType);

    if (input.metadata?.gps) {
      this.validateGPS(input.metadata.gps);
    }
  }

  /**
   * Crea la evidencia en el repositorio
   * @private
   * @param {UploadEvidenceInput} input - Datos de la evidencia
   * @returns {Promise<Evidence>} Evidencia creada
   */
  private async createEvidence(input: UploadEvidenceInput): Promise<Evidence> {
    return this.evidenceRepository.create({
      orderId: input.orderId,
      stage: input.stage.trim(),
      type: input.type,
      fileName: input.fileName.trim(),
      filePath: input.filePath.trim(),
      fileSize: input.fileSize,
      mimeType: input.mimeType.trim().toLowerCase(),
      status: EvidenceStatus.PENDING,
      uploadedBy: input.uploadedBy,
      version: 1,
      previousVersions: [],
      metadata: input.metadata ?? {},
    });
  }

  /**
   * Valida todos los campos requeridos del input
   * @private
   * @param {UploadEvidenceInput} input - Datos a validar
   * @throws {EvidenceUploadError} Si algún campo es inválido
   */
  private validateRequiredFields(input: UploadEvidenceInput): void {
    const validations: Array<[unknown, string, string]> = [
      [input.orderId, 'El ID de la orden', 'INVALID_ORDER_ID'],
      [input.stage, 'La etapa', 'INVALID_STAGE'],
      [input.fileName, 'El nombre del archivo', 'INVALID_FILE_NAME'],
      [input.filePath, 'La ruta del archivo', 'INVALID_FILE_PATH'],
      [input.mimeType, 'El tipo MIME del archivo', 'INVALID_MIME_TYPE'],
      [input.uploadedBy, 'El ID del usuario que sube', 'INVALID_UPLOADED_BY'],
    ];

    for (const [value, displayName, errorCode] of validations) {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new EvidenceUploadError(`${displayName} es requerido`, errorCode, 400);
      }
    }

    // Validar type contra el enum
    if (!Object.values(EvidenceType).includes(input.type)) {
      throw new EvidenceUploadError(
        `Tipo de archivo inválido. Debe ser: ${Object.values(EvidenceType).join(', ')}`,
        'INVALID_TYPE',
        400
      );
    }

    // Validar fileSize
    if (typeof input.fileSize !== 'number' || input.fileSize <= 0) {
      throw new EvidenceUploadError(
        'El tamaño del archivo debe ser un número positivo',
        'INVALID_FILE_SIZE',
        400
      );
    }
  }

  /**
   * Valida que la orden existe en el sistema
   * @private
   * @param {string} orderId - ID de la orden a validar
   * @throws {EvidenceUploadError} Si la orden no existe
   */
  private async validateOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new EvidenceUploadError(
        `Orden con ID ${orderId} no encontrada`,
        'ORDER_NOT_FOUND',
        404
      );
    }
  }

  /**
   * Valida el tamaño del archivo contra el límite máximo
   * @private
   * @param {number} fileSize - Tamaño del archivo en bytes
   * @throws {EvidenceUploadError} Si el archivo excede el tamaño máximo
   */
  private validateFileSize(fileSize: number): void {
    if (fileSize > UploadEvidence.MAX_FILE_SIZE) {
      const maxSizeMB = UploadEvidence.MAX_FILE_SIZE / UploadEvidence.BYTES_PER_MB;
      const fileSizeMB = (fileSize / UploadEvidence.BYTES_PER_MB).toFixed(2);

      throw new EvidenceUploadError(
        `El archivo (${fileSizeMB}MB) excede el tamaño máximo permitido (${maxSizeMB}MB)`,
        'FILE_TOO_LARGE',
        413
      );
    }
  }

  /**
   * Valida el tipo de archivo según su categoría
   * @private
   * @param {EvidenceType} type - Tipo de evidencia
   * @param {string} normalizedMimeType - MIME type normalizado del archivo
   * @throws {EvidenceUploadError} Si el tipo MIME no es permitido
   */
  private validateFileType(type: EvidenceType, normalizedMimeType: string): void {
    const allowedTypes = UploadEvidence.ALLOWED_MIME_TYPES[type];

    if (!allowedTypes) {
      throw new EvidenceUploadError(
        `Tipo de evidencia no implementado: ${type}`,
        'UNHANDLED_EVIDENCE_TYPE',
        500
      );
    }

    if (!allowedTypes.includes(normalizedMimeType)) {
      throw new EvidenceUploadError(
        `Tipo de archivo no permitido para ${type}. Tipos válidos: ${allowedTypes.join(', ')}`,
        'INVALID_FILE_TYPE',
        415
      );
    }
  }

  /**
   * Valida las coordenadas GPS
   * @private
   * @param {GPSCoordinates} gps - Objeto con latitud y longitud
   * @throws {EvidenceUploadError} Si las coordenadas son inválidas
   */
  private validateGPS(gps: GPSCoordinates): void {
    const { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } = UploadEvidence.GPS_LIMITS;

    if (typeof gps.lat !== 'number' || gps.lat < LAT_MIN || gps.lat > LAT_MAX) {
      throw new EvidenceUploadError(
        `Latitud inválida. Debe estar entre ${LAT_MIN} y ${LAT_MAX}`,
        'INVALID_GPS_LATITUDE',
        400
      );
    }

    if (typeof gps.lng !== 'number' || gps.lng < LNG_MIN || gps.lng > LNG_MAX) {
      throw new EvidenceUploadError(
        `Longitud inválida. Debe estar entre ${LNG_MIN} y ${LNG_MAX}`,
        'INVALID_GPS_LONGITUDE',
        400
      );
    }
  }
}




