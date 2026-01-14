import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.use-case";

describe("RefreshTokenUseCase", () => {
  const mockAuthRepository = {
    findSessionByToken: jest.fn(),
    revokeSessionFamily: jest.fn(),
    revokeSession: jest.fn(),
    findUserById: jest.fn(),
    createSession: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("refresh válido retorna nuevo access token y refresh token", async () => {
    mockJwtService.sign.mockReturnValue("new-access");

    const session = {
      id: "sess-1",
      userId: "user-1",
      family: "fam-1",
      isRevoked: false,
      isExpired: false,
      rotate: jest.fn(() => ({ refreshToken: "new-refresh" })),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);
    mockAuthRepository.findUserById.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      role: "tecnico",
      active: true,
    });

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockEventEmitter as any,
    );

    const result = await useCase.execute("old-refresh", {
      ip: "127.0.0.1",
      userAgent: "jest",
    });

    expect(result.token).toBe("new-access");
    expect(result.refreshToken).toBe("new-refresh");
    expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith(
      "old-refresh",
    );
    expect(mockAuthRepository.createSession).toHaveBeenCalledWith({
      refreshToken: "new-refresh",
    });
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });

  it("refresh token robado (revoked) retorna 401 y revoca familia", async () => {
    const session = {
      id: "sess-2",
      userId: "user-1",
      family: "fam-2",
      isRevoked: true,
      isExpired: false,
      rotate: jest.fn(),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockEventEmitter as any,
    );

    await expect(useCase.execute("rt", {} as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(mockAuthRepository.revokeSessionFamily).toHaveBeenCalledWith(
      "fam-2",
    );
  });

  it("refresh token expirado retorna 401", async () => {
    const session = {
      id: "sess-3",
      userId: "user-1",
      family: "fam-3",
      isRevoked: false,
      isExpired: true,
      rotate: jest.fn(),
    };

    mockAuthRepository.findSessionByToken.mockResolvedValue(session);

    const useCase = new RefreshTokenUseCase(
      mockAuthRepository as any,
      mockJwtService as any,
      mockEventEmitter as any,
    );

    await expect(useCase.execute("rt", {} as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(mockAuthRepository.revokeSession).not.toHaveBeenCalled();
  });
});
