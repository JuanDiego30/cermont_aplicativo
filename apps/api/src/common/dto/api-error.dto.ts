/**
 * API Error DTO - Standard error response format
 * 
 * All exception filters should emit this structure for consistent
 * error handling across frontend and backend.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
    @ApiProperty({
        description: 'HTTP status code',
        example: 400,
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Human-readable error message',
        example: 'Validation failed',
    })
    message!: string;

    @ApiPropertyOptional({
        description: 'Error type/code for programmatic handling',
        example: 'VALIDATION_ERROR',
    })
    error?: string;

    @ApiProperty({
        description: 'ISO timestamp of the error',
        example: '2026-01-07T12:00:00.000Z',
    })
    timestamp!: string;

    @ApiProperty({
        description: 'Request path that caused the error',
        example: '/api/ordenes/123',
    })
    path!: string;

    @ApiPropertyOptional({
        description: 'Detailed validation errors by field',
        example: { email: ['must be a valid email'], password: ['too short'] },
    })
    details?: Record<string, string[]>;

    @ApiPropertyOptional({
        description: 'Request ID for tracing (if available)',
        example: 'req-abc123',
    })
    requestId?: string;
}

/**
 * Factory to create ApiErrorDto instances
 */
export function createApiError(
    statusCode: number,
    message: string,
    path: string,
    options?: {
        error?: string;
        details?: Record<string, string[]>;
        requestId?: string;
    },
): ApiErrorDto {
    const dto = new ApiErrorDto();
    dto.statusCode = statusCode;
    dto.message = message;
    dto.timestamp = new Date().toISOString();
    dto.path = path;
    dto.error = options?.error;
    dto.details = options?.details;
    dto.requestId = options?.requestId;
    return dto;
}
