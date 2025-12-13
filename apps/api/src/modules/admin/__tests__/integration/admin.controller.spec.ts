/**
 * @test AdminController Integration Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminController } from '../../../infrastructure/controllers/admin.controller';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';

// Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangeUserRoleUseCase,
  ToggleUserActiveUseCase,
  ResetPasswordUseCase,
  ListUsersUseCase,
  GetUserByIdUseCase,
  GetUserStatsUseCase,
} from '../../../application/use-cases';

// Mock JWT Guard
const mockJwtAuthGuard = {
  canActivate: () => true,
};

// Mock Roles Guard
const mockRolesGuard = {
  canActivate: () => true,
};

// Mock CurrentUser decorator
const mockCurrentUser = {
  userId: 'admin-test-id',
  email: 'admin@test.com',
  role: 'admin',
};

describe('AdminController (Integration)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<any>;

  const createMockUser = async (
    email: string = 'test@cermont.com',
    role: string = 'tecnico',
  ) => {
    const user = await UserEntity.create({
      email,
      name: 'Test User',
      plainPassword: 'SecurePass123!',
      role,
    });
    user.clearDomainEvents();
    return user;
  };

  beforeAll(async () => {
    repository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
      countByRole: jest.fn(),
      countActive: jest.fn(),
      getStats: jest.fn(),
      findByRole: jest.fn(),
      countAdmins: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [AdminController],
      providers: [
        {
          provide: USER_REPOSITORY,
          useValue: repository,
        },
        CreateUserUseCase,
        UpdateUserUseCase,
        ChangeUserRoleUseCase,
        ToggleUserActiveUseCase,
        ResetPasswordUseCase,
        ListUsersUseCase,
        GetUserByIdUseCase,
        GetUserStatsUseCase,
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue(mockJwtAuthGuard)
      .overrideGuard('RolesGuard')
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/users', () => {
    it('should create user with valid data', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      repository.save.mockImplementation(async (user) => user);

      const response = await request(app.getHttpServer())
        .post('/admin/users')
        .send({
          email: 'nuevo@cermont.com',
          name: 'Nuevo Usuario',
          password: 'SecurePass123!',
          role: 'tecnico',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario creado exitosamente');
      expect(response.body.data.email).toBe('nuevo@cermont.com');
    });

    it('should return 409 when email already exists', async () => {
      repository.existsByEmail.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/admin/users')
        .send({
          email: 'existente@cermont.com',
          name: 'Usuario Existente',
          password: 'SecurePass123!',
          role: 'tecnico',
        })
        .expect(409);

      expect(response.body.message).toContain('ya está registrado');
    });

    it('should return 400 with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .send({
          email: 'invalid-email',
          name: 'A',
          password: 'weak',
          role: 'invalid',
        })
        .expect(400);
    });
  });

  describe('GET /admin/users', () => {
    it('should return paginated users', async () => {
      const mockUsers = await Promise.all([
        createMockUser('user1@test.com'),
        createMockUser('user2@test.com'),
      ]);

      repository.findAll.mockResolvedValue({
        data: mockUsers,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
    });

    it('should filter by role', async () => {
      const mockUsers = [await createMockUser('admin@test.com', 'admin')];

      repository.findAll.mockResolvedValue({
        data: mockUsers,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .query({ role: 'admin' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].role).toBe('admin');
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user by ID', async () => {
      const mockUser = await createMockUser();
      repository.findById.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/admin/users/${mockUser.id.getValue()}`)
        .expect(200);

      expect(response.body.email).toBe('test@cermont.com');
    });

    it('should return 404 for non-existent user', async () => {
      repository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/admin/users/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/admin/users/invalid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('should change user role', async () => {
      const mockUser = await createMockUser('user@test.com', 'tecnico');
      repository.findById.mockResolvedValue(mockUser);
      repository.save.mockImplementation(async (user) => user);
      repository.countAdmins.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${mockUser.id.getValue()}/role`)
        .send({ role: 'supervisor' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('supervisor');
    });

    it('should return 400 for invalid role', async () => {
      const mockUser = await createMockUser();
      repository.findById.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .patch(`/admin/users/${mockUser.id.getValue()}/role`)
        .send({ role: 'invalid_role' })
        .expect(400);
    });
  });

  describe('GET /admin/stats/users', () => {
    it('should return user statistics', async () => {
      repository.getStats.mockResolvedValue({
        total: 50,
        activos: 45,
        porRol: {
          admin: 2,
          supervisor: 5,
          tecnico: 30,
          administrativo: 13,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/admin/stats/users')
        .expect(200);

      expect(response.body.total).toBe(50);
      expect(response.body.activos).toBe(45);
      expect(response.body.porRol.admin).toBe(2);
    });
  });
});
