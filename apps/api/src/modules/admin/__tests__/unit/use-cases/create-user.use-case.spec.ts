/**
 * @test CreateUserUseCase Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { USER_REPOSITORY, IUserRepository } from '../../../domain/repositories/user.repository.interface';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: jest.Mocked<IUserRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<Partial<IUserRepository>> = {
      existsByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repository = module.get(USER_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('execute', () => {
    const validCommand = {
      email: 'test@cermont.com',
      name: 'Juan Pérez',
      password: 'SecurePass123!',
      role: 'tecnico' as const,
      createdBy: 'admin-uuid',
    };

    it('should create user successfully', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      repository.save.mockImplementation(async (user) => user);

      const result = await useCase.execute(validCommand);

      expect(result).toBeDefined();
      expect(result.email).toBe('test@cermont.com');
      expect(result.name).toBe('Juan Pérez');
      expect(result.role).toBe('tecnico');
      expect(result.active).toBe(true);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      repository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(validCommand)).rejects.toThrow(ConflictException);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Email test@cermont.com ya está registrado',
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      repository.existsByEmail.mockResolvedValue(false);

      const invalidCommand = { ...validCommand, password: 'weak' };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow();
    });

    it('should throw error for invalid role', async () => {
      repository.existsByEmail.mockResolvedValue(false);

      const invalidCommand = { ...validCommand, role: 'invalid' as any };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow('Rol inválido');
    });

    it('should emit UserCreatedEvent after creation', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      repository.save.mockImplementation(async (user) => user);

      await useCase.execute(validCommand);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'UserCreatedEvent',
        expect.objectContaining({
          email: 'test@cermont.com',
          role: 'tecnico',
        }),
      );
    });

    it('should handle optional phone and avatar', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      repository.save.mockImplementation(async (user) => user);

      const commandWithOptionals = {
        ...validCommand,
        phone: '+57 3001234567',
        avatar: 'https://example.com/avatar.jpg',
      };

      const result = await useCase.execute(commandWithOptionals);

      expect(result.phone).toBe('+57 3001234567');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
    });
  });
});
