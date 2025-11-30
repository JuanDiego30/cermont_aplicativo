/**
 * DI Container (Manual Composition Root)
 * 
 * This file acts as the central point for dependency injection.
 * It instantiates repositories, services, and controllers, injecting dependencies manually.
 */

// Repositories
import { userRepository } from '../../infra/db/repositories/UserRepository.js';
import { revokedTokenRepository } from '../../infra/db/repositories/RevokedTokenRepository.js';
import { refreshTokenRepository } from '../../infra/db/repositories/RefreshTokenRepository.js';
import { auditLogRepository } from '../../infra/db/repositories/AuditLogRepository.js';
import { passwordResetRepository } from '../../infra/db/repositories/PasswordResetRepository.js';

// Services (Domain)
import { AuthService } from '../../domain/services/AuthService.js';
import { AuditService } from '../../domain/services/AuditService.js';

// Adapters
import { jwtService } from '../../infra/adapters/security/jwtService.js';
import { RefreshTokenService } from '../../infra/adapters/security/RefreshTokenService.js';
import { passwordHasher } from '../../infra/adapters/security/passwordHasher.js';

// Services (Other)
import { emailService } from '../../infra/services/EmailService.js';

// Use Cases
import { CreateOrderUseCase } from '../../app/orders/use-cases/CreateOrder.js';

// Controllers
import { AuthController } from '../../infra/http/controllers/AuthController.js';
import { OrdersController } from '../../infra/http/controllers/OrdersController.js';

// Facades
import { AuthFacade } from '../../infra/http/facades/index.js';

// Middlewares
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';
import { OrderService } from '../../domain/services/OrderService.js';
import { orderRepository } from '../../infra/db/repositories/OrderRepository.js';

// ============================================================================
// Instances
// ============================================================================

// Services
const refreshTokenService = new RefreshTokenService(refreshTokenRepository);
const auditService = new AuditService(auditLogRepository);

const authService = new AuthService(
    userRepository,
    revokedTokenRepository,
    jwtService,
    refreshTokenService,
    auditService,
    passwordHasher
);

// Use Cases
const createOrderUseCase = new CreateOrderUseCase(orderRepository, auditService);

// Domain Services
const orderService = new OrderService(
    orderRepository,
    auditService,
    createOrderUseCase
);

// Middlewares
const authMiddleware = new AuthMiddleware(
    revokedTokenRepository,
    jwtService
);

// Facades
const authFacade = new AuthFacade({
    authService,
    userRepository,
    refreshTokenService,
    passwordResetRepository,
    auditLogRepository,
    emailService,
    refreshTokenRepository,
});

// Controllers
const authController = new AuthController(authFacade);

const ordersController = new OrdersController(
    orderService,
    auditLogRepository
);

export const container = {
    authService,
    auditService,
    refreshTokenService,
    authController,
    authMiddleware,
    ordersController,
};
