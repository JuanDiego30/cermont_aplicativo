import { NotFoundException } from "@nestjs/common";
import { GetCurrentUserUseCase } from "../application/use-cases/get-current-user.use-case";

describe("GetCurrentUserUseCase", () => {
  it("retorna el usuario actual", async () => {
    const authRepository = {
      findUserById: jest.fn().mockResolvedValue({
        id: "user-1",
        email: { getValue: () => "test@example.com" },
        name: "Test",
        role: "tecnico",
        avatar: null,
      }),
    };

    const useCase = new GetCurrentUserUseCase(authRepository as any);

    const result = await useCase.execute("user-1");

    expect(authRepository.findUserById).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      role: "tecnico",
      avatar: undefined,
    });
  });

  it("si no existe el usuario lanza NotFound", async () => {
    const authRepository = {
      findUserById: jest.fn().mockResolvedValue(null),
    };

    const useCase = new GetCurrentUserUseCase(authRepository as any);

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
