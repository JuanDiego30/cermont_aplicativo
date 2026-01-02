import { ConfigService } from '@nestjs/config';

import { EmailService } from './email.service';

// `jest.mock(...)` se hoistea; usar `var` evita TDZ.
var sendMailMock: jest.Mock;
var createTransportMock: jest.Mock;
var createTestAccountMock: jest.Mock;
var getTestMessageUrlMock: jest.Mock;

jest.mock('nodemailer', () => {
  sendMailMock = jest.fn();
  createTransportMock = jest.fn((..._args: any[]) => ({ sendMail: sendMailMock }));
  createTestAccountMock = jest.fn((..._args: any[]) => undefined);
  getTestMessageUrlMock = jest.fn((..._args: any[]) => undefined);

  return {
    __esModule: true,
    default: {
      createTransport: createTransportMock,
      createTestAccount: createTestAccountMock,
      getTestMessageUrl: getTestMessageUrlMock,
    },
  };
});

function makeConfig(map: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => map[key],
  } as unknown as ConfigService;
}

describe(EmailService.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('envía email por SMTP en el primer intento', async () => {
    sendMailMock.mockResolvedValue({ messageId: 'abc', accepted: ['a@b.com'], rejected: [] });

    const config = makeConfig({
      NODE_ENV: 'development',
      SMTP_HOST: 'smtp.test',
      SMTP_PORT: '587',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
      EMAIL_FROM: 'from@test.com',
      EMAIL_RETRY_DELAY_MS: '0',
      EMAIL_MAX_ATTEMPTS: '3',
    });

    const service = new EmailService(config);
    await service.onModuleInit();

    const result = await service.sendEmail({
      to: 'a@b.com',
      subject: 'Hola',
      text: 'Texto',
    });

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(result.messageId).toBe('abc');
  });

  it('reintenta si el primer envío falla', async () => {
    sendMailMock
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValueOnce({ messageId: 'ok' });

    const config = makeConfig({
      NODE_ENV: 'development',
      SMTP_HOST: 'smtp.test',
      SMTP_PORT: '587',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
      EMAIL_RETRY_DELAY_MS: '0',
      EMAIL_MAX_ATTEMPTS: '2',
    });

    const service = new EmailService(config);
    await service.onModuleInit();

    const result = await service.sendEmail({
      to: 'a@b.com',
      subject: 'Hola',
      text: 'Texto',
    });

    expect(sendMailMock).toHaveBeenCalledTimes(2);
    expect(result.messageId).toBe('ok');
  });

  it('en producción sin SMTP, no lanza error y omite envío', async () => {
    const config = makeConfig({
      NODE_ENV: 'production',
      EMAIL_MAX_ATTEMPTS: '3',
    });

    const service = new EmailService(config);
    await service.onModuleInit();

    const result = await service.sendEmail({
      to: 'a@b.com',
      subject: 'Hola',
      text: 'Texto',
    });

    expect(createTransportMock).toHaveBeenCalledTimes(0);
    expect(createTestAccountMock).toHaveBeenCalledTimes(0);
    expect(sendMailMock).toHaveBeenCalledTimes(0);
    expect(result).toEqual({});
  });

  it('en desarrollo sin SMTP, usa Ethereal como fallback', async () => {
    createTestAccountMock.mockResolvedValue({ user: 'eth-user', pass: 'eth-pass' });
    sendMailMock.mockResolvedValue({ messageId: 'eth-1' });

    const config = makeConfig({
      NODE_ENV: 'development',
      EMAIL_MAX_ATTEMPTS: '1',
      EMAIL_RETRY_DELAY_MS: '0',
    });

    const service = new EmailService(config);
    await service.onModuleInit();

    const result = await service.sendEmail({
      to: 'a@b.com',
      subject: 'Hola',
      text: 'Texto',
    });

    expect(createTestAccountMock).toHaveBeenCalledTimes(1);
    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(result.messageId).toBe('eth-1');
  });
});
