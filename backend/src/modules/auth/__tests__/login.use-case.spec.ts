import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { LoginUseCase } from "../application/use-cases/login.use-case";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

describe("LoginUseCase", () => {
  const mockAuthRepository = {
    findByEmail: jest.fn(),
    createRefreshToken: jest.fn(),
    updateLastLogin: jest.fn(),
    createAuditLog: jest.fn(),
    incrementLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockVerify2FACodeUseCase = {
    execute: jest.fn(),
  };

  const mockSend2FACodeUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify2FACodeUseCase.execute.mockResolvedValue({
      valid: true,
      userId: "user-1",
    });
    mockSend2FACodeUseCase.execute.mockResolvedValue({
      message: "sent",
      expiresIn: 300,
    });
    mockAuthRepository.incrementLoginAttempts.mockResolvedValue(undefined);
    mockAuthRepository.resetLoginAttempts.mockResolvedValue(undefined);
  });

  it("login válido retorna token + refreshToken", async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue("access-token");

    const user = {
      id: "user-1",
      active: true,
      role: "tecnico",
      name: "Test User",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      email: { getValue: () => "test@example.com" },
      canLogin: jest.fn(() => true),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => "hashed"),
    };

    mockAuthRepository.findByEmail.mockResolvedValue(user);
    mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);
    mockAuthRepository.updateLastLogin.mockResolvedValue(undefined);
    mockAuthRepository.createAuditLog.mockResolvedValue(undefined);

    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    const result = await useCase.execute(
      { email: "test@example.com", password: "Password1!", rememberMe: false },
      { ip: "127.0.0.1", userAgent: "jest" },
    );

    if (result.requires2FA) {
      throw new Error("Expected token response, got requires2FA");
    }
    expect(result.token).toBe("access-token");
    expect(result.refreshToken).toBeDefined();
    expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("login admin sin twoFactorCode retorna requires2FA y envía código", async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    const user = {
      id: "admin-1",
      active: true,
      role: "admin",
      name: "Admin",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      twoFactorEnabled: true, // Requerido para que 2FA funcione
      email: { getValue: () => "admin@cermont.com" },
      canLogin: jest.fn(() => true),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => "hashed"),
    };

    mockAuthRepository.findByEmail.mockResolvedValue(user);
    mockAuthRepository.createAuditLog.mockResolvedValue(undefined);

    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    const result = await useCase.execute(
      { email: "admin@cermont.com", password: "Password1!" } as any,
      { ip: "127.0.0.1", userAgent: "jest" },
    );

    expect(result.requires2FA).toBe(true);
    expect(mockSend2FACodeUseCase.execute).toHaveBeenCalledWith(
      "admin@cermont.com",
    );
  });

  it("login con rememberMe=true usa refresh token de 7 días", async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue("access-token");

    const user = {
      id: "user-1",
      active: true,
      role: "tecnico",
      name: "Test User",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      email: { getValue: () => "test@example.com" },
      canLogin: jest.fn(() => true),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => "hashed"),
    };

    mockAuthRepository.findByEmail.mockResolvedValue(user);
    mockAuthRepository.createRefreshToken.mockResolvedValue(undefined);
    mockAuthRepository.updateLastLogin.mockResolvedValue(undefined);
    mockAuthRepository.createAuditLog.mockResolvedValue(undefined);

    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    const before = Date.now();
    await useCase.execute(
      { email: "test@example.com", password: "Password1!", rememberMe: true },
      { ip: "127.0.0.1", userAgent: "jest" },
    );
    const after = Date.now();

    const callArg = (mockAuthRepository.createRefreshToken as jest.Mock).mock
      .calls[0][0];
    expect(callArg.expiresAt).toBeInstanceOf(Date);
    const expiresAtMs = new Date(callArg.expiresAt).getTime();
    const daysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + daysMs - 2000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + daysMs + 2000);
  });

  it("login con credenciales inválidas (sin email/password) retorna 401", async () => {
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute({ email: "", password: "" } as any, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("login de usuario bloqueado retorna 403", async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    const user = {
      id: "user-2",
      active: false,
      role: "tecnico",
      name: "Blocked",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      email: { getValue: () => "blocked@example.com" },
      canLogin: jest.fn(() => false),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => "hashed"),
    };

    mockAuthRepository.findByEmail.mockResolvedValue(user);

    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "blocked@example.com", password: "Password1!" },
        {},
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("login con email inválido retorna 401", async () => {
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "bad-email", password: "Password1!" } as any,
        {},
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("login falla si el usuario no existe (401)", async () => {
    mockAuthRepository.findByEmail.mockResolvedValue(null);
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "test@example.com", password: "Password1!" } as any,
        {},
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("login falla si el usuario no tiene hash de password (401)", async () => {
    mockAuthRepository.findByEmail.mockResolvedValue({
      id: "user-3",
      active: true,
      role: "tecnico",
      name: "NoPass",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      email: { getValue: () => "x@x.com" },
      canLogin: jest.fn(() => true),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => null),
    });
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute({ email: "x@x.com", password: "Password1!" } as any, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("login falla si la contraseña no coincide (401)", async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    mockAuthRepository.findByEmail.mockResolvedValue({
      id: "user-4",
      active: true,
      role: "tecnico",
      name: "BadPass",
      avatar: null,
      phone: null,
      loginAttempts: 0,
      email: { getValue: () => "x@x.com" },
      canLogin: jest.fn(() => true),
      isLocked: jest.fn(() => false),
      getPasswordHash: jest.fn(() => "hashed"),
    });
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute({ email: "x@x.com", password: "Password1!" } as any, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("re-throw de HttpException-like (evita envolver en 500)", async () => {
    const httpLike = {
      getStatus: () => 401,
      getResponse: () => ({ message: "No autorizado" }),
    };
    mockAuthRepository.findByEmail.mockImplementation(() => {
      throw httpLike;
    });
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "test@example.com", password: "Password1!" } as any,
        {},
      ),
    ).rejects.toBe(httpLike);
  });

  it("si el repo lanza ValidationError, retorna 401 (no 500)", async () => {
    const validationErr = Object.assign(new Error("bad"), {
      name: "ValidationError",
    });
    mockAuthRepository.findByEmail.mockRejectedValue(validationErr);
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "test@example.com", password: "Password1!" } as any,
        {},
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("si ocurre error inesperado, retorna 500", async () => {
    mockAuthRepository.findByEmail.mockRejectedValue(new Error("boom"));
    const useCase = new LoginUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockVerify2FACodeUseCase as any,
      mockSend2FACodeUseCase as any,
    );

    await expect(
      useCase.execute(
        { email: "test@example.com", password: "Password1!" } as any,
        {},
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
