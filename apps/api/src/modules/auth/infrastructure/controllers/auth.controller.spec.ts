/**
 * @test AuthControllerRefactored
 * @description Unit tests for AuthController
 * @layer Infrastructure
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthControllerRefactored } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { LoggerService } from '../../../../lib/logging/logger.service';

describe('AuthControllerRefactored', () => {
    let controller: AuthControllerRefactored;

    // Mock implementations
    const mockLoginUseCase = { execute: jest.fn() };
    const mockRegisterUseCase = { execute: jest.fn() };
    const mockRefreshTokenUseCase = { execute: jest.fn() };
    const mockLogoutUseCase = { execute: jest.fn() };
    const mockGetCurrentUserUseCase = { execute: jest.fn() };
    const mockLoggerService = {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };

    const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-user-agent'),
        cookies: {},
        header: jest.fn(),
    };

    const mockResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    };

    const mockUser = {
        userId: 'user-123',
        email: 'test@test.com',
        role: 'admin',
        jti: 'jti-123',
        iat: Date.now(),
        exp: Date.now() + 3600000,
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthControllerRefactored],
            providers: [
                { provide: LoginUseCase, useValue: mockLoginUseCase },
                { provide: RegisterUseCase, useValue: mockRegisterUseCase },
                { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
                { provide: LogoutUseCase, useValue: mockLogoutUseCase },
                { provide: GetCurrentUserUseCase, useValue: mockGetCurrentUserUseCase },
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        controller = module.get<AuthControllerRefactored>(AuthControllerRefactored);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return token on successful login', async () => {
            const dto = { email: 'test@test.com', password: 'Password123!' };
            const expectedResult = {
                message: 'Login exitoso',
                token: 'jwt-token-123',
                refreshToken: 'refresh-token-123',
                user: { id: 'user-123', email: 'test@test.com', role: 'admin' },
            };

            mockLoginUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.login(dto as any, mockRequest as any, mockResponse as any);

            expect(mockLoginUseCase.execute).toHaveBeenCalled();
            expect(mockResponse.cookie).toHaveBeenCalled();
            expect(result.token).toBe('jwt-token-123');
        });

        it('should return 2FA required when enabled', async () => {
            const dto = { email: 'test@test.com', password: 'Password123!' };
            const expectedResult = {
                requires2FA: true,
                message: 'Código 2FA enviado',
                expiresIn: 300,
            };

            mockLoginUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.login(dto as any, mockRequest as any, mockResponse as any);

            expect(result.requires2FA).toBe(true);
        });
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const dto = {
                email: 'new@test.com',
                password: 'Password123!',
                name: 'Test User',
            };
            const expectedResult = {
                message: 'Usuario registrado',
                token: 'jwt-token-new',
                refreshToken: 'refresh-token-new',
                user: { id: 'user-new', email: 'new@test.com' },
            };

            mockRegisterUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.register(dto as any, mockRequest as any, mockResponse as any);

            expect(mockRegisterUseCase.execute).toHaveBeenCalled();
            expect(mockResponse.cookie).toHaveBeenCalled();
            expect(result.token).toBe('jwt-token-new');
        });
    });

    describe('refresh', () => {
        it('should refresh tokens when provided in body', async () => {
            const expectedResult = {
                token: 'new-jwt-token',
                refreshToken: 'new-refresh-token',
            };

            // Send refreshToken in body only (no cookies = no CSRF check)
            const requestWithoutCookies = {
                ip: '127.0.0.1',
                get: jest.fn().mockReturnValue('test-user-agent'),
                cookies: undefined,
                header: jest.fn(),
            };

            mockRefreshTokenUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.refresh(
                requestWithoutCookies as any,
                { refreshToken: 'old-refresh-token' },
                mockResponse as any
            );

            expect(mockRefreshTokenUseCase.execute).toHaveBeenCalled();
            expect(result.token).toBe('new-jwt-token');
        });
    });

    describe('me', () => {
        it('should return current user', async () => {
            const expectedUser = {
                id: 'user-123',
                email: 'test@test.com',
                name: 'Test User',
                role: 'admin',
            };

            mockGetCurrentUserUseCase.execute.mockResolvedValue(expectedUser);

            const result = await controller.me(mockUser as any);

            expect(mockGetCurrentUserUseCase.execute).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(expectedUser);
        });
    });
});
