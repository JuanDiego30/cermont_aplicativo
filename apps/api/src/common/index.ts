/**
 * @file index.ts
 * @description Barrel export principal para el módulo common
 *
 * Permite importar todo desde '@common' o './common'
 * Ejemplo: import { ApiResponses, HttpExceptionFilter, PaginationUtil } from './common';
 */

// ============================================================
// TYPES - Tipos estrictos sin 'any'
// ============================================================
export * from "./types";

// ============================================================
// DTOs - Data Transfer Objects
// ============================================================
export {
  // Response DTOs
  ApiSuccessResponseDto,
  ApiErrorResponseDto,
  PaginatedResponseDto,
  PaginationMetaDto,
  OperationResponseDto,
  // Helpers
  ApiResponses,
  // Aliases para compatibilidad
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginatedResponseMeta,
  OperationResponse,
} from "./dto/api-response.dto";

export {
  PaginationQueryDto,
  PaginationWithSortDto,
  SearchPaginationDto,
  SortQueryDto,
} from "./dto/pagination.dto";

// ============================================================
// FILTERS - Manejo de excepciones
// ============================================================
export { HttpExceptionFilter } from "./filters/http-exception.filter";
export {
  PrismaExceptionFilter,
  PrismaValidationFilter,
  PrismaConnectionFilter,
  PrismaPanicFilter,
} from "./filters/prisma-exception.filter";

// ============================================================
// GUARDS - Autenticación y Autorización
// ============================================================
export { JwtAuthGuard } from "./guards/jwt-auth.guard";
export { RolesGuard } from "./guards/roles.guard";

// ============================================================
// DECORATORS - Decoradores personalizados
// ============================================================
export {
  CurrentUser,
  type JwtPayload,
} from "./decorators/current-user.decorator";
export { Public, IS_PUBLIC_KEY } from "./decorators/public.decorator";
export {
  Roles,
  ROLES_KEY,
  isValidRole,
} from "./decorators/roles.decorator";
export { UserRole } from "./enums/user-role.enum";
export {
  ApiSuccessResponse as SwaggerSuccessResponse,
  ApiCreatedResponse,
  ApiPaginatedResponse,
  ApiErrorResponses,
  ApiStandardResponses,
  SkipTransform,
} from "./decorators/api-response.decorator";

// ============================================================
// INTERCEPTORS - Request/Response interceptors
// ============================================================
export { LoggingInterceptor } from "./interceptors/logging.interceptor";
export {
  TransformInterceptor,
  TimeoutInterceptor,
  SKIP_TRANSFORM_KEY,
} from "./interceptors/transform.interceptor";

// ============================================================
// PIPES - Validación y transformación
// ============================================================
export {
  ZodValidationPipe,
  createZodValidationPipe,
} from "./pipes/zod-validation.pipe";
export {
  ParseIntSafePipe,
  ParseIdPipe,
  ParseUuidPipe,
  ParseBoolPipe,
  type ParseIntPipeOptions,
} from "./pipes/parse-int.pipe";

// ============================================================
// UTILS - Utilidades
// ============================================================
export {
  PaginationUtil,
  type PaginationQuery,
  type PaginatedResult,
  type PaginateOptions,
  type PrismaModelDelegate,
} from "./utils/pagination.util";

// ============================================================
// ERRORS - Errores personalizados
// ============================================================
export {
  // Domain errors
  DomainError,
  EntityNotFoundError,
  BusinessRuleViolationError,
  InvalidOperationError,
  InvalidEntityStateError,
  DuplicateEntityError,
  InsufficientPermissionError,
  // Application errors
  ApplicationError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalError,
  ServiceUnavailableError,
  // Mapper
  PrismaErrorMapper,
} from "./errors";

// ============================================================
// INTERFACES - Contratos
// ============================================================
export {
  type IUseCase,
  type IUseCaseVoid,
  type IQuery,
  type IQueryVoid,
  type ICommandHandler,
  type IQueryHandler,
} from "./interfaces/use-case.interface";

export {
  type IRepository,
  type ISoftDeleteRepository,
  type IPaginatedRepository,
  type ISearchableRepository,
  type IFullRepository,
} from "./interfaces/repository.interface";
