// Mock de Prisma para tests
jest.mock('../infra/db/prisma', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    refreshToken: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

// Configuración global para tests
beforeAll(async () => {
  // Setup antes de todos los tests
});

afterAll(async () => {
  // Cleanup después de todos los tests
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpiar mocks después de cada test
  jest.clearAllMocks();
});

// Aumentar timeout global
jest.setTimeout(30000);
