/**
 * @test ToggleUserActiveUseCase Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ToggleUserActiveUseCase } from '../../../application/use-cases/toggle-user-active.use-case';
import { USER_REPOSITORY, IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';

describe('ToggleUserActiveUseCase', () => {
  let useCase: ToggleUserActiveUseCase;
  let repository: jest.Mocked<IUserRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<Partial<IUserRepository>> = {
      findById: jest.fn(),
      save: jest.fn(),
      countAdmins: jest.fn(),
      countByRole: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleUserActiveUseCase,
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

    useCase = module.get<ToggleUserActiveUseCase>(ToggleUserActiveUseCase);
    repository = module.get(USER_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  const createMockUser = async (role: string = 'tecnico') => {
    const user = await UserEntity.create({
      email: 'test@cermont.com',
      name: 'Juan Pérez',
      plainPassword: 'SecurePass123!',
      role,
    });
    user.clearDomainEvents();
    return user;
  };

  describe('execute - deactivate', () => {
    it('should deactivate user successfully', async () => {
      const mockUser = await createMockUser('tecnico');
      repository.findById.mockResolvedValue(mockUser);
      repository.save.mockImplementation(async (user) => user);

      const result = await useCase.execute({
        userId: mockUser.id.getValue(),
        active: false,
        reason: 'Test reason',
        changedBy: 'admin-id',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('desactivado');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'UserDeactivatedEvent',
        expect.anything(),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId: 'non-existent',
          active: false,
          changedBy: 'admin-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to deactivate self', async () => {
      const mockUser = await createMockUser('admin');
      const userId = mockUser.id.getValue();
      repository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId,
          active: false,
          changedBy: userId,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        useCase.execute({
          userId,
          active: false,
          changedBy: userId,
        }),
      ).rejects.toThrow('No puedes desactivar tu propia cuenta');
    });

    it('should throw BadRequestException when deactivating last active admin', async () => {
      const mockUser = await createMockUser('admin');
      repository.findById.mockResolvedValue(mockUser);
      repository.countByRole.mockResolvedValue(1); // Last active admin

      await expect(
        useCase.execute({
          userId: mockUser.id.getValue(),
          active: false,
          changedBy: 'other-admin-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('execute - activate', () => {
    it('should activate user successfully', async () => {
      const mockUser = await createMockUser('tecnico');
      // Deactivate first
      mockUser.deactivate('admin-id');
      mockUser.clearDomainEvents();
      
      repository.findById.mockResolvedValue(mockUser);
      repository.save.mockImplementation(async (user) => user);

      const result = await useCase.execute({
        userId: mockUser.id.getValue(),
        active: true,
        changedBy: 'admin-id',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('activado');
    });

    it('should throw error when activating already active user', async () => {
      const mockUser = await createMockUser('tecnico');
      repository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId: mockUser.id.getValue(),
          active: true,
          changedBy: 'admin-id',
        }),
      ).rejects.toThrow('El usuario ya está activo');
    });
  });
});
