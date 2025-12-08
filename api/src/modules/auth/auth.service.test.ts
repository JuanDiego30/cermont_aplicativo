import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { AppError } from '../../shared/errors/index';
import { AuthRepository } from './auth.repository';
import bcrypt from 'bcryptjs';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password'),
        compare: vi.fn().mockResolvedValue(true),
    },
}));

// Mock del repository
vi.mock('./auth.repository', () => {
    const mockRepo = {
        findByEmail: vi.fn(),
        findById: vi.fn(),
        createUser: vi.fn(),
        updateLastLogin: vi.fn(),
        createAuditLog: vi.fn(),
        createRefreshToken: vi.fn(),
        findRefreshToken: vi.fn(),
        revokeRefreshToken: vi.fn(),
        revokeTokenFamily: vi.fn(),
        generateRefreshToken: vi.fn(),
        createPasswordResetToken: vi.fn(),
        findPasswordResetToken: vi.fn(),
        resetPasswordTransaction: vi.fn(),
    };
    return {
        AuthRepository: class { 
            findByEmail = mockRepo.findByEmail;
            findById = mockRepo.findById;
            createUser = mockRepo.createUser;
            updateLastLogin = mockRepo.updateLastLogin;
            createAuditLog = mockRepo.createAuditLog;
            createRefreshToken = mockRepo.createRefreshToken;
            findRefreshToken = mockRepo.findRefreshToken;
            revokeRefreshToken = mockRepo.revokeRefreshToken;
            revokeTokenFamily = mockRepo.revokeTokenFamily;
            generateRefreshToken = mockRepo.generateRefreshToken;
            createPasswordResetToken = mockRepo.createPasswordResetToken;
            findPasswordResetToken = mockRepo.findPasswordResetToken;
            resetPasswordTransaction = mockRepo.resetPasswordTransaction;
        },
        authRepository: mockRepo,
    };
});

describe('AuthService', () => {
    let service: AuthService;
    let mockRepository: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Obtener la instancia del mock (que es la misma que usa el singleton)
        mockRepository = new AuthRepository();
        service = new AuthService(mockRepository);
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: '1',
                email: 'test@test.com',
                password: 'hashed_password',
                name: 'Test User',
                role: 'tecnico',
                active: true,
            };

            mockRepository.findByEmail.mockResolvedValue(mockUser);
            mockRepository.createAuditLog.mockResolvedValue(undefined);
            mockRepository.updateLastLogin.mockResolvedValue(undefined);
            mockRepository.createRefreshToken.mockResolvedValue({ token: 'refresh-token', id: 'rt-1' });

            const result = await service.login(
                { email: 'test@test.com', password: 'password123' },
                '192.168.1.1',
                'Mozilla/5.0'
            );

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.id).toBe('1');
            expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
        });

        it('should throw error with invalid email', async () => {
            mockRepository.findByEmail.mockResolvedValue(null);

            await expect(
                service.login(
                    { email: 'invalid@test.com', password: 'password123' },
                    '192.168.1.1'
                )
            ).rejects.toThrow(AppError);
        });

        it('should throw error with wrong password', async () => {
            const mockUser = {
                id: '1',
                email: 'test@test.com',
                password: 'hashed_password',
                active: true,
            };

            // Force compare to return false for this test
            (bcrypt.compare as any).mockResolvedValueOnce(false);

            mockRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(
                service.login(
                    { email: 'test@test.com', password: 'wrongpassword' },
                    '192.168.1.1'
                )
            ).rejects.toThrow(AppError);
        });
    });

    describe('register', () => {
        it('should register new user successfully', async () => {
            mockRepository.findByEmail.mockResolvedValue(null);
            mockRepository.createUser.mockResolvedValue({
                id: '1',
                email: 'newuser@test.com',
                name: 'New User',
                role: 'tecnico',
                active: true,
            });
            mockRepository.createRefreshToken.mockResolvedValue({ token: 'refresh-token', id: 'rt-1' });
            mockRepository.createAuditLog.mockResolvedValue(undefined);

            const result = await service.register(
                {
                    email: 'newuser@test.com',
                    password: 'password123',
                    name: 'New User',
                    role: 'tecnico',
                },
                '192.168.1.1'
            );

            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('newuser@test.com');
        });

        it('should throw error if email already exists', async () => {
            mockRepository.findByEmail.mockResolvedValue({
                id: '1',
                email: 'existing@test.com',
            });

            await expect(
                service.register(
                    {
                        email: 'existing@test.com',
                        password: 'password123',
                        name: 'User',
                        role: 'tecnico',
                    },
                    '192.168.1.1'
                )
            ).rejects.toThrow(AppError);
        });
    });

    describe('validateToken', () => {
        it('should validate valid token', () => {
            const validToken = service.generateAccessToken('user-id', 'test@test.com', 'tecnico');
            const payload = service.validateToken(validToken);

            expect(payload).toBeDefined();
            expect(payload?.userId).toBe('user-id');
            expect(payload?.email).toBe('test@test.com');
        });

        it('should return null for invalid token', () => {
            const payload = service.validateToken('invalid-token');
            expect(payload).toBeNull();
        });
    });
});
