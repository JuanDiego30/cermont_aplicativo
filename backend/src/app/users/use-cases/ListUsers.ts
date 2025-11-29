import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { UserRole } from '../../../shared/constants/roles.js';
import { logger } from '../../../shared/utils/logger.js';

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_SEARCH_LENGTH: 2,
} as const;

const ERROR_MESSAGES = {
  INVALID_PAGE: 'El número de página debe ser mayor a 0',
  INVALID_LIMIT: `El límite debe estar entre 1 y ${PAGINATION_CONFIG.MAX_LIMIT}`,
  INVALID_ROLE: (validRoles: string[]) =>
    `Rol inválido. Valores permitidos: ${validRoles.join(', ')}`,
  SEARCH_TOO_SHORT: `El término de búsqueda debe tener al menos ${PAGINATION_CONFIG.MIN_SEARCH_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ListUsersUseCase]',
} as const;

interface ListUsersInput {
  page?: number;
  limit?: number;
  role?: UserRole;
  active?: boolean;
  search?: string;
}

interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface ListUsersOutput {
  data: Omit<User, 'password'>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ListUsersInput = {}): Promise<ListUsersOutput> {
    this.validateInput(input);

    const filters = this.buildFilters(input);
    const pagination = this.buildPagination(input);

    const [users, total] = await Promise.all([
      this.userRepository.findAll(filters, pagination),
      this.userRepository.count(filters),
    ]);

    const sanitizedUsers = this.sanitizeUsers(users);
    const totalPages = Math.ceil(total / pagination.limit);
    const hasMore = pagination.page < totalPages;
    const hasPrevious = pagination.page > 1;

    return {
      data: sanitizedUsers,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore,
        hasPrevious,
      },
    };
  }

  private validateInput(input: ListUsersInput): void {
    if (input.page !== undefined && input.page < 1) {
      throw new Error(ERROR_MESSAGES.INVALID_PAGE);
    }

    if (input.limit !== undefined) {
      if (input.limit < 1 || input.limit > PAGINATION_CONFIG.MAX_LIMIT) {
        throw new Error(ERROR_MESSAGES.INVALID_LIMIT);
      }
    }

    if (input.role !== undefined) {
      this.validateUserRole(input.role);
    }

    if (input.search !== undefined && input.search.trim().length > 0) {
      if (input.search.trim().length < PAGINATION_CONFIG.MIN_SEARCH_LENGTH) {
        throw new Error(ERROR_MESSAGES.SEARCH_TOO_SHORT);
      }
    }
  }

  private validateUserRole(role: string): void {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new Error(ERROR_MESSAGES.INVALID_ROLE(validRoles));
    }
  }

  private buildFilters(input: ListUsersInput): UserFilters {
    return {
      role: input.role,
      active: input.active,
      search: input.search?.trim() || undefined,
    };
  }

  private buildPagination(input: ListUsersInput): PaginationParams {
    const page = input.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(
      input.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      PAGINATION_CONFIG.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private sanitizeUsers(users: User[]): Omit<User, 'password'>[] {
    return users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }
}





