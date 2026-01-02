/**
 * @mapper EvidenciaMapper
 * @description Maps between Domain Entities and DTOs
 */

import { Evidencia, EvidenciaMetadata } from '../../domain/entities';
import {
    EvidenciaResponse,
    EvidenciaMetadataResponse,
} from '../dto/evidencia.dto';

export class EvidenciaMapper {
    /**
     * Map Evidencia entity to response DTO
     */
    public static toResponse(
        evidencia: Evidencia,
        baseUrl: string = '',
    ): EvidenciaResponse {
        return {
            id: evidencia.id.getValue(),
            ejecucionId: evidencia.ejecucionId,
            ordenId: evidencia.ordenId,
            tipo: evidencia.fileType.toSpanish(),
            mimeType: evidencia.mimeType.getValue(),
            nombreArchivo: evidencia.originalFilename,
            tamano: evidencia.fileSize.getBytes(),
            tamanoPretty: evidencia.fileSize.format(),
            url: `${baseUrl}/${evidencia.storagePath.getValue()}`,
            thumbnailUrl: evidencia.thumbnailPath
                ? `${baseUrl}/${evidencia.thumbnailPath.getValue()}`
                : undefined,
            status: evidencia.status.getValue(),
            descripcion: evidencia.descripcion,
            tags: evidencia.tags,
            metadata: evidencia.metadata
                ? EvidenciaMapper.toMetadataResponse(evidencia.metadata)
                : undefined,
            subidoPor: evidencia.uploadedBy,
            createdAt: evidencia.uploadedAt.toISOString(),
            updatedAt: evidencia.updatedAt.toISOString(),
            isDeleted: evidencia.isDeleted(),
        };
    }

    /**
     * Map multiple entities to response DTOs
     */
    public static toResponseList(
        evidencias: Evidencia[],
        baseUrl: string = '',
    ): EvidenciaResponse[] {
        return evidencias.map((e) => EvidenciaMapper.toResponse(e, baseUrl));
    }

    /**
     * Map metadata to response
     */
    private static toMetadataResponse(
        metadata: EvidenciaMetadata,
    ): EvidenciaMetadataResponse {
        return {
            sha256: metadata.sha256,
            width: metadata.width,
            height: metadata.height,
            duration: metadata.duration,
            gpsLatitude: metadata.gpsLatitude,
            gpsLongitude: metadata.gpsLongitude,
            thumbnails: metadata.thumbnails,
        };
    }
}
