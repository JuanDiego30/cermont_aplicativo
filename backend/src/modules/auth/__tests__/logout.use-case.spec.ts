import { LogoutUseCase } from '../application/use-cases/logout.use-case';

describe('LogoutUseCase', () => {
  it('revoca sesión si refreshToken existe y emite evento', async () => {
    const authRepository = {
      revokeSession: jest.fn().mockResolvedValue(undefined),
    };

    const eventEmitter = {
      emit: jest.fn(),
    };

    const cache = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new LogoutUseCase(authRepository as any, eventEmitter as any, cache as any);

    const result = await useCase.execute('user-1', 'rt-1', '127.0.0.1');

    expect(authRepository.revokeSession).toHaveBeenCalledWith('rt-1');
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit.mock.calls[0][0]).toBe('auth.user.logged-out');
    expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
  });

  it('no revoca sesión si refreshToken no existe, pero emite evento', async () => {
    const authRepository = {
      revokeSession: jest.fn(),
    };

    const eventEmitter = {
      emit: jest.fn(),
    };

    const cache = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new LogoutUseCase(authRepository as any, eventEmitter as any, cache as any);

    await useCase.execute('user-1');

    expect(authRepository.revokeSession).not.toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith('auth.user.logged-out', expect.anything());
  });
});
