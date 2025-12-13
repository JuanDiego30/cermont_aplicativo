/**
 * @test ChangeUserRoleUseCase Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChangeUserRoleUseCase } from '../../../application/use-cases/change-user-role.use-case';
import { USER_REPOSITORY, IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';

describe('ChangeUserRoleUseCase', () => {
  let useCase: ChangeUserRoleUseCase;
  let repository: jest.Mocked<IUserRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<Partial<IUserRepository>> = {
      findById: jest.fn(),
      save: jest.fn(),
      countAdmins: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeUserRoleUseCase,
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

    useCase = module.get<ChangeUserRoleUseCase>(ChangeUserRoleUseCase);
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

  describe('execute', () => {
    it('should change user role successfully', async () => {
      const mockUser = await createMockUser('tecnico');
      repository.findById.mockResolvedValue(mockUser);
      repository.save.mockImplementation(async (user) => user);
      repository.countAdmins.mockResolvedValue(2);

      const result = await useCase.execute({
        userId: mockUser.id.getValue(),
        newRole: 'supervisor',
        changedBy: 'admin-id',
      });

      expect(result.role).toBe('supervisor');
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'RoleChangedEvent',
        expect.anything(),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId: 'non-existent-id',
          newRole: 'supervisor',
          changedBy: 'admin-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when admin tries to remove own admin role', async () => {
      const mockUser = await createMockUser('admin');
      const userId = mockUser.id.getValue();
      
      repository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId,
          newRole: 'supervisor',
          changedBy: userId, // Same user
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        useCase.execute({
          userId,
          newRole: 'supervisor',
          changedBy: userId,
        }),
      ).rejects.toThrow('No puedes quitarte el rol de administrador');
    });

    it('should throw BadRequestException when trying to change last admin role', async () => {
      const mockUser = await createMockUser('admin');
      repository.findById.mockResolvedValue(mockUser);
      repository.countAdmins.mockResolvedValue(1); // Last admin

      await expect(
        useCase.execute({
          userId: mockUser.id.getValue(),
          newRole: 'supervisor',
          changedBy: 'other-admin-id',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        useCase.execute({
          userId: mockUser.id.getValue(),
          newRole: 'supervisor',
          changedBy: 'other-admin-id',
        }),
      ).rejects.toThrow('No se puede cambiar el rol del único administrador');
    });

    it('should allow changing to same role to throw domain error', async () => {
      const mockUser = await createMockUser('tecnico');
      repository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId: mockUser.id.getValue(),
          newRole: 'tecnico',
          changedBy: 'admin-id',
        }),
      ).rejects.toThrow('El usuario ya tiene ese rol');
    });
  });
});
