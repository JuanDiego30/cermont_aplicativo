import { ConfigService } from '@nestjs/config';

import { EmailQueueService } from './email-queue.service';

function makeConfig(map: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => map[key],
  } as unknown as ConfigService;
}

describe(EmailQueueService.name, () => {
  it('processes batch immediately in mock mode', async () => {
    const emailService = {
      sendEmail: jest.fn().mockResolvedValue({ messageId: 'x' }),
    } as any;

    const config = makeConfig({
      EMAIL_MAX_ATTEMPTS: '2',
      EMAIL_RETRY_DELAY_MS: '0',
    });

    const queue = new EmailQueueService(config, emailService);
    await queue.onModuleInit();

    await queue.enqueueBatch([
      { to: 'a@b.com', subject: '1', text: 'a' },
      { to: 'c@d.com', subject: '2', text: 'b' },
    ]);

    expect(emailService.sendEmail).toHaveBeenCalledTimes(2);
  });
});
