/**
 * @file api-response.decorator.ts
 * @description Decorators para documentar respuestas API en Swagger
 */

import { applyDecorators, SetMetadata, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
    ApiSuccessResponseDto,
    ApiErrorResponseDto,
    PaginatedResponseDto,
    PaginationMetaDto,
} from '../dto/api-response.dto';
import { SKIP_TRANSFORM_KEY } from '../interceptors/transform.interceptor';

/**
 * Documenta respuesta exitosa estándar con tipo genérico
 *
 * Uso:
 * @ApiSuccessResponse(UserDto, { description: 'Usuario encontrado' })
 */
export const ApiSuccessResponse = <TModel extends Type<unknown>>(
    model: TModel,
    options?: { description?: string; isArray?: boolean },
) => {
    return applyDecorators(
        ApiExtraModels(ApiSuccessResponseDto, model),
        ApiResponse({
            status: 200,
            description: options?.description ?? 'Operación exitosa',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ApiSuccessResponseDto) },
                    {
                        properties: {
                            data: options?.isArray
                                ? {
                                      type: 'array',
                                      items: { $ref: getSchemaPath(model) },
                                  }
                                : { $ref: getSchemaPath(model) },
                        },
                    },
                ],
            },
        }),
    );
};

/**
 * Documenta respuesta de creación exitosa (201)
 */
export const ApiCreatedResponse = <TModel extends Type<unknown>>(
    model: TModel,
    options?: { description?: string },
) => {
    return applyDecorators(
        ApiExtraModels(ApiSuccessResponseDto, model),
        ApiResponse({
            status: 201,
            description: options?.description ?? 'Recurso creado exitosamente',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ApiSuccessResponseDto) },
                    {
                        properties: {
                            data: { $ref: getSchemaPath(model) },
                        },
                    },
                ],
            },
        }),
    );
};

/**
 * Documenta respuesta paginada estándar
 *
 * Uso:
 * @ApiPaginatedResponse(UserDto, { description: 'Lista de usuarios paginada' })
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
    model: TModel,
    options?: { description?: string },
) => {
    return applyDecorators(
        ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, model),
        ApiResponse({
            status: 200,
            description: options?.description ?? 'Resultados paginados',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedResponseDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
};

/**
 * Documenta respuestas de error comunes
 */
export const ApiErrorResponses = () => {
    return applyDecorators(
        ApiExtraModels(ApiErrorResponseDto),
        ApiResponse({
            status: 400,
            description: 'Bad Request - Error de validación',
            type: ApiErrorResponseDto,
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized - Token inválido o expirado',
            type: ApiErrorResponseDto,
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Sin permisos suficientes',
            type: ApiErrorResponseDto,
        }),
        ApiResponse({
            status: 404,
            description: 'Not Found - Recurso no encontrado',
            type: ApiErrorResponseDto,
        }),
        ApiResponse({
            status: 409,
            description: 'Conflict - Conflicto de datos',
            type: ApiErrorResponseDto,
        }),
        ApiResponse({
            status: 500,
            description: 'Internal Server Error',
            type: ApiErrorResponseDto,
        }),
    );
};

/**
 * Documenta endpoint completo con success y errores
 */
export const ApiStandardResponses = <TModel extends Type<unknown>>(
    model: TModel,
    options?: { description?: string; isArray?: boolean; isPaginated?: boolean },
) => {
    if (options?.isPaginated) {
        return applyDecorators(
            ApiPaginatedResponse(model, { description: options?.description }),
            ApiErrorResponses(),
        );
    }

    return applyDecorators(
        ApiSuccessResponse(model, {
            description: options?.description,
            isArray: options?.isArray,
        }),
        ApiErrorResponses(),
    );
};

/**
 * Decorator para skipear el TransformInterceptor
 *
 * Uso:
 * @SkipTransform()
 * @Get('raw')
 * getRawData() {
 *   return { custom: 'response' };
 * }
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
