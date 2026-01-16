/**
 * Shared Types - Re-export for frontend compatibility
 *
 * Frontend models can import directly from @cermont/shared-types
 */

// DTOs - Auth
export {
  AuthResponse,
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  ListUsersQuery,
  LoginRequestDto,
  LoginResponseDto,
  PaginatedUsers,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
  User,
  UserDto,
  UserRole,
} from './dtos';

// DTOs - Pagination & Common
export {
  ApiErrorDto,
  ApiResponseDto,
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from './dtos';

// DTOs - Customers
export {
  CustomerContactInfo,
  CustomerLocationInfo,
  CreateContactDto,
  CreateLocationDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomersQueryDto,
  CustomerResponseDto,
  CustomerOrderSummaryDto,
  CustomerOrdersResponseDto,
  PaginatedCustomers,
  CustomerType,
} from './dtos';

// DTOs - Orders
export type {
  CreateOrderDto,
  UpdateOrderDto,
  ChangeOrderStatusDto,
  OrdersQueryDto,
  OrderResponseDto,
  OrderDetailResponseDto,
  OrderStatusHistoryItem,
  OrderEvidenceItem,
  OrderCostItem,
  PaginatedOrders,
  OrdersSummaryDto,
  OrderTechnicianInfo,
  OrderCustomerInfo,
  OrderLocationInfo,
} from './dtos';

// Enums
export {
  AlertSeverity,
  EvidenceType,
  InvoiceStatus,
  OrderPriority,
  OrderStatus,
  OrderType,
  TechnicianStatus,
} from './enums';

// Types
export {
  Address,
  AuditFields,
  BaseEntity,
  ContactInfo,
  Coordinates,
  DateRange,
  DeepPartial,
  EntityId,
  ISODateString,
  MoneyValue,
  Nullable,
  Optional,
  SoftDeletableEntity,
  UUID,
} from './types';
