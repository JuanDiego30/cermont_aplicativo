import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RegisterUseCase } from "../application/use-cases/register.use-case";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("RegisterUseCase", () => {
  const mockAuthRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    createRefreshToken: jest.fn(),
    createAuditLog: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("si el email ya existe lanza Conflict", async () => {
    mockAuthRepository.findByEmail.mockResolvedValue({ id: "existing" });

    const useCase = new RegisterUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
    );

    await expect(
      useCase.execute(
        {
          email: "test@example.com",
          password: "Password1!",
          name: "Test",
          role: "tecnico",
        } as any,
        {},
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("registro válido crea usuario, emite audit y retorna token", async () => {
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue("hashed-password");
    mockAuthRepository.findByEmail.mockResolvedValue(null);
    mockJwtService.sign.mockReturnValue("access-token");

    const createdUser = {
      id: "user-1",
      email: { getValue: () => "test@example.com" },
      name: "Test",
      role: "tecnico",
      avatar: null,
      phone: null,
    };

    mockAuthRepository.create.mockResolvedValue(createdUser);
    mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);
    mockAuthRepository.createAuditLog.mockResolvedValue(undefined);

    const useCase = new RegisterUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
    );

    const result = await useCase.execute(
      {
        email: "test@example.com",
        password: "Password1!",
        name: "Test",
        role: "administrativo",
      } as any,
      { ip: "127.0.0.1", userAgent: "jest" },
    );

    // role 'administrativo' es un rol válido y se mantiene
    expect(mockAuthRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: "administrativo" }),
    );

    expect(result.token).toBe("access-token");
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe("user-1");
    expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "REGISTER", userId: "user-1" }),
    );
  });
});
